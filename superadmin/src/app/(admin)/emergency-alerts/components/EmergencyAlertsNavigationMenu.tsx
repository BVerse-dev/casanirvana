"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, CardBody, Nav, NavItem, NavLink, Modal, Form, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useListEmergencyAlerts, useCreateEmergencyAlert } from "@/hooks/useEmergencyAlerts";
import { toast } from "react-hot-toast";
import { EMERGENCY_ALERT_CREATE_OPTIONS } from "@/lib/emergencyAlertTypes";

const EmergencyAlertsNavigationMenu = () => {
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alert_type: EMERGENCY_ALERT_CREATE_OPTIONS[0].value,
    priority: 'medium',
  });

  // Get alerts data for badge counts
  const { data: alerts = [] } = useListEmergencyAlerts();
  const createAlertMutation = useCreateEmergencyAlert();

  // Calculate badge counts
  const activeAlertsCount = alerts.filter((alert: any) => alert.status === 'active').length;

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the alert');
      return;
    }

    try {
      await createAlertMutation.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        alert_type: formData.alert_type,
        priority: formData.priority,
        status: 'active',
      });
      
      toast.success('Emergency alert created successfully');
      setShowNewAlertModal(false);
      setFormData({
        title: '',
        description: '',
        alert_type: EMERGENCY_ALERT_CREATE_OPTIONS[0].value,
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <CardBody className="p-0">
        <div className="p-3 border-bottom">
          <Button 
            variant="danger" 
            className="d-flex align-items-center gap-2 w-100"
            onClick={() => setShowNewAlertModal(true)}
          >
            <IconifyIcon icon="ri:alarm-warning-line" className="fs-18" />
            New Alert
          </Button>
        </div>
        <Nav
          variant="pills"
          className="flex-column"
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <NavItem>
            <NavLink
              eventKey="active"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:alarm-line" className="fs-18" />
              Active Alerts
              <span className="badge bg-danger-subtle text-danger ms-auto">{activeAlertsCount}</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              eventKey="resolved"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:check-line" className="fs-18" />
              Resolved
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              eventKey="all"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:list-check" className="fs-18" />
              All Alerts
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              eventKey="medical"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:hospital-line" className="fs-18" />
              Medical
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              eventKey="fire"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:fire-line" className="fs-18" />
              Fire Emergency
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              eventKey="security"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:shield-line" className="fs-18" />
              Security
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              eventKey="maintenance"
              className="text-dark fw-medium d-flex align-items-center gap-2"
            >
              <IconifyIcon icon="ri:tools-line" className="fs-18" />
              Maintenance
            </NavLink>
          </NavItem>
        </Nav>
      </CardBody>

      {/* New Alert Modal */}
      <Modal show={showNewAlertModal} onHide={() => setShowNewAlertModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:alarm-warning-line" className="me-2" />
            Create New Emergency Alert
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Alert Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter alert title..."
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Alert Type</Form.Label>
                  <Form.Select
                    value={formData.alert_type}
                    onChange={(e) => handleInputChange('alert_type', e.target.value)}
                  >
                    {EMERGENCY_ALERT_CREATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority Level</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide detailed description of the emergency..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewAlertModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleSubmit}
            disabled={createAlertMutation.isPending}
          >
            {createAlertMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:alarm-warning-line" className="me-1" />
                Create Alert
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmergencyAlertsNavigationMenu;
