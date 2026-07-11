import { MongoClient } from 'mongodb';
import { mockFoodBanks } from '../lib/foodroute/mockData';

const uri = process.env.MONGODB_URI!;

async function seed() {
  if (!uri) {
    console.error('MONGODB_URI not set. Pass it as an environment variable.');
    console.error('Usage: MONGODB_URI="mongodb+srv://..." npx tsx scripts/seedFoodBanks.ts');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('foodroute');

    await db.collection('foodbanks').deleteMany({});
    const result = await db.collection('foodbanks').insertMany(mockFoodBanks as any);
    console.log(`Inserted ${result.insertedCount} food banks`);

    const count = await db.collection('foodbanks').countDocuments();
    console.log(`Total food banks in collection: ${count}`);

    if (count > 0) {
      console.log('Seed completed successfully');
    } else {
      console.error('Seed failed — no documents found');
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
