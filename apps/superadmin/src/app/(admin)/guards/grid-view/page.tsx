import { permanentRedirect } from "next/navigation";

export default function LegacyGuardGridPage() {
  permanentRedirect("/guards?view=grid");
}
