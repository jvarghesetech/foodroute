import { NextRequest, NextResponse } from 'next/server';
import { scoreAndRankFoodBanks } from '@/lib/foodroute/routingService';
import { geocodePostalCode } from '@/lib/foodroute/mapboxDirections';
import { getDb } from '@/lib/foodroute/mongoClient';
import { RouteRequest } from '@/lib/foodroute/types';

export async function POST(req: NextRequest) {
  try {
    const body: RouteRequest = await req.json();
    const db = await getDb();

    // Resolve user location from coordinates or postal code
    let userLat = body.userLat;
    let userLng = body.userLng;

    if ((!userLat || !userLng) && body.postalCode) {
      const geo = await geocodePostalCode(body.postalCode);
      userLat = geo.lat;
      userLng = geo.lng;
    }

    if (!userLat || !userLng) {
      return NextResponse.json(
        { error: 'Please provide location (coordinates or postal code).' },
        { status: 400 }
      );
    }

    const foodBanks = await db
      .collection('foodbanks')
      .find({})
      .toArray();
    const snapshots = await db
      .collection('demand_snapshots')
      .find({})
      .sort({ recordedAt: -1 })
      .toArray();

    const result = await scoreAndRankFoodBanks(
      userLat,
      userLng,
      body.urgency,
      foodBanks,
      snapshots,
      body.needs
    );

    if (!result) {
      return NextResponse.json(
        { error: 'No food banks found for the specified city.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      userLocation: { lat: userLat, lng: userLng },
    });
  } catch (err: any) {
    console.error('Route API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to compute route.' },
      { status: 500 }
    );
  }
}
