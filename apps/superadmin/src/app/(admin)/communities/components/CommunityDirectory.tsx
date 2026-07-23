"use client";

import { useState } from "react";
import { Row } from "react-bootstrap";
import { useDirectoryView } from "@/hooks/useDirectoryView";
import CommunitiesFilter, { type CommunityFilters } from "../grid/components/CommunitiesFilter";
import CommunitiesGrid from "../grid/components/CommunitiesGrid";
import CommunitiesStat from "../grid/components/CommunitiesStat";
import CommunitiesList from "../list/components/CommunitiesList";
import ListCommunitiesStat from "../list/components/CommunitiesStat";

const defaultFilters: CommunityFilters = {
  location: "",
  status: "",
  communityType: "",
  unitsRange: [10, 500],
  minOccupancy: null,
  maxOccupancy: null,
  minArea: null,
  maxArea: null,
  amenities: [],
};

const CommunityDirectory = () => {
  const { view, setView } = useDirectoryView("communities");
  const [filters, setFilters] = useState<CommunityFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<CommunityFilters>(defaultFilters);

  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return (
    <>
      {view === "grid" ? (
        <>
          <CommunitiesStat filters={appliedFilters} />
          <Row>
            <CommunitiesFilter
              onFiltersChange={setFilters}
              onApplyFilters={() => setAppliedFilters(filters)}
              onResetFilters={resetFilters}
            />
            <CommunitiesGrid
              filters={appliedFilters}
              viewMode={view}
              onViewModeChange={setView}
            />
          </Row>
        </>
      ) : (
        <>
          <ListCommunitiesStat />
          <CommunitiesList viewMode={view} onViewModeChange={setView} />
        </>
      )}
    </>
  );
};

export default CommunityDirectory;
