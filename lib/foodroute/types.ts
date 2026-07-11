export interface FoodBank {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  weeklyCapacity: number; // total households/individuals served per week
  dailyCapacity: number; // walk-in slots per day
  phone?: string;
  website?: string;
  languages?: string[]; // languages spoken by staff/volunteers
  dietaryTags?: string[]; // halal, kosher, vegetarian, gluten-free, culturally-specific, etc.
}

export interface DemandSnapshot {
  foodBankId: string;
  demandPct: number; // 0-100, how close to capacity
  waitMinutes: number;
  recordedAt: Date;
}

export interface ProposedSiteInput {
  lat: number;
  lng: number;
  capacity: number;
  dailyCapacity?: number; // when provided, used directly in simulation
}

export interface SimulateRequest {
  city: string;
  proposals: ProposedSiteInput[];
}

export interface SimulateResult {
  before: Record<string, number>;
  after: Record<string, number>;
  delta: Record<string, number>;
  /** Demand for each proposed site (key: proposed-0, proposed-1, ...) */
  proposedAfter?: Record<string, number>;
}

export interface HouseholdPayload {
  householdSize: number;
  hasChildren: boolean;
  hasAccessibilityNeeds: boolean;
  urgencyNote?: string; // e.g. "no food since yesterday"
}

export interface NeedsPayload {
  languages: string[];
  dietaryNeeds: string[]; // halal, kosher, vegetarian, gluten-free, etc.
  culturalPreference?: string;
  freeText?: string;
}

export interface NeedsRequest {
  household: HouseholdPayload;
  needs: NeedsPayload;
  city: string;
}

export interface NeedsResponse {
  urgency: 'critical' | 'high' | 'moderate';
  reasoning: string;
}

export interface RouteRequest {
  userLat?: number;
  userLng?: number;
  postalCode?: string;
  urgency: 'critical' | 'high' | 'moderate';
  city: string;
  needs?: NeedsPayload;
}

export interface ScoredFoodBank {
  foodBank: FoodBank;
  score: number;
  drivingTimeMinutes: number;
  waitMinutes: number;
  adjustedWaitMinutes: number;
  distanceKm: number;
  demandPct: number;
  languageMatch: boolean;
  dietaryMatch: boolean;
  routeGeometry: any;
  congestionSegments?: string[];
  totalEstimatedMinutes: number;
  reason: string;
}

export interface RouteResponse {
  recommended: ScoredFoodBank;
  alternatives: ScoredFoodBank[];
  userLocation: { lat: number; lng: number };
}
