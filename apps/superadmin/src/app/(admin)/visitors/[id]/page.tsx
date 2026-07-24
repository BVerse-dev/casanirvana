"use client";

import { useParams, useSearchParams } from "next/navigation";

import VisitorDetailsPage from "../details/page";

const CanonicalVisitorDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  return <VisitorDetailsPage visitorId={params.id} source={searchParams.get("source")} />;
};

export default CanonicalVisitorDetailsPage;
