import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { isAdmin } from '@/lib/auth';
import { connectDB, ProductModel } from '@/lib/db';
import type { Prices } from '@/lib/products';

export const dynamic = 'force-dynamic';
const TIERS = ['1', '5', '10', '20'] as const;
type PriceProduct = {id:string; name:string; prices:Prices};

type Input = {percent:number; rounding:number; mode:'preview'|'apply'; snapshot?:string};
function parseInput(raw:unknown):Input {
  if (!raw || typeof raw !== 'object') throw Error('Solicitud inválida');
  const input=raw as Record<string,unknown>;
  const percent=Number(input.percent), rounding=Number(input.rounding);
  if (!Number.isFinite(percent) || percent === 0 || percent < -50 || percent > 100)
    throw Error('El porcentaje debe estar entre -50% y +100%, y ser distinto de cero');
  if (![100,500,1000].includes(rounding)) throw Error('Redondeo inválido');
  if (input.mode !== 'preview' && input.mode !== 'apply') throw Error('Modo inválido');
  return {percent, rounding, mode:input.mode, snapshot:typeof input.snapshot === 'string'?input.snapshot:undefined};
}
function newPrices(prices:Prices, percent:number, rounding:number):Prices {
  return Object.fromEntries(TIERS.map(k=>{
    const current=prices[k];
    if (!Number.isFinite(current) || current<0) throw Error('Precio inválido en la base');
    const adjusted = current === 0 ? 0 : Math.ceil((current * (1+percent/100)-1e-8)/rounding)*rounding;
    return [k,adjusted];
  })) as Prices;
}
function fingerprint(items:PriceProduct[]){return createHash('sha256').update(JSON.stringify(items.map(p=>[p.id,p.prices]))).digest('hex');}

export async function POST(request:Request) {
  if (!await isAdmin()) return NextResponse.json({error:'No autorizado'},{status:401});
  if (!process.env.MONGODB_URI) return NextResponse.json({error:'MongoDB no configurado'},{status:503});
  try {
    const input=parseInput(await request.json());
    await connectDB();
    const docs=await ProductModel.find({}).select('id name prices').sort({id:1}).lean();
    if (!docs.length) return NextResponse.json({error:'No hay productos en MongoDB'},{status:400});
    const items=docs.map(p=>({id:p.id as string,name:p.name as string,prices:p.prices as Prices}));
    const snapshot=fingerprint(items);
    const updates=items.map(p=>({...p,newPrices:newPrices(p.prices,input.percent,input.rounding)}));
    // Prevent inversions: quantity discounts should never increase price per unit.
    const invalid=updates.filter(p=>!TIERS.slice(1).every((k,i)=>p.newPrices[TIERS[i]]>=p.newPrices[k]));
    if (invalid.length) return NextResponse.json({error:`${invalid.length} productos quedarían con precios mayoristas superiores al minorista. Revisá sus escalas antes de aplicar el cambio.`},{status:400});
    if (input.mode==='preview') return NextResponse.json({ok:true,count:items.length,snapshot,examples:updates.slice(0,5).map(p=>({id:p.id,name:p.name,before:p.prices,after:p.newPrices}))});
    if (!input.snapshot || input.snapshot!==snapshot) return NextResponse.json({error:'Los precios cambiaron desde la vista previa. Volvé a previsualizar antes de guardar.'},{status:409});

    // Preserve an independent snapshot for recovery before modifying the catalog.
    const db=ProductModel.db.db;
    if (!db) throw Error('MongoDB no está conectado');
    const backupId=randomUUID();
    await db.collection('peco_price_backups').insertOne({backupId,createdAt:new Date(),percent:input.percent,rounding:input.rounding,items:items.map(p=>({id:p.id,prices:p.prices}))});
    const changed=updates.filter(p=>TIERS.some(k=>p.prices[k]!==p.newPrices[k]));
    const operations=changed.map(p=>({updateOne:{filter:{id:p.id, 'prices.1':p.prices['1'], 'prices.5':p.prices['5'], 'prices.10':p.prices['10'], 'prices.20':p.prices['20']},update:{$set:{prices:p.newPrices}}}}));
    const result=operations.length?await ProductModel.bulkWrite(operations,{ordered:true}):{modifiedCount:0};
    if(result.modifiedCount!==changed.length) return NextResponse.json({error:`Se actualizaron ${result.modifiedCount} de ${changed.length} productos que requerían cambios. No repitas la operación. Se guardó una copia en peco_price_backups (ID ${backupId}) para restaurar si hace falta.`,backupId},{status:409});
    return NextResponse.json({ok:true,count:result.modifiedCount,backupId});
  } catch(e) {
    console.error('Error en actualización masiva',e);
    return NextResponse.json({error:(e as Error).message||'Error al actualizar precios'},{status:400});
  }
}
