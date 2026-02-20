"use client";
import React from "react";
import { Card, CardBody, ProgressBar } from "react-bootstrap";
import { useListComplaints } from "@/hooks/useComplaints";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

const ComplaintProgressCard = () => {
  const { data: complaints = [] } = useListComplaints();

  // Calculate resolution progress
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === "resolved").length;
  const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

  // Calculate this week's progress
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  
  const thisWeekComplaints = complaints.filter(complaint => {
    const complaintDate = new Date(complaint.created_at);
    return complaintDate >= thisWeekStart;
  });

  const thisWeekResolved = thisWeekComplaints.filter(c => c.status === "resolved").length;
  const weeklyProgress = thisWeekComplaints.length > 0 ? (thisWeekResolved / thisWeekComplaints.length) * 100 : 0;

  // Calculate average resolution time
  const resolvedComplaintsWithTime = complaints.filter(c => c.status === "resolved" && c.resolved_at && c.created_at);
  const averageResolutionTime = resolvedComplaintsWithTime.length > 0 
    ? resolvedComplaintsWithTime.reduce((total, complaint) => {
        const createdAt = new Date(complaint.created_at);
        const resolvedAt = new Date(complaint.resolved_at);
        const timeDiff = resolvedAt.getTime() - createdAt.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return total + daysDiff;
      }, 0) / resolvedComplaintsWithTime.length
    : 0;

  // Calculate customer satisfaction rate (based on high priority complaints resolved quickly)
  const highPriorityComplaints = complaints.filter(c => c.priority === "high");
  const highPriorityResolved = highPriorityComplaints.filter(c => c.status === "resolved");
  const customerSatisfactionRate = highPriorityComplaints.length > 0 
    ? (highPriorityResolved.length / highPriorityComplaints.length) * 100 
    : 0;

  return (
    <Card className="bg-success bg-gradient overflow-hidden">
      <CardBody className="position-relative p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <h6 className="text-white mb-1 fw-semibold fs-14">Resolution Progress</h6>
            <p className="text-white-50 mb-0 fs-12">This Week's Performance</p>
          </div>
          <div className="avatar-xs bg-white bg-opacity-20 rounded d-flex align-items-center justify-content-center">
            <IconifyIcon icon="ri:line-chart-line" className="text-white fs-16" />
          </div>
        </div>

        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-white-50 fs-12">Overall Resolution Rate</span>
            <span className="text-white fw-semibold fs-13">{resolutionRate.toFixed(1)}%</span>
          </div>
          <ProgressBar 
            now={resolutionRate} 
            className="bg-white bg-opacity-20" 
            style={{ height: '4px' }}
          >
            <ProgressBar 
              now={resolutionRate} 
              className="bg-white" 
            />
          </ProgressBar>
        </div>

        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-white-50 fs-12">Weekly Progress</span>
            <span className="text-white fw-semibold fs-13">{weeklyProgress.toFixed(1)}%</span>
          </div>
          <ProgressBar 
            now={weeklyProgress} 
            className="bg-white bg-opacity-20" 
            style={{ height: '4px' }}
          >
            <ProgressBar 
              now={weeklyProgress} 
              className="bg-white" 
            />
          </ProgressBar>
        </div>

        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-white-50 fs-12">Avg Resolution Time</span>
            <span className="text-white fw-semibold fs-13">
              {averageResolutionTime > 0 
                ? `${averageResolutionTime.toFixed(1)} days` 
                : 'N/A'
              }
            </span>
          </div>
          <ProgressBar 
            now={averageResolutionTime > 0 ? Math.min((7 - averageResolutionTime) / 7 * 100, 100) : 0} 
            className="bg-white bg-opacity-20" 
            style={{ height: '4px' }}
          >
            <ProgressBar 
              now={averageResolutionTime > 0 ? Math.min((7 - averageResolutionTime) / 7 * 100, 100) : 0} 
              className="bg-white" 
            />
          </ProgressBar>
        </div>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-white-50 fs-12">Priority Resolution Rate</span>
            <span className="text-white fw-semibold fs-13">{customerSatisfactionRate.toFixed(1)}%</span>
          </div>
          <ProgressBar 
            now={customerSatisfactionRate} 
            className="bg-white bg-opacity-20" 
            style={{ height: '4px' }}
          >
            <ProgressBar 
              now={customerSatisfactionRate} 
              className="bg-white" 
            />
          </ProgressBar>
        </div>

        {/* Decorative Element */}
        <div className="position-absolute top-0 end-0 opacity-10">
          <IconifyIcon icon="ri:bar-chart-box-line" className="text-white fs-36" />
        </div>
      </CardBody>
    </Card>
  );
};

export default ComplaintProgressCard;
