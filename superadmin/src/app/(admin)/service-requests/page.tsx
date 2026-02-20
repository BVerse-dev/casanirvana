import PageTitle from "@/components/PageTitle";
import ServiceRequestsView from "./components/ServiceRequestsView";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Service Requests" };

const ServiceRequestsPage = () => {
  return (
    <>
      <PageTitle title="Service Requests" subName="Community Management" />
      <ServiceRequestsView />
    </>
  );
};

export default ServiceRequestsPage;
