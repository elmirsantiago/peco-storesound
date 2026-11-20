import type { Metadata } from 'next';
import './globals.css';
import { ShopProvider } from '@/components/ShopProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
export const metadata:Metadata={title:'Peco StoreSound | Audio, tecnología y más',description:'Productos electrónicos, audio, accesorios y mucho más. Venta minorista y mayorista con descuentos por cantidad.',icons:{icon:'/logo.jpeg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><ShopProvider><Header/>{children}<Footer/></ShopProvider></body></html>}
