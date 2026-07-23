import { permanentRedirect } from "next/navigation";

const LegacyUnitsGrid = ({ searchParams = {} }: { searchParams?: Record<string, string | string[] | undefined> }) => {
  const params = new URLSearchParams({ view: "grid" });
  Object.entries(searchParams).forEach(([key, value]) => { if (key !== "view" && value !== undefined) (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, item)); });
  permanentRedirect(`/units?${params.toString()}`);
};

export default LegacyUnitsGrid;
