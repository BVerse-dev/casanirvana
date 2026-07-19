import PageTitle from "@/components/PageTitle";
import CommunitiesList from "./components/CommunitiesList";
import CommunitiesStat from "./components/CommunitiesStat";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Communities List" };

const CommunitiesListPage = () => {
  return (
    <>
      <PageTitle title="Communities List" subName="Casa Nirvana" />
      <CommunitiesStat />
      <CommunitiesList />
    </>
  );
};

export default CommunitiesListPage;
