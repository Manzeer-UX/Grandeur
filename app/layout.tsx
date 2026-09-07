import './globals.css';
import InventoryAssistant from '../components/inventory-assistant';
export const metadata={title:'Grandeur · Inventory workspace',description:'Bonko inventory, distribution and decision support for Grandeur Philippines.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body suppressHydrationWarning>{children}<InventoryAssistant/></body></html>}
