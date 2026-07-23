"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetResident } from "@/hooks/useResidents";
import Link from "next/link";
import { Alert, Card, CardBody, Spinner } from "react-bootstrap";

import ResidentDetails from "../details/components/ResidentDetails";
import ResidentDetailsBanner from "../details/components/ResidentDetailsBanner";

const ResidentProfile = ({ residentId }: { residentId: string }) => {
  const residentQuery = useGetResident(residentId);

  if (residentQuery.isLoading) return <><PageTitle subName="Residents" title="Resident Overview" /><Card><CardBody className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 mb-0">Loading resident details...</p></CardBody></Card></>;
  if (residentQuery.isError || !residentQuery.data) return <><PageTitle subName="Residents" title="Resident Overview" /><Alert variant="danger">The requested resident could not be loaded or is outside your authorized scope.</Alert><Link href="/residents" className="btn btn-primary">Back to Residents</Link></>;

  const resident = residentQuery.data;
  return (
    <>
      <PageTitle subName="Residents" title={`${resident.full_name} - Overview`} />
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <Link href="/residents" className="btn btn-light"><IconifyIcon icon="ri:arrow-left-line" className="me-1" />Back to Residents</Link>
        <Link href={`/residents/${resident.id}/edit`} className="btn btn-primary"><IconifyIcon icon="ri:edit-line" className="me-1" />Edit Resident</Link>
      </div>
      <ResidentDetailsBanner resident={resident} />
      <ResidentDetails resident={resident} />
    </>
  );
};

export default ResidentProfile;
