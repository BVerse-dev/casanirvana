"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import { useListResidents } from "@/hooks/useResidents";
import avatar2 from "@/assets/images/users/avatar-2.jpg";

const TopResidents = () => {
  const { data: residents, isLoading } = useListResidents();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Top Resident</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="placeholder-glow">
            <div className="placeholder rounded" style={{ height: '200px' }}></div>
            <div className="mt-2">
              <span className="placeholder col-8"></span>
              <span className="placeholder col-6"></span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Get the first active resident as the featured resident
  const featuredResident = residents?.find(r => r.is_active) || residents?.[0];

  if (!featuredResident) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Top Resident</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-4">
            <IconifyIcon 
              icon="ri:user-line" 
              className="fs-48 text-muted mb-2"
            />
            <p className="text-muted">No resident data available</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as={"h4"}>Featured Resident</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="bg-primary position-relative rounded p-3 overflow-hidden z-1 text-center">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <Image 
              src={featuredResident.avatar_url || avatar2} 
              alt="resident-avatar" 
              className="rounded-circle border border-light border-3"
              width={80}
              height={80}
            />
          </div>
          <div className="bg-light bg-opacity-25 p-3 rounded text-start">
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <Link href={`/residents/details?id=${featuredResident.id}`} className="text-white fw-medium fs-16">
                  {featuredResident.full_name || `${featuredResident.first_name} ${featuredResident.last_name}`}
                </Link>
                <p className="mb-0 text-white-50">
                  {featuredResident.units?.society_id ? 
                    `Unit ${featuredResident.unit_number || 'N/A'}` : 
                    'Casa Nirvana Resident'
                  }
                </p>
                <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
                  <span className="badge bg-success bg-opacity-75 text-white">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    {featuredResident.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="badge bg-info bg-opacity-75 text-white">
                    <IconifyIcon icon="ri:home-line" className="me-1" />
                    Verified
                  </span>
                </div>
              </div>
              <div>
                <Link href={`/residents/details?id=${featuredResident.id}`}>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-white bg-opacity-25 text-white fs-4 rounded-circle">
                      <IconifyIcon icon="ri:arrow-right-line" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TopResidents;
