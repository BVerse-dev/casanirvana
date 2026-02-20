import FileUpload from "@/components/FileUpload";
import PageTitle from "@/components/PageTitle";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import UnitAddForm from "./components/UnitAddForm";

export const metadata: Metadata = { title: "Add Unit" };

const UnitAddPage = () => {
  return (
    <>
      <PageTitle title="Add Unit" subName="Casa Nirvana" />
      <UnitAddForm />
    </>
  );
};

export default UnitAddPage;
