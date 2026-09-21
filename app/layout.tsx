import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jhau & Sheila | December 27, 2026',
  description: 'A wedding invitation for Jhau & Sheila.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
