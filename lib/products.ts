import original from '@/data/products.json';
export type Prices={ '1':number; '5':number; '10':number; '20':number };
export type Product={id:string;slug:string;name:string;description:string;category:string;image:string;imageCandidates:string[];imageNeedsReview:boolean;prices:Prices;active:boolean;stock:number|null};
export const sampleProducts: Product[]=original as Product[];
export const currency=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
export const unitPrice=(prices:Prices,qty:number)=>prices[qty>=20?'20':qty>=10?'10':qty>=5?'5':'1'];
export const categories=['Todos',...Array.from(new Set(sampleProducts.map(p=>p.category))).sort((a,b)=>a.localeCompare(b,'es'))];
export const whatsapp='5493412013989';
