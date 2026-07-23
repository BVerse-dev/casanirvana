"use client";

import { useState } from "react";
import { Row } from "react-bootstrap";
import { useDirectoryView } from "@/hooks/useDirectoryView";
import UnitsData from "../../property/grid/components/UnitsData";
import UnitsFilter, { type UnitsFilterState } from "../../property/grid/components/UnitsFilter";
import UnitsList from "../../property/list/components/UnitsList";
import UnitsStat from "../../property/list/components/UnitsStat";

const defaultFilters: UnitsFilterState = { rentRange: [0, 100000] };

const UnitDirectory = () => {
  const { view, setView } = useDirectoryView("units");
  const [filters, setFilters] = useState<UnitsFilterState>(defaultFilters);

  return view === "grid" ? (
    <Row>
      <UnitsFilter onFilterChange={setFilters} onReset={() => setFilters(defaultFilters)} />
      <UnitsData filters={filters} viewMode={view} onViewModeChange={setView} />
    </Row>
  ) : (
    <>
      <UnitsStat />
      <UnitsList viewMode={view} onViewModeChange={setView} />
    </>
  );
};

export default UnitDirectory;
