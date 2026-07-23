import type { Metadata } from "next";

import GuardDirectory from "./components/GuardDirectory";

export const metadata: Metadata = { title: "Guards | Casa Nirvana Admin" };

export default function GuardsPage() {
  return <GuardDirectory />;
}
