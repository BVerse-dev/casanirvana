import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Money Transfer Management" 
};

export default function TransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
