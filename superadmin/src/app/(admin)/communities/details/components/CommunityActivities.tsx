"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Badge,
  ListGroup,
  Avatar,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { SocietyDummyData } from "@/assets/data/communities-dummy";

interface SocietyActivitiesProps {
  society: SocietyDummyData;
}

const SocietyActivities: React.FC<SocietyActivitiesProps> = ({ society }) => {
  const recentActivities = [
    {
      id: 1,
      type: 'maintenance',
      icon: 'solar:settings-bold-duotone',
      iconColor: 'warning',
      title: 'Elevator Maintenance Completed',
      description: 'Elevator B1 maintenance successfully completed by TechServ Solutions',
      time: '2 hours ago',
      user: 'Maintenance Team',
      userAvatar: 'MT'
    },
    {
      id: 2,
      type: 'payment',
      icon: 'solar:wallet-money-bold-duotone',
      iconColor: 'success',
      title: 'Monthly Maintenance Payment',
      description: 'Mr. Rajesh Kumar (Unit 405) paid maintenance charges for December',
      time: '4 hours ago',
      user: 'Rajesh Kumar',
      userAvatar: 'RK'
    },
    {
      id: 3,
      type: 'visitor',
      icon: 'solar:users-group-rounded-bold-duotone',
      iconColor: 'info',
      title: 'Guest Registration',
      description: 'New visitor registered for Unit 302 - Family gathering event',
      time: '6 hours ago',
      user: 'Security Desk',
      userAvatar: 'SD'
    },
    {
      id: 4,
      type: 'complaint',
      icon: 'solar:danger-triangle-bold-duotone',
      iconColor: 'danger',
      title: 'Water Leakage Complaint',
      description: 'Unit 201 reported water leakage in bathroom - Assigned to plumber',
      time: '8 hours ago',
      user: 'Priya Sharma',
      userAvatar: 'PS'
    },
    {
      id: 5,
      type: 'amenity',
      icon: 'solar:swimming-bold-duotone',
      iconColor: 'primary',
      title: 'Swimming Pool Booking',
      description: 'Pool area booked for birthday party on 15th Dec by Unit 601',
      time: '12 hours ago',
      user: 'Amit Verma',
      userAvatar: 'AV'
    },
    {
      id: 6,
      type: 'notice',
      icon: 'solar:megaphone-loud-bold-duotone',
      iconColor: 'secondary',
      title: 'Society Meeting Notice',
      description: 'Annual General Meeting scheduled for 20th December at Club House',
      time: '1 day ago',
      user: 'Society Committee',
      userAvatar: 'SC'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Annual General Meeting',
      date: '20 Dec 2024',
      time: '6:00 PM',
      location: 'Club House',
      type: 'meeting',
      color: 'primary'
    },
    {
      id: 2,
      title: 'Christmas Celebration',
      date: '25 Dec 2024',
      time: '7:00 PM',
      location: 'Community Hall',
      type: 'celebration',
      color: 'success'
    },
    {
      id: 3,
      title: 'Security System Upgrade',
      date: '28 Dec 2024',
      time: '10:00 AM',
      location: 'Main Gate',
      type: 'maintenance',
      color: 'warning'
    },
    {
      id: 4,
      title: 'New Year Party',
      date: '31 Dec 2024',
      time: '8:00 PM',
      location: 'Terrace Garden',
      type: 'celebration',
      color: 'info'
    }
  ];

  const getActivityIcon = (type: string) => {
    const activity = recentActivities.find(a => a.type === type);
    return activity ? activity.icon : 'solar:bell-bold-duotone';
  };

  const getActivityColor = (type: string) => {
    const activity = recentActivities.find(a => a.type === type);
    return activity ? activity.iconColor : 'secondary';
  };

  return (
    <Row className="mb-4">
      {/* Recent Activities */}
      <Col lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <div className="d-flex justify-content-between align-items-center">
              <CardTitle className="mb-0">Recent Activities</CardTitle>
              <Badge bg="light" text="dark" className="rounded-pill">Last 24 Hours</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="activity-timeline">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className={`d-flex mb-4 ${index === recentActivities.length - 1 ? 'mb-0' : ''}`}>
                  <div className="flex-shrink-0">
                    <div className={`avatar-sm rounded-circle bg-${activity.iconColor}-subtle d-flex align-items-center justify-content-center position-relative`}>
                      <IconifyIcon icon={activity.icon} className={`fs-18 text-${activity.iconColor}`} />
                      {index !== recentActivities.length - 1 && (
                        <div className="position-absolute start-50 translate-middle-x" style={{ top: '100%', height: '40px', width: '2px', backgroundColor: '#e5e7eb' }}></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-0">{activity.title}</h6>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                    <p className="text-muted mb-1 small">{activity.description}</p>
                    <div className="d-flex align-items-center">
                      <div className={`avatar-xs rounded-circle bg-${activity.iconColor}-subtle d-flex align-items-center justify-content-center me-2`}>
                        <small className={`text-${activity.iconColor} fw-semibold`}>{activity.userAvatar}</small>
                      </div>
                      <small className="text-muted">{activity.user}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Upcoming Events & Notifications */}
      <Col lg={4}>
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Upcoming Events</CardTitle>
          </CardHeader>
          <CardBody>
            {upcomingEvents.map((event) => (
              <div key={event.id} className="d-flex align-items-start mb-3">
                <div className={`avatar-sm rounded-circle bg-${event.color}-subtle d-flex align-items-center justify-content-center flex-shrink-0`}>
                  <IconifyIcon 
                    icon={event.type === 'meeting' ? 'solar:users-group-rounded-bold-duotone' : 
                          event.type === 'celebration' ? 'solar:party-bold-duotone' : 
                          'solar:calendar-bold-duotone'} 
                    className={`fs-16 text-${event.color}`} 
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">{event.title}</h6>
                  <div className="d-flex align-items-center text-muted small mb-1">
                    <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                    {event.date} at {event.time}
                  </div>
                  <div className="d-flex align-items-center text-muted small">
                    <IconifyIcon icon="solar:map-point-bold" className="me-1" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Quick Actions</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-start">
                <IconifyIcon icon="solar:megaphone-loud-bold-duotone" className="me-2" />
                Send Notice
              </button>
              <button className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-start">
                <IconifyIcon icon="solar:calendar-add-bold-duotone" className="me-2" />
                Schedule Event
              </button>
              <button className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-start">
                <IconifyIcon icon="solar:settings-bold-duotone" className="me-2" />
                Maintenance Request
              </button>
              <button className="btn btn-outline-info btn-sm d-flex align-items-center justify-content-start">
                <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2" />
                Generate Report
              </button>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default SocietyActivities;
