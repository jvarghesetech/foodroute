import { HouseholdPayload } from './types';

export function validateHousehold(raw: HouseholdPayload): HouseholdPayload {
  if (raw.householdSize < 1 || raw.householdSize > 20)
    throw new Error('Household size out of valid range');
  return raw;
}
