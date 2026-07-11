import { SimulateResult } from './types';

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Only food banks within this radius (km) are affected by a proposed site.
const MAX_EFFECT_RADIUS_KM = 15;

// Base diversion rate – the theoretical maximum fraction of a food bank's
// clients that would be diverted to a new site at distance 0 with the
// same capacity.
const BASE_DIVERSION_RATE = 0.30;

// Distance-decay function (inverse-square-like)
// Returns a value in [0, 1] representing how strongly a proposed site
// affects an existing food bank at `distKm` kilometres away.
// Falls off sharply — most effect within ~5km, negligible beyond 15km.
function distanceDecay(distKm: number): number {
  if (distKm >= MAX_EFFECT_RADIUS_KM) return 0;
  const normalized = distKm / MAX_EFFECT_RADIUS_KM;
  return (1 - normalized) ** 2;
}

interface SimFoodBank {
  id: string;
  lat: number;
  lng: number;
  dailyCapacity: number;
  demandPct: number;
}

interface Proposal {
  lat: number;
  lng: number;
  capacity: number;
  dailyCapacity?: number;
  id: string;
}

// Deterministic Client Diversion Model
// When new food bank sites are placed, clients divert from existing sites.
// With multiple proposals, diversion is split by distance and capacity.
export function runSimulation(
  foodBanks: any[],
  snapshots: any[],
  proposals: { lat: number; lng: number; capacity: number; dailyCapacity?: number }[]
): SimulateResult {
  if (proposals.length === 0) {
    const before: Record<string, number> = {};
    const after: Record<string, number> = {};
    const delta: Record<string, number> = {};
    for (const f of foodBanks) {
      const id = f._id.toString();
      const snap = snapshots.find((s: any) => s.foodBankId === id);
      const demand = snap?.demandPct ?? 60;
      before[id] = demand;
      after[id] = demand;
      delta[id] = 0;
    }
    return { before, after, delta };
  }

  const props: Proposal[] = proposals.map((p, i) => ({
    ...p,
    id: `proposed-${i}`,
  }));

  const simFoodBanks: SimFoodBank[] = [];
  for (const f of foodBanks) {
    const id = f._id.toString();
    const snap = snapshots.find((s: any) => s.foodBankId === id);
    const demand = snap?.demandPct ?? 60;
    simFoodBanks.push({
      id,
      lat: f.latitude,
      lng: f.longitude,
      dailyCapacity: f.dailyCapacity || 40,
      demandPct: demand,
    });
  }

  // rawDiversion[F][P] = clients diverted from F to proposal P
  const rawDiversion: Record<string, Record<string, number>> = {};
  for (const f of simFoodBanks) {
    rawDiversion[f.id] = {};
    const totalSlots = f.dailyCapacity * 2;
    const currentClients = (f.demandPct / 100) * totalSlots;

    for (const p of props) {
      const dist = haversine(f.lat, f.lng, p.lat, p.lng);
      const decay = distanceDecay(dist);
      if (decay === 0) {
        rawDiversion[f.id][p.id] = 0;
        continue;
      }
      const proposalDailyCapacity = p.dailyCapacity ?? Math.round(p.capacity / 2);
      const capFactor = proposalDailyCapacity / (proposalDailyCapacity + f.dailyCapacity);
      const rate = BASE_DIVERSION_RATE * decay * capFactor;
      rawDiversion[f.id][p.id] = rate * currentClients;
    }
  }

  // Scale per food bank: total diverted from F <= currentClients(F)
  const div1: Record<string, Record<string, number>> = {};
  for (const f of simFoodBanks) {
    div1[f.id] = {};
    const totalSlots = f.dailyCapacity * 2;
    const currentClients = (f.demandPct / 100) * totalSlots;
    const totalRaw = props.reduce((s, p) => s + (rawDiversion[f.id][p.id] ?? 0), 0);
    const scale = totalRaw > 0 && totalRaw > currentClients ? currentClients / totalRaw : 1;
    for (const p of props) {
      div1[f.id][p.id] = (rawDiversion[f.id][p.id] ?? 0) * scale;
    }
  }

  // Scale per proposal: total received by P <= cap(P)
  const actualDiversion: Record<string, Record<string, number>> = {};
  for (const f of simFoodBanks) {
    actualDiversion[f.id] = {};
    for (const p of props) {
      actualDiversion[f.id][p.id] = div1[f.id][p.id];
    }
  }
  for (const p of props) {
    const received = simFoodBanks.reduce((s, f) => s + div1[f.id][p.id], 0);
    const proposalDailyCapacity = p.dailyCapacity ?? Math.round(p.capacity / 2);
    const cap = proposalDailyCapacity * 2;
    if (received > cap && received > 0) {
      const scale = cap / received;
      for (const f of simFoodBanks) {
        actualDiversion[f.id][p.id] *= scale;
      }
    }
  }

  const before: Record<string, number> = {};
  const after: Record<string, number> = {};
  const delta: Record<string, number> = {};
  const proposedAfter: Record<string, number> = {};

  for (const f of simFoodBanks) {
    const totalSlots = f.dailyCapacity * 2;
    const currentClients = (f.demandPct / 100) * totalSlots;
    const totalDiverted = props.reduce((s, p) => s + (actualDiversion[f.id][p.id] ?? 0), 0);
    const newClients = Math.max(0, currentClients - totalDiverted);

    before[f.id] = f.demandPct;
    after[f.id] = Math.max(0, Math.min(100, Math.round((newClients / totalSlots) * 100)));
    delta[f.id] = after[f.id] - before[f.id];
  }

  for (const p of props) {
    const received = simFoodBanks.reduce((s, f) => s + (actualDiversion[f.id][p.id] ?? 0), 0);
    const proposalDailyCapacity = p.dailyCapacity ?? Math.round(p.capacity / 2);
    const cap = proposalDailyCapacity * 2;
    proposedAfter[p.id] = Math.min(100, Math.round((received / cap) * 100));
  }

  return { before, after, delta, proposedAfter };
}
