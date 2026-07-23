import type { Metadata } from "next";
import ResidentEdit from "../../components/ResidentEdit";

export const metadata: Metadata = { title: "Edit Resident | Casa Nirvana Admin" };

export default async function ResidentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResidentEdit residentId={id} />;
}
