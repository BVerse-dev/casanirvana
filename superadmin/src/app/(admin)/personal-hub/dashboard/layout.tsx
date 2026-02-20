import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Personal Hub Dashboard" 
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
