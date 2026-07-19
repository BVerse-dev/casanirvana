import { Metadata } from "next";

export const metadata: Metadata = { 
  title: "Societies Grid | Casa Nirvana Admin" 
};

export default function SocietiesGridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 