import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/store';
import { isAdmin } from '@/lib/auth';
import { connectDB,ProductModel } from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){const items=await getProducts();return NextResponse.json({ok:true,products:(await isAdmin())?items:items.filter(p=>p.active)});}
export async function POST(req:Request){
 if(!await isAdmin())return NextResponse.json({error:'No autorizado'},{status:401});
 if(!process.env.MONGODB_URI)return NextResponse.json({error:'Configurá MONGODB_URI para guardar cambios'},{status:503});
 try{const p=await req.json();if(!p.name||!p.prices||!['1','5','10','20'].every(k=>Number.isFinite(Number(p.prices[k]))&&Number(p.prices[k])>=0))throw Error('Datos inválidos');await connectDB();
 const id=String(Date.now());const slug=p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+id;
 await ProductModel.create({id,slug,name:p.name,description:p.description||'',category:p.category||'Otros productos',image:p.image||'',imageCandidates:[],imageNeedsReview:false,prices:p.prices,stock:p.stock===null||p.stock===''?null:Number(p.stock),active:p.active!==false});return NextResponse.json({ok:true,id});}
 catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}
}
