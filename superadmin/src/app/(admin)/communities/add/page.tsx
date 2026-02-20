import FileUpload from "@/components/FileUpload";
import PageTitle from "@/components/PageTitle";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import CommunityAddForm from "./components/CommunityAddForm";

export const metadata: Metadata = { title: "Add Community" };

const CommunityAddPage = () => {
  return (
    <>
      <PageTitle title="Add Community" subName="Casa Nirvana" />
      <CommunityAddForm />
    </>
  );
};

export default CommunityAddPage;
