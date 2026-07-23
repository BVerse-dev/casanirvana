import { permanentRedirect } from "next/navigation";

type LegacyCommunitiesListProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const LegacyCommunitiesList = ({ searchParams = {} }: LegacyCommunitiesListProps) => {
  const params = new URLSearchParams({ view: "list" });
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "view" || value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, item));
  });
  permanentRedirect(`/communities?${params.toString()}`);
};

export default LegacyCommunitiesList;
