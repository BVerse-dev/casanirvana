import PageTitle from "@/components/PageTitle";
import type { Metadata } from "next";
import { Suspense } from "react";
import JoinRequestsList from "./components/JoinRequestsList";

export const metadata: Metadata = { title: "Community Join Requests | Casa Nirvana Admin" };

const JoinRequestsPage = () => (
  <>
    <PageTitle subName="Community Management" title="Join Requests" />
    <Suspense fallback={<div className="card"><div className="card-body text-center py-5">Loading join requests...</div></div>}>
      <JoinRequestsList />
    </Suspense>
  </>
);

export default JoinRequestsPage;
