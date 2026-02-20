"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { useListResidents } from "@/hooks/useResidents";
import { useState, useMemo } from "react";

const RecentResidents = () => {
  const { data: residents, isLoading } = useListResidents();
  const [residentFilter, setResidentFilter] = useState<'new' | 'active'>('new');
  
  // Filter and get residents based on selection
  const filteredResidents = useMemo(() => {
    if (!residents || residents.length === 0) return [];
    
    let filtered = residents;
    
    if (residentFilter === 'new') {
      // Sort by created_at to get newest residents
      filtered = residents
        .filter(resident => resident.created_at)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    } else if (residentFilter === 'active') {
      // Filter only active residents
      filtered = residents.filter(resident => resident.is_active);
    }
    
    return filtered.slice(0, 5);
  }, [residents, residentFilter]);

  const joinDataLength = filteredResidents.length - 1;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Recent Residents</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="placeholder-glow">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="d-flex align-items-center gap-2 mb-3">
                <div className="placeholder rounded-circle" style={{ width: '40px', height: '40px' }}></div>
                <div className="flex-grow-1">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="d-flex  justify-content-between align-items-center border-0">
        <div>
          <CardTitle as={"h4"} className="mb-1">
            Recent Residents
          </CardTitle>
          <p className="mb-0 fs-13">{residents?.length || 0} Total Residents</p>
        </div>
        <Dropdown>
          <DropdownToggle
            as={"a"}
            className="rounded  arrow-none"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <IconifyIcon icon="ri:edit-box-line" className="fs-20 text-dark" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem onClick={() => setResidentFilter('new')}>New Residents</DropdownItem>
            <DropdownItem onClick={() => setResidentFilter('active')}>Active Residents</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
              <CardBody className="pt-2" key={`residents-${residentFilter}`}>
        {filteredResidents.map((resident, idx) => (
          <div
            className={clsx(
              `d-flex flex-wrap align-items-center justify-content-between ${joinDataLength == idx ? "" : "border-bottom"}  ${joinDataLength == idx || idx == 0 ? "" : "py-3"} gap-2 ${idx == 0 && "pb-3"} ${joinDataLength == idx && "pt-3"}`,
            )}
            key={idx}
          >
            <div className="d-flex align-items-center gap-2">
              <div className="avatar">
                <Image
                  src={resident.avatar_url || "/images/users/avatar-1.jpg"}
                  alt="resident-avatar"
                  className="img-fluid rounded-circle"
                  width={40}
                  height={40}
                />
              </div>
              <div className="d-block">
                <span className="text-dark">
                  <Link href={`/residents/details?id=${resident.id}`} className="text-dark fw-medium fs-15">
                    {resident.full_name || `${resident.first_name} ${resident.last_name}`}
                  </Link>
                </span>
                <p className="mb-0 fs-13 text-muted">{resident.email}</p>
              </div>
            </div>
            <div>
              <p className="text-muted fw-medium mb-0">
                {resident.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        ))}
      </CardBody>
      <CardFooter className="border-top">
        <Button variant="primary" className="w-100">
          View All Residents
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentResidents;
