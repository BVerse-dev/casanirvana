"use client";
import React from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import { useListComplaints } from "@/hooks/useComplaints";

const ComplaintPriorityCard = () => {
  // Get all complaints for priority card (no pagination needed)
  const { data: complaintsData = [] } = useListComplaints();
  
  // Ensure we have an array
  const complaints = Array.isArray(complaintsData) ? complaintsData : [];

  const priorityStats = {
    high: complaints.filter(c => c.priority === "high").length,
    medium: complaints.filter(c => c.priority === "medium").length,
    low: complaints.filter(c => c.priority === "low").length,
  };

  const totalComplaints = complaints.length;

  const priorities = [
    {
      level: "High Priority",
      count: priorityStats.high,
      percentage: totalComplaints > 0 ? ((priorityStats.high / totalComplaints) * 100).toFixed(1) : "0",
      color: "danger",
      icon: "ri:alarm-warning-line",
    },
    {
      level: "Medium Priority", 
      count: priorityStats.medium,
      percentage: totalComplaints > 0 ? ((priorityStats.medium / totalComplaints) * 100).toFixed(1) : "0",
      color: "warning",
      icon: "ri:error-warning-line",
    },
    {
      level: "Low Priority",
      count: priorityStats.low,
      percentage: totalComplaints > 0 ? ((priorityStats.low / totalComplaints) * 100).toFixed(1) : "0",
      color: "success",
      icon: "ri:information-line",
    },
  ];

  return (
    <Col xl={12}>
      <Card className="card-height-100">
        <CardBody>
          <div className="d-flex align-items-center mb-3">
            <div className="avatar-xs flex-shrink-0">
              <div className="avatar-title bg-soft-primary text-primary rounded fs-18">
                <i className="ri:flag-line"></i>
              </div>
            </div>
            <h5 className="card-title mb-0 flex-grow-1 ms-2">Priority Distribution</h5>
          </div>
          <div className="mt-4">
            {priorities.map((priority, index) => (
              <div key={index} className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0">
                  <div className={`avatar-xs bg-${priority.color}-subtle text-${priority.color} rounded d-flex align-items-center justify-content-center`}>
                    <i className={`${priority.icon} fs-16`}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">{priority.level}</h6>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="progress bg-soft-secondary" style={{ height: "6px" }}>
                        <div 
                          className={`progress-bar bg-${priority.color}`} 
                          style={{ width: `${priority.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <span className="badge bg-light text-muted fs-12">{priority.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ComplaintPriorityCard;
