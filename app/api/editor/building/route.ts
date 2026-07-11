import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/foodroute/mongoClient';

// Simple ID generator
function generateId(): string {
  return `bld_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

const MAX_GLB_BYTES = 14 * 1024 * 1024; // stay comfortably under Mongo's 16MB document limit

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let arrayBuffer: ArrayBuffer;
    let name = 'building';
    let metadata: Record<string, unknown> | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const glbFile = formData.get('glb') as File | null;
      const metadataStr = formData.get('metadata') as string | null;
      const nameField = formData.get('name') as string | null;

      if (!glbFile) {
        return NextResponse.json(
          { error: 'Missing glb file in form data' },
          { status: 400 }
        );
      }

      arrayBuffer = await glbFile.arrayBuffer();
      name = nameField || 'building';

      if (metadataStr) {
        try {
          metadata = JSON.parse(metadataStr);
        } catch {
          console.warn('⚠️ Could not parse metadata JSON, skipping');
        }
      }
    } else if (contentType.includes('application/octet-stream')) {
      arrayBuffer = await request.arrayBuffer();
      name = request.headers.get('x-building-name') || 'building';
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data or application/octet-stream' },
        { status: 400 }
      );
    }

    if (arrayBuffer.byteLength > MAX_GLB_BYTES) {
      return NextResponse.json(
        { error: `Building file too large (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)}MB). Max is 14MB.` },
        { status: 413 }
      );
    }

    const id = generateId();
    const buffer = Buffer.from(arrayBuffer);
    const glbBase64 = buffer.toString('base64');

    const beds = (metadata as any)?.erBeds ?? (metadata as any)?.totalBeds ?? 50;

    const db = await getDb();
    await db.collection('custom_buildings').insertOne({
      id,
      name,
      beds,
      metadata,
      glbBase64,
      sizeBytes: arrayBuffer.byteLength,
      createdAt: new Date(),
    });

    console.log(`✅ Saved building ${id} to MongoDB (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);

    return NextResponse.json({
      id,
      name,
      beds,
      size: arrayBuffer.byteLength,
      publicPath: `/api/editor/building/${id}`,
      metadata: { id, name, beds, metadata, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error storing building:', error);
    return NextResponse.json(
      { error: 'Failed to store building' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection('custom_buildings')
      .find({}, { projection: { glbBase64: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const buildings = docs.map((doc) => ({
      id: doc.id,
      filename: `${doc.id}.glb`,
      publicPath: `/api/editor/building/${doc.id}`,
      name: doc.name || 'Custom Building',
      beds: doc.beds || 50,
      metadata: doc.metadata || null,
    }));

    return NextResponse.json({ buildings });
  } catch (error) {
    console.error('Error listing buildings:', error);
    return NextResponse.json({ buildings: [] });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing building id' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('custom_buildings').deleteOne({ id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting building:', error);
    return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 });
  }
}