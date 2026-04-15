import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'car-shoper',
  description: 'Multi-tenant SaaS platform for car dealerships',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
