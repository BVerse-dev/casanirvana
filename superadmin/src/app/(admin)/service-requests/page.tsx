import PageTitle from "@/components/PageTitle";
import ServiceRequestsView from "./components/ServiceRequestsView";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Service Requests" };

const ServiceRequestsPage = () => {
  return (
    <>
      <PageTitle title="Service Requests" subName="Operations" />
      <ServiceRequestsView />
    </>
  );
};

export default ServiceRequestsPage;
