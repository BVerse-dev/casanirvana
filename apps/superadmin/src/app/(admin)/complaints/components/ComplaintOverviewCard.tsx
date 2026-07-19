"use client";
import React from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import { useListComplaints } from "@/hooks/useComplaints";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import avatarImage from "@/assets/images/users/avatar-1.jpg";

const ComplaintOverviewCard = () => {
  const { data: complaints = [] } = useListComplaints();
  const toSafeDate = (value?: string | null) => (value ? new Date(value) : null);

  const todayComplaints = complaints.filter(complaint => {
    const today = new Date();
    const complaintDate = toSafeDate(complaint.created_at);
    return complaintDate?.toDateString() === today.toDateString();
  }).length;

  const urgentComplaints = complaints.filter(c => c.priority === "high" && c.status !== "resolved").length;
  const resolvedToday = complaints.filter(complaint => {
    const today = new Date();
    const resolvedAt = toSafeDate(complaint.resolved_at);
    return Boolean(resolvedAt) && resolvedAt?.toDateString() === today.toDateString();
  }).length;

  return (
    <Card className="bg-primary bg-gradient overflow-hidden" style={{ height: '240px' }}>
      <CardBody className="position-relative">
        <div className="d-flex align-items-center">
            <div className="avatar-lg rounded-circle flex-shrink-0 overflow-hidden border border-white border-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
              <Image 
                src={avatarImage} 
                alt="Admin Avatar" 
                width={64}
                height={64}
                className="w-100 h-100 object-fit-cover"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="flex-grow-1 ms-3">
              <p className="text-uppercase fw-medium text-white-50 mb-1 fs-13">
                Complaint Management System
              </p>
              <h4 className="text-white fw-bold mb-0">Welcome Back, Admin!</h4>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-lg-9">
              <p className="text-white-50 mb-3 fs-14">
                Monitor and manage resident complaints with the current scoped operational view
              </p>
              
              <div className="row">
                <div className="col-md-4 col-6 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-warning bg-opacity-20 text-warning rounded">
                        <IconifyIcon icon="ri:notification-3-line" className="fs-16" />
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white fw-semibold mb-0">{todayComplaints}</h4>
                      <p className="mb-0 text-white-50 fs-12">Today's Reports</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4 col-6 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-danger bg-opacity-20 text-danger rounded">
                        <IconifyIcon icon="ri:alarm-warning-line" className="fs-16" />
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white fw-semibold mb-0">{urgentComplaints}</h4>
                      <p className="mb-0 text-white-50 fs-12">Urgent Issues</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4 col-6 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-success bg-opacity-20 text-success rounded">
                        <IconifyIcon icon="ri:check-double-line" className="fs-16" />
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white fw-semibold mb-0">{resolvedToday}</h4>
                      <p className="mb-0 text-white-50 fs-12">Resolved Today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 d-flex align-items-end justify-content-end">
              <div className="position-relative">
                <div className="avatar-xl bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:dashboard-3-line" className="text-white fs-32" />
                </div>
                <div className="position-absolute" style={{ top: '-8px', right: '-8px' }}>
                  <span className="badge bg-success rounded-pill fs-11 px-2 py-1">Ops View</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="position-absolute top-0 end-0 opacity-10">
            <IconifyIcon icon="ri:customer-service-line" className="text-white" style={{ fontSize: '6rem' }} />
          </div>
        </CardBody>
      </Card>
  );
};

export default ComplaintOverviewCard;
