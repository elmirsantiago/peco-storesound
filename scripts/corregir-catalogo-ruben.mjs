import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

// Modo seguro por defecto: solo muestra los cambios. --apply escribe en MongoDB.
const apply = process.argv.includes('--apply');
const envfile = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envfile)) {
  for (const line of fs.readFileSync(envfile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
  }
}
if (!process.env.MONGODB_URI) { console.error('Falta MONGODB_URI en .env.local'); process.exit(1); }
const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/products.json'), 'utf8'));
const byId = new Map(catalog.map(p => [p.id, p]));
const targetIds = ['25', '36', '37', '80'];
const newProduct = byId.get('156');
if (!newProduct) throw new Error('Falta el producto 156 en data/products.json');

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db;
const collection = db.collection('pecoproducts');
let errors = 0;
try {
  // No se tocan los otros 151 productos, ni sus precios.
  for (const id of targetIds) {
    const existing = await collection.findOne({ id });
    if (!existing) { console.error('FALTA producto', id); errors++; continue; }
    const next = byId.get(id);
    if (!next) { console.error('FALTA en JSON', id); errors++; continue; }
    const changes = id === '25'
      ? { description: next.description, image: next.image, imageNeedsReview: false }
      : id === '36' || id === '37'
        ? { image: next.image, imageNeedsReview: false }
        : { description: next.description, image: next.image, prices: next.prices };
    if (id === '80') {
      const original = { '1':8300, '5':7500, '10':6700, '20':6400 };
      const desired = next.prices;
      const matches = (p, q) => ['1','5','10','20'].every(k => Number(p?.[k]) === q[k]);
      if (!matches(existing.prices, original) && !matches(existing.prices, desired)) {
        console.error('PRECIOS DEL SAMSUNG DISTINTOS a los del ZIP. No modificar: revisá si ya aplicaste un aumento.', existing.prices);
        errors++; continue;
      }
    }
    console.log(`${apply?'APLICANDO':'VISTA PREVIA'} ID ${id} - ${existing.name}:`, Object.keys(changes).join(', '));
    if (apply) {
      const result = await collection.updateOne({ _id: existing._id }, { $set: { ...changes, updatedAt: new Date() } });
      if (!result.matchedCount) { console.error('No se pudo modificar', id); errors++; }
    }
  }
  const duplicate = await collection.findOne({ $or: [ { id: '156' }, { name: /^\s*depiladora nasal\s*$/i } ] });
  if (duplicate) console.log('DEPILADORA YA EXISTE (no se duplica):', duplicate.id, duplicate.name);
  else {
    console.log(`${apply?'AGREGANDO':'VISTA PREVIA ALTA'}: Depiladora nasal (1/5/10/20)`);
    if (apply) await collection.insertOne({ ...newProduct, createdAt: new Date(), updatedAt: new Date() });
  }
  console.log(errors ? `REVISAR: ${errors} incidencia(s).` : apply ? 'Cambios aplicados. Verificá en catálogo y administrador.' : 'Vista previa lista. Usá --apply para guardar luego de publicar las imágenes.');
} finally { await mongoose.disconnect(); }
if (errors) process.exitCode = 1;
