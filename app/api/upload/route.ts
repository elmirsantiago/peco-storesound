import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { connectDB, ProductModel } from '@/lib/db';

export const runtime = 'nodejs';

function imageMime(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'MongoDB no configurado' }, { status: 503 });

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Seleccioná una imagen JPG, PNG o WEBP' }, { status: 400 });
    if (file.size === 0 || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'La foto debe pesar entre 1 byte y 4 MB' }, { status: 400 });
    const data = Buffer.from(await file.arrayBuffer());
    const mimeType = imageMime(data);
    if (!mimeType) return NextResponse.json({ error: 'Formato no admitido. Usá JPG, PNG o WEBP' }, { status: 400 });

    await connectDB();
    const db = ProductModel.db.db;
    if (!db) throw new Error('No se pudo conectar con MongoDB');
    const result = await db.collection('peco_uploaded_images').insertOne({
      data, mimeType, createdAt: new Date(), originalName: file.name.slice(0, 150)
    });
    return NextResponse.json({ ok: true, url: `/api/images/${result.insertedId.toHexString()}` });
  } catch (e) {
    console.error('Error al subir foto de producto', e);
    return NextResponse.json({ error: 'No se pudo subir la foto. Revisá MongoDB e intentá otra vez.' }, { status: 500 });
  }
}
