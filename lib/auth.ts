import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
const key=()=>new TextEncoder().encode(process.env.JWT_SECRET||'');
export async function isAdmin(){
 if(!process.env.JWT_SECRET||!process.env.ADMIN_EMAIL)return false;
 const token=(await cookies()).get('peco_admin')?.value;if(!token)return false;
 try{const {payload}=await jwtVerify(token,key());return payload.role==='admin'&&payload.sub===process.env.ADMIN_EMAIL;}catch{return false;}
}
export async function createSession(){return new SignJWT({role:'admin'}).setProtectedHeader({alg:'HS256'}).setSubject(process.env.ADMIN_EMAIL!).setIssuedAt().setExpirationTime('7d').sign(key());}
