import mongoose, { Schema } from 'mongoose';
import type { Product } from './products';
const uri=process.env.MONGODB_URI;
const cache=globalThis as typeof globalThis & { __pecoMongoose?:Promise<typeof mongoose> };
export async function connectDB(){
 if(!uri) return null;
 if(!cache.__pecoMongoose) cache.__pecoMongoose=mongoose.connect(uri,{serverSelectionTimeoutMS:7000}).catch(e=>{cache.__pecoMongoose=undefined;throw e});
 return cache.__pecoMongoose;
}
const schema=new Schema({
 id:{type:String,required:true,unique:true},slug:{type:String,required:true},name:{type:String,required:true},description:{type:String,default:''},category:{type:String,default:'Otros productos'},image:{type:String,default:''},imageCandidates:{type:[String],default:[]},imageNeedsReview:{type:Boolean,default:false},prices:{'1':{type:Number,required:true,min:0},'5':{type:Number,required:true,min:0},'10':{type:Number,required:true,min:0},'20':{type:Number,required:true,min:0}},active:{type:Boolean,default:true},stock:{type:Number,default:null}
},{timestamps:true,versionKey:false});
export const ProductModel=mongoose.models.PecoProduct||mongoose.model('PecoProduct',schema);
export function clean(doc: any):Product{const v=doc.toObject?doc.toObject():doc;return {id:v.id,slug:v.slug,name:v.name,description:v.description,category:v.category,image:v.image||'',imageCandidates:v.imageCandidates||[],imageNeedsReview:!!v.imageNeedsReview,prices:v.prices,active:v.active,stock:v.stock??null};}
