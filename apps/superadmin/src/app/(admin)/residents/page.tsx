import type { Metadata } from "next";

import ResidentDirectory from "./components/ResidentDirectory";

export const metadata: Metadata = { title: "Residents | Casa Nirvana Admin" };

export default function ResidentsPage() {
  return <ResidentDirectory />;
}
