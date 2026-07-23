import { permanentRedirect } from "next/navigation";

export default function LegacyResidentListPage() {
  permanentRedirect("/residents?view=list");
}
