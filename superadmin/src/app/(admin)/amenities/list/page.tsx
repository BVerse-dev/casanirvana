import PageTitle from "@/components/PageTitle";
import AmenitiesList from "./components/AmenitiesList";
import AmenitiesStat from "./components/AmenitiesStat";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Amenities Management" };

const AmenitiesListPage = () => {
  return (
    <>
      <PageTitle title="Amenities Management" subName="Community Management" />
      <AmenitiesStat />
      <AmenitiesList />
    </>
  );
};

export default AmenitiesListPage;
