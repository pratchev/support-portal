import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Support Portal - Rich Content Demo',
  description: 'Help Desk Ticketing System with Rich Content Support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
