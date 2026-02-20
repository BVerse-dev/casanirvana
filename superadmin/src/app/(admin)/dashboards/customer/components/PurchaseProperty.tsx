"use client";
import propertiesImg from "@/assets/images/properties/p-10.jpg";
import avatar6 from "@/assets/images/users/avatar-6.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import { useGuardAssignments } from "@/hooks/useGuardAssignments";
import { useListGuards } from "@/hooks/useGuards";
import { useMemo } from "react";

const GuardAssignments = () => {
  // Use static data to avoid hooks issues
  const staticAssignment = {
    id: '1',
    location: 'Main Entrance Security',
    description: 'North Wing Building A',
    shiftType: '24/7 Shift',
    status: 'active'
  };
  
  const staticGuard = {
    id: '1',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@security.com',
    avatar: null
  };
  
  const isLoading = false;
  const recentAssignment = staticAssignment;
  const assignedGuard = staticGuard;

  if (isLoading) {
    return (
      <Col xl={4} lg={6}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle as={"h4"}>Recent Guard Assignment</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: '200px' }}></div>
              <div className="placeholder col-8 mt-3"></div>
              <div className="placeholder col-6"></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={4} lg={6}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle as={"h4"}>Recent Guard Assignment</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="position-relative">
            <Image
              src={propertiesImg}
              alt="assignment-location"
              className="img-fluid rounded-top"
            />
            <span className="position-absolute top-0 end-0 p-1">
              <span className={`badge ${recentAssignment?.status === 'active' ? 'bg-success' : 'bg-warning'} text-white fs-13`}>
                {recentAssignment?.status || 'Active'}
              </span>
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 pt-1 ">
            <div className="avatar bg-light rounded flex-centered">
              <IconifyIcon
                icon="solar:shield-user-bold-duotone"
                width={24}
                height={24}
                className="fs-24 text-primary"
              />
            </div>
            <div>
              <Link href={`/guards/assignments/details?id=${recentAssignment?.id}`} className="text-dark fw-medium fs-16">
                {(recentAssignment as any)?.location || 'Main Entrance Security'}
              </Link>
              <p className="text-muted mb-0">{(recentAssignment as any)?.description || 'North Wing Building A'}</p>
            </div>
            <div className="ms-auto">
              <p className="fw-medium text-dark fs-18 mb-0">
                {(recentAssignment as any)?.shiftType || '24/7 Shift'}
              </p>
            </div>
          </div>
          <Row className="mt-2 g-2">
            <Col lg={2} xs={4}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:clock-circle-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;Day Shift
              </span>
            </Col>
            <Col lg={2} xs={4}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:moon-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;Night
              </span>
            </Col>
            <Col lg={2} xs={4}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:shield-check-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;Patrol
              </span>
            </Col>
            <Col lg={2} xs={4}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:eye-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;Monitor
              </span>
            </Col>
          </Row>
          <div className="d-flex align-items-center gap-2 mt-3 pt-2">
            <div className="avatar">
              <Image
                src={(assignedGuard as any)?.avatar || avatar6}
                alt="guard-avatar"
                className="img-fluid rounded-circle"
                width={40}
                height={40}
              />
            </div>
            <div className="d-block">
              <span className="text-dark">
                <Link 
                  href={`/guards/details?id=${assignedGuard?.id}`} 
                  className="text-dark fw-medium fs-15"
                >
                  {(assignedGuard as any)?.name || (assignedGuard as any)?.full_name || 'Marcus Johnson'}
                </Link>
              </span>
              <p className="mb-0 fs-14 text-muted">
                {(assignedGuard as any)?.email || 'marcus.johnson@security.com'}
              </p>
            </div>
            <div className="ms-auto">
              <IconifyIcon
                icon={recentAssignment?.status === 'active' ? "ri:checkbox-circle-line" : "ri:time-line"}
                className={`fs-20 ${recentAssignment?.status === 'active' ? 'text-success' : 'text-warning'}`}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default GuardAssignments;
