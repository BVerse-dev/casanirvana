import { permanentRedirect } from "next/navigation";

export default function LegacyResidentGridPage() {
  permanentRedirect("/residents?view=grid");
}
