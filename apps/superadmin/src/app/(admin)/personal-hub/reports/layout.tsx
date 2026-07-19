import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Personal Hub Reports & Analytics" 
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
