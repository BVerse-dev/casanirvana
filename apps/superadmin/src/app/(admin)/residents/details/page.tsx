import { permanentRedirect } from "next/navigation";

export default function LegacyResidentDetailsPage({ searchParams }: { searchParams: { id?: string } }) {
  permanentRedirect(searchParams.id ? `/residents/${searchParams.id}` : "/residents");
}
