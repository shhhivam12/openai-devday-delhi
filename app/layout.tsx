import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Together — When we have each other',description:'A multilingual community relief companion. Ask for help, find saved knowledge, and explore a Himalayan flood and IoT node simulation.',manifest:'/manifest.webmanifest',icons:{icon:'/brand/mark.svg',apple:'/icon-192.png'},themeColor:'#ef5b35'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
