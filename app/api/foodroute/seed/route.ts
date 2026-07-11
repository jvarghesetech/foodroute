import { NextResponse } from 'next/server';
import { getDb } from '@/lib/foodroute/mongoClient';
import { mockFoodBanks } from '@/lib/foodroute/mockData';

async function seed() {
  const db = await getDb();

  // Clear existing data
  await db.collection('foodbanks').deleteMany({});
  await db.collection('demand_snapshots').deleteMany({});

  // Insert food banks
  const foodBankResult = await db.collection('foodbanks').insertMany(mockFoodBanks);

  // Map old string IDs to new MongoDB ObjectIds for demand snapshots
  const insertedFoodBanks = await db.collection('foodbanks').find({}).toArray();
  const demandDocs = insertedFoodBanks.map(f => ({
    foodBankId: f._id.toString(),
    demandPct: Math.round(Math.random() * 40 + 50),
    waitMinutes: Math.floor(Math.random() * 60 + 15),
    recordedAt: new Date(),
  }));

  await db.collection('demand_snapshots').insertMany(demandDocs);

  return NextResponse.json({
    message: 'Seeded successfully',
    foodBanks: foodBankResult.insertedCount,
    demand: demandDocs.length,
  });
}

export async function POST() {
  return seed();
}

export async function GET() {
  return seed();
}
