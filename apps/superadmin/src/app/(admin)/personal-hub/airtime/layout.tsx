import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Airtime Services Management" 
};

export default function AirtimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
