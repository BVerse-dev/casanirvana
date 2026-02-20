import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Data Services Management" 
};

export default function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
