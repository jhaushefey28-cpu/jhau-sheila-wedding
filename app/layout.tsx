import type { Metadata } from 'next';
import './globals.css';

// NOTE: Facebook Messenger/FB/Viber read the OG tags from the URL that was
// actually shared (this root page), not from public/site/index.html —
// that file is only reachable inside the iframe, so a crawler never sees
// it. The real share-preview tags have to live here. If you reuse this
// site for a different wedding, update the title/description text and
// swap the cover photo at public/site/photos/cover.jpg (same filename).
const SITE_URL = 'https://jhau-sheila-wedding-live.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Jhau & Sheila's Wedding — December 27, 2026",
  description:
    'Jhau & Sheila are getting married on December 27, 2026 — join us and let us know if you can make it.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: "Jhau & Sheila's Wedding — December 27, 2026",
    description: 'Join us as we celebrate our wedding day. See the details and send your RSVP here.',
    images: [{ url: '/site/photos/cover.jpg', width: 896, height: 1200 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jhau & Sheila's Wedding — December 27, 2026",
    description: 'Join us as we celebrate our wedding day. See the details and send your RSVP here.',
    images: ['/site/photos/cover.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
