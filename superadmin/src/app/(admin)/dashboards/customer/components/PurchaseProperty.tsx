"use client";

import avatar6 from "@/assets/images/users/avatar-6.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import { mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

const GuardAssignments = () => {
  const { data: dashboard, isLoading } = useGuardDashboardSnapshot();
  const recentAssignment = dashboard?.recentAssignment || null;
  const assignmentImage = mapSocietyToPropertyImage(recentAssignment?.societyName || "Guard Assignment");

  if (isLoading) {
    return (
      <Col xl={4} lg={6}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle as={"h4"}>Recent Guard Assignment</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: "200px" }}></div>
              <div className="placeholder col-8 mt-3"></div>
              <div className="placeholder col-6"></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (!recentAssignment) {
    return (
      <Col xl={4} lg={6}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle as={"h4"}>Recent Guard Assignment</CardTitle>
          </CardHeader>
          <CardBody className="text-center text-muted py-5">No guard assignments have been created yet.</CardBody>
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
            <Image src={assignmentImage} alt="assignment-location" className="img-fluid rounded-top" />
            <span className="position-absolute top-0 end-0 p-1">
              <span className={`badge ${recentAssignment.status === "active" ? "bg-success" : "bg-warning"} text-white fs-13`}>
                {recentAssignment.status}
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
              <Link href="/guards/assignments" className="text-dark fw-medium fs-16">
                {recentAssignment.postLocation || "Assigned location"}
              </Link>
              <p className="text-muted mb-0">{recentAssignment.societyName}</p>
            </div>
            <div className="ms-auto">
              <p className="fw-medium text-dark fs-18 mb-0">{recentAssignment.shiftType}</p>
            </div>
          </div>
          <Row className="mt-2 g-2">
            <Col lg={3} xs={4}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon icon="solar:clock-circle-broken" className="align-middle" />
                </span>
                &nbsp;{recentAssignment.assignmentType}
              </span>
            </Col>
            <Col lg={3} xs={4}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon icon="solar:shield-check-broken" className="align-middle" />
                </span>
                &nbsp;{recentAssignment.priority}
              </span>
            </Col>
          </Row>
          <div className="d-flex align-items-center gap-2 mt-3 pt-2">
            <div className="avatar">
              <Image
                src={recentAssignment?.guardAvatarUrl || avatar6}
                alt="guard-avatar"
                className="img-fluid rounded-circle"
                width={40}
                height={40}
              />
            </div>
            <div className="d-block">
              <span className="text-dark">
                <Link href={`/guards/details?id=${recentAssignment.guardId}`} className="text-dark fw-medium fs-15">
                  {recentAssignment.guardName}
                </Link>
              </span>
              <p className="mb-0 fs-14 text-muted">{recentAssignment.guardContact || "Contact not available"}</p>
            </div>
            <div className="ms-auto">
              <IconifyIcon
                icon={recentAssignment.status === "active" ? "ri:checkbox-circle-line" : "ri:time-line"}
                className={`fs-20 ${recentAssignment.status === "active" ? "text-success" : "text-warning"}`}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default GuardAssignments;
