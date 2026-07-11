import type { MapFoodBankMarker } from './types';

export const MOCK_FOODBANKS: Record<string, MapFoodBankMarker[]> = {
  toronto: [
    { id: 'th-1', name: 'Toronto General FoodBank', lng: -79.387, lat: 43.662, demandPct: 72, waitMinutes: 45 },
    { id: 'th-2', name: 'St. Michael\'s FoodBank', lng: -79.378, lat: 43.656, demandPct: 85, waitMinutes: 60 },
    { id: 'th-3', name: 'Sunnybrook Health Centre', lng: -79.363, lat: 43.722, demandPct: 58, waitMinutes: 30 },
    { id: 'th-4', name: 'Toronto Western FoodBank', lng: -79.406, lat: 43.654, demandPct: 68, waitMinutes: 40 },
  ],
  waterloo: [
    { id: 'kh-1', name: 'Grand River FoodBank', lng: -80.493, lat: 43.448, demandPct: 65, waitMinutes: 35 },
    { id: 'kh-2', name: 'St. Mary\'s General FoodBank', lng: -80.478, lat: 43.442, demandPct: 78, waitMinutes: 50 },
    { id: 'kh-3', name: 'Cambridge Memorial FoodBank', lng: -80.312, lat: 43.361, demandPct: 55, waitMinutes: 25 },
  ],
  mississauga: [
    { id: 'mh-1', name: 'Trillium Health Partners (Mississauga)', lng: -79.641, lat: 43.549, demandPct: 82, waitMinutes: 55 },
    { id: 'mh-2', name: 'Credit Valley FoodBank', lng: -79.688, lat: 43.565, demandPct: 70, waitMinutes: 42 },
    { id: 'mh-3', name: 'Queensway Health Centre', lng: -79.612, lat: 43.572, demandPct: 62, waitMinutes: 32 },
  ],
};

export function getMockFoodBanksByCity(cityId: string): MapFoodBankMarker[] {
  return MOCK_FOODBANKS[cityId] ?? [];
}
