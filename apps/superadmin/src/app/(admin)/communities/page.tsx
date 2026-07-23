import PageTitle from "@/components/PageTitle";
import type { Metadata } from "next";
import { Suspense } from "react";
import CommunityDirectory from "./components/CommunityDirectory";

export const metadata: Metadata = { title: "Communities | Casa Nirvana Admin" };

const CommunitiesPage = () => (
  <>
    <PageTitle title="Communities" subName="Community Management" />
    <Suspense fallback={<div className="card"><div className="card-body text-center py-5">Loading communities...</div></div>}>
      <CommunityDirectory />
    </Suspense>
  </>
);

export default CommunitiesPage;
