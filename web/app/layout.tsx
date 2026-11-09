import './theme.css';
import './globals.css';
export const metadata={title:'Daywell — Personal Routine',description:'Plan intentionally. Track what actually happened.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-theme="sage-chalk"><body>{children}</body></html>}
