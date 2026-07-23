import { permanentRedirect } from "next/navigation";

type LegacyCommunitiesGridProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const LegacyCommunitiesGrid = ({ searchParams = {} }: LegacyCommunitiesGridProps) => {
  const params = new URLSearchParams({ view: "grid" });
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "view" || value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, item));
  });
  permanentRedirect(`/communities?${params.toString()}`);
};

export default LegacyCommunitiesGrid;
