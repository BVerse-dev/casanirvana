import { Metadata } from "next";

export const metadata: Metadata = { title: "Unit Overview" };

export default function UnitDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
