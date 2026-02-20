import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Insurance Services Management" 
};

export default function InsuranceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
