import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Badge,
} from "react-bootstrap";
import type { Database } from "@/lib/database.types";
import { useListUnits } from "@/hooks/useUnits";

type Community = Database["public"]["Tables"]["societies"]["Row"];

interface CommunityDetailsProps {
  society: Community;
}

const CommunityDetails = ({ society }: CommunityDetailsProps) => {
  // Fetch real unit data for this community
  const { data: unitsData } = useListUnits({ 
    societyId: society.id, 
    pageSize: 1000 // Get all units for accurate count
  });
  
  const units = unitsData?.data || [];
  const totalUnits = units.length;
  const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
  
  // Mock data for fields not in database yet - TODO: Add these to schema later
  const rating = 4.5; // TODO: Calculate from reviews/ratings table
  const maintenanceCharges = 3500; // TODO: Add to schema
  const establishedYear = 2020; // TODO: Add to schema
  const status = 'active'; // TODO: Add to schema
  const type = 'Residential Complex'; // TODO: Add to schema
  const amenities = ['Swimming Pool', 'Gym', 'Security', 'Parking']; // TODO: Get from amenities relation
  
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  return (
    <Col xl={12}>
      <Card>
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between my-3 gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <IconifyIcon
                  icon="solar:buildings-2-bold-duotone"
                  className="fs-32 text-primary"
                />
                <div>
                  <h4 className="fw-medium mb-1">{community.name}</h4>
                  <Badge bg="success" className="me-2">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  <Badge bg="outline-primary" className="text-primary">
                    {type}
                  </Badge>
                </div>
              </div>
              <p className="d-flex align-items-center gap-1 mt-1 mb-0">
                <IconifyIcon
                  icon="solar:map-point-wave-bold-duotone"
                  className="fs-18 text-primary"
                />
                {society.address || 'Address not available'}, {society.city || society.state || 'Area not specified'}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Dropdown>
                <DropdownToggle
                  variant="outline-primary"
                  className="arrow-none"
                >
                  <IconifyIcon icon="solar:settings-bold-duotone" className="me-1" />
                  Actions
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem href="#" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="solar:pen-bold-duotone" />
                    Edit Society
                  </DropdownItem>
                  <DropdownItem href="#" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="solar:bell-bold-duotone" />
                    Send Notice
                  </DropdownItem>
                  <DropdownItem href="#" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="solar:wallet-money-bold-duotone" />
                    Collect Maintenance
                  </DropdownItem>
                  <DropdownItem href="#" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="solar:chart-2-bold-duotone" />
                    View Reports
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button variant="primary">
                <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                Add Unit
              </Button>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={3} sm={6}>
              <div className="d-flex align-items-center gap-3 border-end">
                <div className="avatar-md bg-primary-subtle rounded d-flex align-items-center justify-content-center">
                  <IconifyIcon
                    icon="solar:buildings-2-bold-duotone"
                    className="fs-24 text-primary"
                  />
                </div>
                <div>
                  <h4 className="fw-medium mb-1">{totalUnits}</h4>
                  <p className="text-muted mb-0">Total Units</p>
                </div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="d-flex align-items-center gap-3 border-end">
                <div className="avatar-md bg-success-subtle rounded d-flex align-items-center justify-content-center">
                  <IconifyIcon
                    icon="solar:home-2-bold-duotone"
                    className="fs-24 text-success"
                  />
                </div>
                <div>
                  <h4 className="fw-medium mb-1">{occupiedUnits}</h4>
                  <p className="text-muted mb-0">Occupied</p>
                </div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="d-flex align-items-center gap-3 border-end">
                <div className="avatar-md bg-warning-subtle rounded d-flex align-items-center justify-content-center">
                  <IconifyIcon
                    icon="solar:home-broken"
                    className="fs-24 text-warning"
                  />
                </div>
                <div>
                  <h4 className="fw-medium mb-1">{totalUnits - occupiedUnits}</h4>
                  <p className="text-muted mb-0">Vacant</p>
                </div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md bg-info-subtle rounded d-flex align-items-center justify-content-center">
                  <IconifyIcon
                    icon="solar:chart-2-bold-duotone"
                    className="fs-24 text-info"
                  />
                </div>
                <div>
                  <h4 className="fw-medium mb-1">{occupancyRate}%</h4>
                  <p className="text-muted mb-0">Occupancy</p>
                </div>
              </div>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <h5 className="text-dark fw-medium mb-3">Society Information</h5>
              <div className="d-flex gap-3 mb-2">
                <span className="text-muted fw-medium">Established:</span>
                <span>{establishedYear}</span>
              </div>
              <div className="d-flex gap-3 mb-2">
                <span className="text-muted fw-medium">Total Units:</span>
                <span>{totalUnits}</span>
              </div>
              <div className="d-flex gap-3 mb-2">
                <span className="text-muted fw-medium">Occupied Units:</span>
                <span>{occupiedUnits}</span>
              </div>
              <div className="d-flex gap-3 mb-2">
                <span className="text-muted fw-medium">Vacant Units:</span>
                <span>{totalUnits - occupiedUnits}</span>
              </div>
              {society.phone && (
                <div className="d-flex gap-3 mb-2">
                  <span className="text-muted fw-medium">Phone:</span>
                  <span>{society.phone}</span>
                </div>
              )}
              {society.email && (
                <div className="d-flex gap-3 mb-2">
                  <span className="text-muted fw-medium">Email:</span>
                  <span>{society.email}</span>
                </div>
              )}
            </Col>
            <Col md={6}>
              <h5 className="text-dark fw-medium mb-3">Amenities & Features</h5>
              <div className="row g-2">
                {amenities.map((amenity, index) => (
                  <div key={index} className="col-6">
                    <div className="d-flex align-items-center gap-2">
                      <IconifyIcon
                        icon="solar:check-circle-bold-duotone"
                        className="text-success"
                      />
                      <span className="small">{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <span className="text-muted fw-medium">Maintenance Charges:</span>
                <span className="ms-2">₹{maintenanceCharges.toLocaleString()}/month</span>
              </div>
              <div className="mt-2">
                <span className="text-muted fw-medium">Overall Rating:</span>
                <div className="d-flex align-items-center gap-1 ms-2">
                  <IconifyIcon icon="solar:star-bold" className="text-warning" />
                  <span>{rating}/5</span>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default CommunityDetails;
