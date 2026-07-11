import { NextRequest, NextResponse } from 'next/server';
import { classifyNeeds } from '@/lib/foodroute/needClassifierService';
import type { HouseholdPayload, NeedsPayload } from '@/lib/foodroute/types';

function isHouseholdPayload(v: unknown): v is HouseholdPayload {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.householdSize === 'number' &&
    typeof o.hasChildren === 'boolean' &&
    typeof o.hasAccessibilityNeeds === 'boolean'
  );
}

function isNeedsPayload(v: unknown): v is NeedsPayload {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return Array.isArray(o.languages) && Array.isArray(o.dietaryNeeds);
}

function validateHousehold(raw: HouseholdPayload): HouseholdPayload {
  if (raw.householdSize < 1 || raw.householdSize > 20)
    throw new Error('Household size out of valid range');
  return raw;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const { household, needs, city } = body as Record<string, unknown>;

    if (household === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: household' },
        { status: 400 }
      );
    }
    if (!isHouseholdPayload(household)) {
      return NextResponse.json(
        { error: 'Invalid household payload: must include householdSize, hasChildren, hasAccessibilityNeeds' },
        { status: 400 }
      );
    }

    if (needs === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: needs' },
        { status: 400 }
      );
    }
    if (!isNeedsPayload(needs)) {
      return NextResponse.json(
        { error: 'Invalid needs payload: must include languages and dietaryNeeds as arrays' },
        { status: 400 }
      );
    }

    if (typeof city !== 'string' || city.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: city' },
        { status: 400 }
      );
    }

    const validatedHousehold = validateHousehold(household);
    const result = await classifyNeeds(validatedHousehold, needs);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Household size')) {
      return NextResponse.json(
        { error: message || 'Invalid household' },
        { status: 400 }
      );
    }
    console.error('Needs API error:', err);
    return NextResponse.json(
      { error: 'Need classification failed. Please try again.' },
      { status: 500 }
    );
  }
}
