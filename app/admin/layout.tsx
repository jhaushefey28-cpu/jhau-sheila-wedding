import type { Metadata } from 'next';

// Keep the admin page out of search engines. (page.tsx is a client component,
// so the metadata has to live in this layout.)
export const metadata: Metadata = {
  title: 'Wedding admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
