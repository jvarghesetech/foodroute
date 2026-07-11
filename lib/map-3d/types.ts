export interface CityConfig {
  id: string;
  name: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface MapFoodBankMarker {
  id: string;
  name: string;
  lng: number;
  lat: number;
  demandPct?: number;
  waitMinutes?: number;
}
