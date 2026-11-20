import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { connectDB,ProductModel } from '@/lib/db';
const protect=async()=>await isAdmin();
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await protect())return NextResponse.json({error:'No autorizado'},{status:401});
 if(!process.env.MONGODB_URI)return NextResponse.json({error:'Configurá MongoDB'},{status:503});
 try{const {id}=await params;const v=await req.json();const allowed=['name','description','category','image','imageCandidates','imageNeedsReview','prices','stock','active'];const updates:Record<string,unknown>={};for(const k of allowed)if(Object.prototype.hasOwnProperty.call(v,k))updates[k]=v[k];
 if(updates.prices){const prices=updates.prices as Record<string,unknown>;if(!['1','5','10','20'].every(k=>Number.isFinite(Number(prices[k]))&&Number(prices[k])>=0))throw Error('Precios inválidos');}
 await connectDB();const saved=await ProductModel.findOneAndUpdate({id},{$set:updates},{new:true,runValidators:true});if(!saved)return NextResponse.json({error:'No encontrado'},{status:404});return NextResponse.json({ok:true});}
 catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}
}
export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await protect())return NextResponse.json({error:'No autorizado'},{status:401});if(!process.env.MONGODB_URI)return NextResponse.json({error:'Configurá MongoDB'},{status:503});
 const {id}=await params;await connectDB();await ProductModel.deleteOne({id});return NextResponse.json({ok:true});
}
