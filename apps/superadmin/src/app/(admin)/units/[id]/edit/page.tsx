import PageTitle from "@/components/PageTitle";
import type { Metadata } from "next";
import UnitAddForm from "../../../property/add/components/UnitAddForm";

export const metadata: Metadata = { title: "Edit Unit | Casa Nirvana Admin" };

const UnitEditPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <>
      <PageTitle title="Edit Unit" subName="Units" />
      <UnitAddForm unitId={id} />
    </>
  );
};

export default UnitEditPage;
