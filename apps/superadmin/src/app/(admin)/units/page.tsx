import PageTitle from "@/components/PageTitle";
import type { Metadata } from "next";
import { Suspense } from "react";
import UnitDirectory from "./components/UnitDirectory";

export const metadata: Metadata = { title: "Units | Casa Nirvana Admin" };

const UnitsPage = () => (
  <>
    <PageTitle title="Units" subName="Community Management" />
    <Suspense fallback={<div className="card"><div className="card-body text-center py-5">Loading units...</div></div>}>
      <UnitDirectory />
    </Suspense>
  </>
);

export default UnitsPage;
