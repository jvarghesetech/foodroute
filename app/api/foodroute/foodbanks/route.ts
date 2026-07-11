import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/foodroute/mongoClient';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city');
  try {
    const db = await getDb();
    const query = city ? { city: city.toLowerCase() } : {};
    const foodBanks = await db.collection('foodbanks')
      .find(query)
      .toArray();
    return NextResponse.json(foodBanks);
  } catch (e) {
    console.warn('Food banks API: DB unavailable', e);
    return NextResponse.json([]);
  }
}
