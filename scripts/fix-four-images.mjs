
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const envPath = path.join(process.cwd(), ".env.local");

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

if (!process.env.MONGODB_URI) {
  console.error("Falta MONGODB_URI en .env.local");
  process.exit(1);
}

const updates = [
  {
    id: "122",
    name: "TIRA DE LUZ LED FUEGO ARTIFICIAL",
    oldImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.24.jpeg",
    newImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.24 (2).jpeg"
  },
  {
    id: "123",
    name: 'MAQUINA AFEITADORA ELÉCTRICA "FLIPULPS" CON 3 CABEZALES.',
    oldImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.24 (2).jpeg",
    newImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.24.jpeg"
  },
  {
    id: "124",
    name: "ESPEJO DE 3 CUERPO CON BASE",
    oldImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.25.jpeg",
    newImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.25 (2).jpeg"
  },
  {
    id: "126",
    name: 'BARRA LUZ LED INTELIGENTE "LAMBO" TECH 40cm C/SENSOR DE MOVIMIENTO Y RECARGABLE',
    oldImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.25 (2).jpeg",
    newImage: "/productos/WhatsApp Image 2026-11-13 at 14.06.25.jpeg"
  }
];

await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
});

try {
  const collection = mongoose.connection.db.collection("pecoproducts");

  for (const product of updates) {
    const result = await collection.updateOne(
      {
        id: product.id,
        image: product.oldImage
      },
      {
        $set: {
          image: product.newImage,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`OK: ${product.name}`);
    } else {
      const current = await collection.findOne(
        { id: product.id },
        { projection: { image: 1 } }
      );

      if (current?.image === product.newImage) {
        console.log(`Ya corregido: ${product.name}`);
      } else {
        console.log(`Sin cambiar, revisar: ${product.name}`);
      }
    }
  }
} finally {
  await mongoose.disconnect();
}
