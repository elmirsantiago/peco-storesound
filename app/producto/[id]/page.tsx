import Link from 'next/link';import { notFound } from 'next/navigation';import { getProduct } from '@/lib/store';import { Detail } from '@/components/Detail';
export const dynamic='force-dynamic';
export default async function DetailPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await getProduct(id);if(!p||!p.active)notFound();return <main className="container page-space"><div className="breadcrumbs"><Link href="/catalogo">Catálogo</Link> / {p.category}</div><Detail product={p}/></main>}
