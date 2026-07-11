import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/foodroute/voronoiService';
import { getDb } from '@/lib/foodroute/mongoClient';
import { SimulateRequest } from '@/lib/foodroute/types';

export async function POST(req: NextRequest) {
  const body: SimulateRequest = await req.json();
  const db = await getDb();

  const foodBanks = await db.collection('foodbanks')
    .find({ city: body.city }).toArray();
  const snapshots = await db.collection('demand_snapshots')
    .find({ foodBankId: { $in: foodBanks.map(f => f._id.toString()) } })
    .sort({ recordedAt: -1 }).toArray();

  const proposals = body.proposals ?? [];
  const result = runSimulation(foodBanks, snapshots, proposals);

  return NextResponse.json(result);
}
