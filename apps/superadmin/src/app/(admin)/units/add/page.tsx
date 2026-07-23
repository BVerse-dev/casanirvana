import PageTitle from "@/components/PageTitle";
import type { Metadata } from "next";
import UnitAddForm from "../../property/add/components/UnitAddForm";

export const metadata: Metadata = { title: "Add Unit | Casa Nirvana Admin" };

const UnitAddPage = () => (
  <>
    <PageTitle title="Add Unit" subName="Units" />
    <UnitAddForm />
  </>
);

export default UnitAddPage;
