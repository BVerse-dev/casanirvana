import PageTitle from "@/components/PageTitle";
import UnitsList from "./components/UnitsList";
import UnitsStat from "./components/UnitsStat";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Units List" };

const UnitsListPage = () => {
  return (
    <>
      <PageTitle title="Units List" subName="Casa Nirvana" />
      <UnitsStat />
      <UnitsList />
    </>
  );
};

export default UnitsListPage;
