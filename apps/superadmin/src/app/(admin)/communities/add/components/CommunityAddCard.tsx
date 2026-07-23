import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";

interface SocietyFormData {
  name?: string;
  society_type?: string;
  address?: string;
  city?: string;
  state?: string;
  total_units?: number;
  total_floors?: number;
  total_blocks?: number;
  established_year?: number;
  status?: string;
  maintenance_charge?: number;
  parking_slots?: number;
}

interface CommunityAddCardProps {
  formData?: SocietyFormData;
}

const CommunityAddCard = ({ formData }: CommunityAddCardProps) => {
  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'residential-complex': return 'Residential Complex';
      case 'gated-community': return 'Gated Community';
      case 'high-rise-apartments': return 'High-Rise Apartments';
      case 'villa-community': return 'Villa Community';
      case 'residential-tower': return 'Residential Tower';
      case 'it-hub-apartments': return 'IT Hub Apartments';
      case 'coastal-residences': return 'Coastal Residences';
      case 'heritage-villas': return 'Heritage Villas';
      default: return 'Residential';
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'under_construction': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'under_construction': return 'Under Construction';
      default: return 'New Community';
    }
  };

  const formatAddress = () => {
    const parts = [formData?.address, formData?.city, formData?.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address will appear here';
  };

  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="position-relative">
            <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '200px' }}>
              <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-48 text-muted" />
            </div>
            <span className="position-absolute top-0 end-0 p-1">
              <span className={`badge bg-${getStatusBadgeVariant(formData?.status)} text-light fs-13`}>
                {getStatusLabel(formData?.status)}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <h4 className="mb-1">
              {formData?.name || 'Preview Community'}
              <span className="fs-14 text-muted ms-1">({getTypeLabel(formData?.society_type)})</span>
            </h4>
            <p className="mb-1">{formatAddress()}</p>
            <h5 className="text-dark fw-medium mt-3">Total Units:</h5>
            <h4 className="fw-semibold mt-2 text-muted">{formData?.total_units || 0}</h4>
          </div>
          <Row className="mt-2 g-2">
            <Col lg={6} xs={6}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:home-2-bold-duotone"
                    className="align-middle"
                  />
                </span>
                &nbsp;{formData?.total_units || 0} Units
              </span>
            </Col>
            <Col lg={6} xs={6}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:double-alt-arrow-up-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;{formData?.total_floors || 0} Floors
              </span>
            </Col>
            <Col lg={6} xs={6}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:calendar-bold-duotone"
                    className="align-middle"
                  />
                </span>
                &nbsp;{formData?.established_year || new Date().getFullYear()}
              </span>
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-2">
            <Col lg={12}>
              <div className="text-center">
                <small className="text-muted">
                  {formData?.maintenance_charge ? `GH₵ ${formData.maintenance_charge}/month` : 'No maintenance charge set'}
                  {formData?.parking_slots ? ` • ${formData.parking_slots} Parking Slots` : ''}
                  {formData?.total_blocks ? ` • ${formData.total_blocks} Blocks` : ''}
                </small>
              </div>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default CommunityAddCard;
