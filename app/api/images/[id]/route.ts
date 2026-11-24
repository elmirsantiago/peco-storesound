import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB, ProductModel } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  if (!Types.ObjectId.isValid(id)) return new NextResponse('Imagen inválida', {status: 404});
  try {
    await connectDB();
    const db = ProductModel.db.db;
    if (!db) throw new Error('MongoDB no disponible');
    const item = await db.collection('peco_uploaded_images').findOne(
      {_id: new Types.ObjectId(id)}, {projection: {mimeType: 1, data: 1}}
    );
    if (!item) return new NextResponse('Imagen no encontrada', {status: 404});
    const mime = ['image/jpeg','image/png','image/webp'].includes(item.mimeType) ? item.mimeType : 'application/octet-stream';
    const binary = item.data;
    const raw = Buffer.isBuffer(binary) ? binary : Buffer.from(binary?.buffer ?? binary);
    return new Response(new Uint8Array(raw), {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (e) {
    console.error('Error consultando imagen', e);
    return NextResponse.json({error: 'No se pudo obtener la imagen'}, {status: 503});
  }
}
