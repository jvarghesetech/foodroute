import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/foodroute/mongoClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDb();
    const doc = await db.collection('custom_buildings').findOne({ id });

    if (!doc || !doc.glbBase64) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const data = Buffer.from(doc.glbBase64, 'base64');

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Disposition': `inline; filename="${id}.glb"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error retrieving building:', error);
    return NextResponse.json(
      { error: 'Building not found' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDb();
    const result = await db.collection('custom_buildings').deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    console.log(`🗑️ Deleted building: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting building:', error);
    return NextResponse.json(
      { error: 'Building not found' },
      { status: 404 }
    );
  }
}
