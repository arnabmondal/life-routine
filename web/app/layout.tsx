import './theme.css';
import './globals.css';
import { THEME_INIT_SCRIPT } from '../lib/user-settings';
export const metadata={title:'Daywell — Personal Routine',description:'Plan intentionally. Track what actually happened.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-theme="sage-chalk" suppressHydrationWarning><head><script id="daywell-theme-init" dangerouslySetInnerHTML={{__html:THEME_INIT_SCRIPT}}/></head><body>{children}</body></html>}
