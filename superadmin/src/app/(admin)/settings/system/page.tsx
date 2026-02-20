"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Nav,
  Tab,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

const SystemConfigPage = () => {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === "overview") {
      router.push("/settings/system/overview");
    } else if (tab === "settings") {
      router.push("/settings/system/settings");
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="page-title">System Configuration</h4>
          <p className="text-muted mb-0">Monitor system performance and configure system-wide settings</p>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm hover-card" style={{ cursor: "pointer" }} onClick={() => handleTabChange("overview")}>
            <CardBody className="text-center p-4">
              <div className="mb-3">
                <IconifyIcon icon="ri:dashboard-line" className="display-4 text-primary" />
              </div>
              <h5 className="mb-2">System Overview</h5>
              <p className="text-muted mb-0">
                Comprehensive dashboard showing real-time system health, performance metrics, recent activities, and system component status
              </p>
            </CardBody>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm hover-card" style={{ cursor: "pointer" }} onClick={() => handleTabChange("settings")}>
            <CardBody className="text-center p-4">
              <div className="mb-3">
                <IconifyIcon icon="ri:settings-3-line" className="display-4 text-primary" />
              </div>
              <h5 className="mb-2">System Settings</h5>
              <p className="text-muted mb-0">
                Configure system-wide settings including performance, security, notifications, monitoring, and business logic parameters
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
};

export default SystemConfigPage;
