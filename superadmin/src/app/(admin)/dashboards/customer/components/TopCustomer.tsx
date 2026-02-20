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
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { useGuardPerformances } from "@/hooks/useGuardPerformance";
import { useGuardSummary } from "@/hooks/useGuardDashboard";
import avatar2 from "@/assets/images/users/avatar-2.jpg";
import { useState, useMemo } from "react";

const TopGuards = () => {
  const [sortBy, setSortBy] = useState<'performance' | 'attendance' | 'experience'>('performance');
  
  // Use static data to avoid hooks issues
  const staticGuards = [
    { id: '1', guardName: 'Marcus Johnson', overallRating: 4.9, attendancePercentage: 98, avatar: null, guardId: '1' },
    { id: '2', guardName: 'Sarah Williams', overallRating: 4.8, attendancePercentage: 96, avatar: null, guardId: '2' },
    { id: '3', guardName: 'David Chen', overallRating: 4.7, attendancePercentage: 94, avatar: null, guardId: '3' },
    { id: '4', guardName: 'Maria Garcia', overallRating: 4.6, attendancePercentage: 92, avatar: null, guardId: '4' },
    { id: '5', guardName: 'James Wilson', overallRating: 4.5, attendancePercentage: 90, avatar: null, guardId: '5' },
  ];
  
  const totalGuards = 24;
  const isLoading = false;

  if (isLoading) {
    return (
      <Col xl={4} lg={6}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center border-0">
            <div>
              <CardTitle as={"h4"} className="mb-1">
                Top Guards
              </CardTitle>
              <p className="mb-0 fs-13">Loading...</p>
            </div>
          </CardHeader>
          <CardBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="placeholder rounded-circle" style={{ width: '40px', height: '40px' }}></div>
                  <div>
                    <span className="placeholder col-8"></span>
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
                <span className="placeholder col-3"></span>
              </div>
            ))}
          </CardBody>
        </Card>
      </Col>
    );
  }

  // Get top 5 guards based on sort criteria
  const topGuards = useMemo(() => {
    let sortedGuards = [...staticGuards];
    
    switch (sortBy) {
      case 'performance':
        sortedGuards.sort((a, b) => b.overallRating - a.overallRating);
        break;
      case 'attendance':
        sortedGuards.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
        break;
      case 'experience':
        // Sort by a combination of rating and attendance as experience proxy
        sortedGuards.sort((a, b) => {
          const aExperience = (a.overallRating * 0.6) + (a.attendancePercentage * 0.4);
          const bExperience = (b.overallRating * 0.6) + (b.attendancePercentage * 0.4);
          return bExperience - aExperience;
        });
        break;
    }
    
    return sortedGuards;
  }, [staticGuards, sortBy]);

  return (
    <Col xl={4} lg={6}>
      <Card>
        <CardHeader className="d-flex  justify-content-between align-items-center border-0">
          <div>
            <CardTitle as={"h4"} className="mb-1">
              Top Guards
            </CardTitle>
            <p className="mb-0 fs-13">{totalGuards} Total Guards</p>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="rounded  arrow-none"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <IconifyIcon
                icon="ri:edit-box-line"
                className="fs-20 text-dark"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setSortBy('performance')}>By Performance</DropdownItem>
              <DropdownItem onClick={() => setSortBy('attendance')}>By Attendance</DropdownItem>
              <DropdownItem onClick={() => setSortBy('experience')}>By Experience</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody key={`top-guards-${sortBy}`}>
          {topGuards.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon 
                icon="ri:shield-user-line" 
                className="fs-48 text-muted mb-2"
              />
              <p className="text-muted">No guard performance data available</p>
            </div>
          ) : (
            topGuards.map((guard, idx) => {
              const isLast = idx === topGuards.length - 1;
              return (
                <div
                  className={clsx(
                    `d-flex align-items-center justify-content-between ${!isLast ? "border-bottom" : ""} ${idx === 0 ? "pb-3" : isLast ? "pt-3" : "py-3"} gap-2`
                  )}
                  key={guard.id}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar position-relative">
                      <Image
                        src={guard.avatar || avatar2}
                        alt="guard-avatar"
                        className="img-fluid rounded-circle"
                        width={40}
                        height={40}
                      />
                      {idx < 3 && (
                        <span 
                          className={`position-absolute top-0 start-100 translate-middle badge rounded-pill ${
                            idx === 0 ? 'bg-warning' : idx === 1 ? 'bg-secondary' : 'bg-warning'
                          }`}
                          style={{ fontSize: '10px' }}
                        >
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                    <div className="d-block">
                      <span className="text-dark">
                        <Link 
                          href={`/guards/details?id=${guard.guardId}`} 
                          className="text-dark fw-medium fs-15"
                        >
                          {guard.guardName}
                        </Link>
                      </span>
                      <p className="mb-0 fs-14 text-muted">
                        Rating: {guard.overallRating.toFixed(1)}/5.0
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-muted fw-medium mb-0">
                      {guard.attendancePercentage.toFixed(0)}%
                    </p>
                    <small className="text-muted">Attendance</small>
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
        <CardFooter className="border-top">
          <Button 
            variant="primary" 
            className="w-100"
            onClick={() => window.open('/guards/list-view', '_blank')}
          >
            View All Guards
          </Button>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default TopGuards;
