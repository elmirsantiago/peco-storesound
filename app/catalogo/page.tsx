import { getProducts } from '@/lib/store';import { Catalog } from '@/components/Catalog';
export const dynamic='force-dynamic';
export default async function CatalogPage(){const products=(await getProducts()).filter(p=>p.active);return <main className="container page-space"><span className="eyebrow">PECO STORESOUND</span><h1 className="page-title">Nuestro catálogo</h1><p className="muted">Elegí tus favoritos y mirá cómo cambia el precio según la cantidad.</p><Catalog products={products}/></main>}
