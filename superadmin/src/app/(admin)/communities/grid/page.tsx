"use client";
import { useState } from "react";
import PageTitle from "@/components/PageTitle";
import CommunitiesGrid from "./components/CommunitiesGrid";
import CommunitiesStat from "./components/CommunitiesStat";
import CommunitiesFilter, { type CommunityFilters } from "./components/CommunitiesFilter";
import { Row } from "react-bootstrap";
import { Metadata } from "next";

// Note: metadata export needs to be in a separate server component file for client components
// export const metadata: Metadata = { title: "Communities Grid" };

const CommunitiesGridPage = () => {
  const [filters, setFilters] = useState<CommunityFilters>({
    location: "",
    status: "",
    communityType: "",
    unitsRange: [10, 500],
    minOccupancy: null,
    maxOccupancy: null,
    minArea: null,
    maxArea: null,
    amenities: [],
  });

  const [appliedFilters, setAppliedFilters] = useState<CommunityFilters>(filters);

  const handleFiltersChange = (newFilters: CommunityFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const resetFilters: CommunityFilters = {
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
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  return (
    <>
      <PageTitle title="Communities Grid" subName="Casa Nirvana" />
      <CommunitiesStat filters={appliedFilters} />
      <Row>
        <CommunitiesFilter 
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
        <CommunitiesGrid filters={appliedFilters} />
      </Row>
    </>
  );
};

export default CommunitiesGridPage;
