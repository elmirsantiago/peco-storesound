import { connectDB,ProductModel,clean } from './db';
import {sampleProducts,type Product} from './products';
export async function getProducts():Promise<Product[]>{
 if(!process.env.MONGODB_URI)return sampleProducts;
 try{await connectDB();const results=await ProductModel.find({}).sort({id:1}).lean();return results.length?results.map(clean):sampleProducts;}
 catch(e){console.error('Error reading products',e);return sampleProducts;}
}
export async function getProduct(slug:string){const p=await getProducts();return p.find(x=>x.slug===slug||x.id===slug);}
