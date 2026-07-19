import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Marketplace Management" 
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
