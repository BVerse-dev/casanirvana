import type { Metadata } from "next";
import ResidentProfile from "../components/ResidentProfile";

export const metadata: Metadata = { title: "Resident Details | Casa Nirvana Admin" };

export default async function ResidentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResidentProfile residentId={id} />;
}
