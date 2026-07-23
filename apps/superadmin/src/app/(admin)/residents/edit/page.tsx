import { permanentRedirect } from "next/navigation";

export default function LegacyResidentEditPage({ searchParams }: { searchParams: { id?: string } }) {
  permanentRedirect(searchParams.id ? `/residents/${searchParams.id}/edit` : "/residents");
}
