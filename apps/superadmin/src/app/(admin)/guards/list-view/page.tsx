import { permanentRedirect } from "next/navigation";

export default function LegacyGuardListPage() {
  permanentRedirect("/guards?view=list");
}
