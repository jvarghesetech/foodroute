import Anthropic from '@anthropic-ai/sdk';
import { HouseholdPayload, NeedsPayload, NeedsResponse } from './types';

const VALID_URGENCIES: Array<NeedsResponse['urgency']> = ['critical', 'high', 'moderate'];
const MAX_REASONING_LENGTH = 200;

const SYSTEM_PROMPT = `You are a food-security intake classifier for a Canadian food bank routing service. You are not a caseworker.
Given a household's situation and stated needs, classify urgency as one of: critical | high | moderate
- critical: household has no food today or within 24 hours, or includes young children/infants with no food
- high: household will run out of food within the week
- moderate: household is planning ahead or has some food remaining
Return ONLY JSON in this format: { "urgency": "critical | high | moderate", "reasoning": "short explanation" }
Reasoning must be under 2 sentences.`;

export class NeedClassifierError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_JSON' | 'INVALID_SCHEMA' | 'API_ERROR'
  ) {
    super(message);
    this.name = 'NeedClassifierError';
  }
}

/**
 * Strip markdown and extract JSON from model response (handles extra text before/after).
 */
function extractJSONString(text: string): string {
  let out = text.trim();

  // 1) Markdown code block: ```json ... ``` or ``` ... ```
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(out);
  if (codeBlock) {
    return codeBlock[1].trim();
  }

  // 2) Find first { and matching } to extract a single JSON object
  const firstBrace = out.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let end = -1;
    for (let i = firstBrace; i < out.length; i++) {
      if (out[i] === '{') depth++;
      else if (out[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end !== -1) {
      return out.slice(firstBrace, end + 1);
    }
  }

  return out;
}

/**
 * Parse and validate model JSON response. Throws NeedClassifierError if invalid.
 */
export function safeParseNeedsJSON(text: string): NeedsResponse {
  const raw = extractJSONString(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new NeedClassifierError('Invalid JSON in model response', 'INVALID_JSON');
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new NeedClassifierError('Response is not a JSON object', 'INVALID_SCHEMA');
  }

  const obj = parsed as Record<string, unknown>;
  const urgency = obj.urgency;
  const reasoning = obj.reasoning;

  if (typeof urgency !== 'string' || !VALID_URGENCIES.includes(urgency as NeedsResponse['urgency'])) {
    throw new NeedClassifierError(
      `Invalid urgency: must be one of ${VALID_URGENCIES.join(', ')}`,
      'INVALID_SCHEMA'
    );
  }

  if (typeof reasoning !== 'string') {
    throw new NeedClassifierError('reasoning must be a string', 'INVALID_SCHEMA');
  }

  const trimmedReasoning = reasoning.length > MAX_REASONING_LENGTH
    ? reasoning.slice(0, MAX_REASONING_LENGTH).trim()
    : reasoning;

  return {
    urgency: urgency as NeedsResponse['urgency'],
    reasoning: trimmedReasoning,
  };
}

export async function classifyNeeds(
  household: HouseholdPayload,
  needs: NeedsPayload
): Promise<NeedsResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new NeedClassifierError('ANTHROPIC_API_KEY is not set', 'API_ERROR');
  }

  const anthropic = new Anthropic({ apiKey });
  const modelId = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';

  const userContent =
    `Household: size=${household.householdSize} children=${household.hasChildren} accessibilityNeeds=${household.hasAccessibilityNeeds} note="${household.urgencyNote ?? ''}"\n` +
    `Needs: ${JSON.stringify(needs)}`;

  let lastError: NeedClassifierError | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await anthropic.messages.create({
        model: modelId,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userContent },
        ],
      });

      const textBlock = result.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : undefined;

      if (!text) {
        throw new NeedClassifierError('Empty response from model', 'INVALID_JSON');
      }

      return safeParseNeedsJSON(text);
    } catch (err) {
      if (err instanceof NeedClassifierError) {
        lastError = err;
        if (err.code === 'INVALID_JSON' && attempt === 0) {
          continue;
        }
        throw err;
      }
      throw new NeedClassifierError(
        err instanceof Error ? err.message : 'Anthropic API request failed',
        'API_ERROR'
      );
    }
  }

  throw lastError ?? new NeedClassifierError('Failed to parse model response after retry', 'INVALID_JSON');
}
