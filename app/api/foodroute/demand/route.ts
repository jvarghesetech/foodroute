import { NextRequest, NextResponse } from 'next/server';
import { demandService } from '@/lib/foodroute/demandService';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') || undefined;
  try {
    const data = await demandService.getDemand(city);
    return NextResponse.json(data);
  } catch (e) {
    console.warn('Demand API: DB unavailable', e);
    return NextResponse.json([]);
  }
}
