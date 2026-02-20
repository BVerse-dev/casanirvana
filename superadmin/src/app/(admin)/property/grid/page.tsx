"use client";
import PageTitle from "@/components/PageTitle";
import { Row } from "react-bootstrap";
import UnitsData from "./components/UnitsData";
import UnitsFilter, { UnitsFilterState } from "./components/UnitsFilter";
import { Metadata } from "next";
import { useState } from "react";

// Note: Metadata export needs to be in a separate file for client components
// export const metadata: Metadata = { title: "Units Grid" };

const UnitsGridPage = () => {
  const [filters, setFilters] = useState<UnitsFilterState>({
    rentRange: [5000, 50000],
  });

  const handleFilterChange = (newFilters: UnitsFilterState) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({
      rentRange: [5000, 50000],
    });
  };

  return (
    <>
      <PageTitle title="Units Grid" subName="Casa Nirvana" />
      <Row>
        <UnitsFilter 
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />
        <UnitsData filters={filters} />
      </Row>
    </>
  );
};

export default UnitsGridPage;
