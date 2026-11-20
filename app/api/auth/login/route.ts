import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { timingSafeEqual } from 'node:crypto';
export async function POST(req:Request){
 if(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD||!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)return NextResponse.json({error:'Primero configurá ADMIN_EMAIL, ADMIN_PASSWORD y JWT_SECRET (32+ caracteres)'},{status:503});
 const {email,password}=await req.json();const safe=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
 if(!safe(String(email||'').toLowerCase(),process.env.ADMIN_EMAIL.toLowerCase())||!safe(String(password||''),process.env.ADMIN_PASSWORD))return NextResponse.json({error:'Credenciales incorrectas'},{status:401});
 const res=NextResponse.json({ok:true});res.cookies.set('peco_admin',await createSession(),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*7});return res;
}
