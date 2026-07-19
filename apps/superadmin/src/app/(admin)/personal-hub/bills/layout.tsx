import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Bill Payment Management" 
};

export default function BillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
