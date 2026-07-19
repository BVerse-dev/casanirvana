import { Metadata } from "next";

export const metadata: Metadata = { title: "Units Grid" };

export default function UnitsGridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 