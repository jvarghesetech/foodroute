import { ScoredFoodBank, NeedsPayload } from './types';
import { getBatchDirections } from './mapboxDirections';
import { getAdjustedDrivingTime, getAdjustedWaitTime, getTemporalContext } from './temporalPatterns';

// Urgency-based weight profiles
// critical: household has no food today -> minimize drive time above all
// high: needs food soon -> balance drive time with wait/demand
// moderate: planning ahead -> minimize total time, prefer language/dietary fit
const WEIGHTS: Record<string, { drive: number; wait: number; demand: number; fit: number }> = {
  critical: { drive: 5.0, wait: 0.5, demand: 0.3, fit: 3.0 },
  high: { drive: 2.0, wait: 3.0, demand: 1.5, fit: 1.5 },
  moderate: { drive: 1.0, wait: 4.0, demand: 2.0, fit: 0.5 },
};

function getFitScore(foodBank: any, needs?: NeedsPayload): { score: number; languageMatch: boolean; dietaryMatch: boolean } {
  if (!needs) return { score: 0, languageMatch: false, dietaryMatch: false };

  const languages: string[] = foodBank.languages ?? [];
  const dietary: string[] = foodBank.dietaryTags ?? [];

  const languageMatch = (needs.languages ?? []).some((l) => languages.includes(l));
  const dietaryMatch = (needs.dietaryNeeds ?? []).some((d) => dietary.includes(d));

  const wantedCount = (needs.languages?.length ?? 0) + (needs.dietaryNeeds?.length ?? 0);
  const matchedCount = (languageMatch ? 1 : 0) + (dietaryMatch ? 1 : 0);
  const score = wantedCount > 0 ? (1 - matchedCount / 2) * 50 : 0;

  return { score, languageMatch, dietaryMatch };
}

export async function scoreAndRankFoodBanks(
  userLat: number,
  userLng: number,
  urgency: string,
  foodBanks: any[],
  snapshots: any[],
  needs?: NeedsPayload
): Promise<{ recommended: ScoredFoodBank; alternatives: ScoredFoodBank[] } | null> {
  if (!foodBanks.length) return null;

  const now = new Date();
  const weights = WEIGHTS[urgency] ?? WEIGHTS['moderate'];
  const context = getTemporalContext(now);

  // Build demand lookup
  const demandMap: Record<string, { demandPct: number; waitMinutes: number }> = {};
  for (const s of snapshots) {
    demandMap[s.foodBankId] = { demandPct: s.demandPct, waitMinutes: s.waitMinutes };
  }

  // Get real driving times from Mapbox Directions API (parallel)
  const destinations = foodBanks.map((f: any) => ({
    lng: f.longitude,
    lat: f.latitude,
    id: f._id?.toString() ?? f.id,
  }));

  const directionsMap = await getBatchDirections(userLng, userLat, destinations);

  // Score each food bank
  const scored: ScoredFoodBank[] = foodBanks.map((f: any) => {
    const fId = f._id?.toString() ?? f.id;
    const demand = demandMap[fId] ?? { demandPct: 60, waitMinutes: 20 };
    const directions = directionsMap.get(fId);

    const rawDriveTime = directions?.drivingTimeMinutes ?? 15;
    const distanceKm = directions?.distanceKm ?? 10;
    const routeGeometry = directions?.routeGeometry ?? null;
    const congestionSegments = directions?.congestionSegments;

    // Apply temporal adjustments
    const drivingTimeMinutes = getAdjustedDrivingTime(rawDriveTime, distanceKm, now);
    const adjustedWaitMinutes = getAdjustedWaitTime(demand.waitMinutes, now);

    // Demand penalty: 0 if < 70%, scales up to 100
    const demandPenalty = Math.max(0, ((demand.demandPct - 70) / 30) * 100);

    // Language/dietary fit
    const fit = getFitScore(f, needs);

    // Compute weighted score (lower = better)
    const score =
      weights.drive * drivingTimeMinutes +
      weights.wait * adjustedWaitMinutes +
      weights.demand * demandPenalty +
      weights.fit * fit.score;

    const totalEstimatedMinutes = Math.round(drivingTimeMinutes + adjustedWaitMinutes);

    return {
      foodBank: f,
      score: Math.round(score * 10) / 10,
      drivingTimeMinutes: Math.round(drivingTimeMinutes),
      waitMinutes: demand.waitMinutes,
      adjustedWaitMinutes,
      distanceKm: Math.round(distanceKm * 10) / 10,
      demandPct: demand.demandPct,
      languageMatch: fit.languageMatch,
      dietaryMatch: fit.dietaryMatch,
      routeGeometry,
      congestionSegments,
      totalEstimatedMinutes,
      reason: '',
    };
  });

  // Sort by score (ascending = best first)
  scored.sort((a, b) => a.score - b.score);

  // Generate reasons
  scored[0].reason = generateReason(scored[0], urgency, context);
  for (let i = 1; i < scored.length; i++) {
    scored[i].reason = generateAlternativeReason(scored[i], scored[0]);
  }

  return {
    recommended: scored[0],
    alternatives: scored.slice(1, 3),
  };
}

function generateReason(f: ScoredFoodBank, urgency: string, context: string): string {
  const parts: string[] = [];

  if (urgency === 'critical') {
    parts.push(`Fastest route: ${f.drivingTimeMinutes} min drive with ${context}.`);
    if (f.languageMatch || f.dietaryMatch) parts.push('This food bank matches your language or dietary needs.');
  } else if (urgency === 'high') {
    parts.push(
      `Best balance of ${f.drivingTimeMinutes} min drive + ~${f.adjustedWaitMinutes} min wait (${context}).`
    );
  } else {
    parts.push(
      `Lowest total wait: ~${f.totalEstimatedMinutes} min total (${f.drivingTimeMinutes} drive + ${f.adjustedWaitMinutes} wait). ${f.demandPct}% of capacity.`
    );
  }

  return parts.join(' ');
}

function generateAlternativeReason(alt: ScoredFoodBank, best: ScoredFoodBank): string {
  const timeDiff = alt.totalEstimatedMinutes - best.totalEstimatedMinutes;
  if (timeDiff > 0) {
    return `~${timeDiff} min longer total, but ${alt.demandPct}% of capacity.`;
  }
  return `${alt.distanceKm} km away, ${alt.demandPct}% of capacity.`;
}
