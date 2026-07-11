import { getDb } from './mongoClient';

export const demandService = {
  async getDemand(city?: string) {
    const db = await getDb();

    const query = city ? { city: city.toLowerCase() } : {};
    const foodBanks = await db.collection('foodbanks').find(query).toArray();
    const foodBankIds = foodBanks.map((f: any) => f._id.toString());
    if (foodBankIds.length === 0) return [];

    const snapshots = await db
      .collection('demand_snapshots')
      .find({ foodBankId: { $in: foodBankIds } })
      .sort({ recordedAt: -1 })
      .toArray();

    const latestByFoodBank = new Map<string, any>();
    for (const s of snapshots) {
      if (!latestByFoodBank.has(s.foodBankId)) latestByFoodBank.set(s.foodBankId, s);
    }

    return foodBankIds.map((id) => latestByFoodBank.get(id)).filter(Boolean);
  }
};
