"use client";

import PageTitle from "@/components/PageTitle";
import { type CreateResidentData, useGetResident } from "@/hooks/useResidents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";

import ResidentAddCard from "../add/components/ResidentAddCard";
import ResidentAddEnhanced from "../add/components/ResidentAdd_Enhanced";

const ResidentEdit = ({ residentId }: { residentId: string }) => {
  const router = useRouter();
  const residentQuery = useGetResident(residentId);
  const [formData, setFormData] = useState<CreateResidentData>({ first_name: "", last_name: "", email: "", role: "resident", status: "active" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitForm = () => (document.getElementById("resident-form") as HTMLFormElement | null)?.requestSubmit();

  if (residentQuery.isLoading) return <><PageTitle subName="Residents" title="Edit Resident" /><div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Loading resident...</p></div></>;
  if (residentQuery.isError || !residentQuery.data) return <><PageTitle subName="Residents" title="Edit Resident" /><Alert variant="danger">The requested resident could not be loaded or is outside your authorized scope.</Alert><Link href="/residents" className="btn btn-primary">Back to Residents</Link></>;

  const resident = residentQuery.data;
  return (
    <>
      <PageTitle subName="Residents" title="Edit Resident" />
      <Row>
        <ResidentAddCard formData={formData} onAddResident={submitForm} onCancel={() => router.push(`/residents/${resident.id}`)} submitLabel="Update Resident" isSubmitting={isSubmitting} submittingLabel="Updating..." />
        <Col xl={9} lg={8}>
          <ResidentAddEnhanced mode="edit" resident={resident} residentId={resident.id} onFormChange={setFormData} onSubmittingChange={setIsSubmitting} />
        </Col>
      </Row>
    </>
  );
};

export default ResidentEdit;
