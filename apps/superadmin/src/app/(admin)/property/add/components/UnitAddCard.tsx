import properties1 from "@/assets/images/properties/p-1.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import { Button, Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";

interface UnitAddCardProps {
  communityName?: string;
  formData?: {
    unit_number?: string;
    type?: string;
    area?: number | null;
    floor?: number | null;
    status?: string;
    rent_amount?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    balconies?: number | null;
    description?: string | null;
    parking?: boolean;
    gym?: boolean;
    swimming_pool?: boolean;
    garden?: boolean;
    security?: boolean;
    elevator?: boolean;
    power_backup?: boolean;
    wifi?: boolean;
  };
}

const UnitAddCard = ({ formData, communityName }: UnitAddCardProps) => {
  const unitNumber = formData?.unit_number || "Unit number not entered";
  const unitType = formData?.type?.toUpperCase() || "Type not selected";
  const floor = formData?.floor;
  const status = formData?.status || "vacant";
  const rentAmount = formData?.rent_amount;
  const bedrooms = formData?.bedrooms;
  const bathrooms = formData?.bathrooms;

  // Get selected amenities
  const amenities = [];
  if (formData?.parking) amenities.push({ name: "Parking", color: "success" });
  if (formData?.gym) amenities.push({ name: "Gym Access", color: "info" });
  if (formData?.swimming_pool) amenities.push({ name: "Swimming Pool", color: "primary" });
  if (formData?.garden) amenities.push({ name: "Garden View", color: "warning" });
  if (formData?.security) amenities.push({ name: "24/7 Security", color: "danger" });
  if (formData?.elevator) amenities.push({ name: "Elevator", color: "secondary" });
  if (formData?.power_backup) amenities.push({ name: "Power Backup", color: "dark" });
  if (formData?.wifi) amenities.push({ name: "Wi-Fi", color: "info" });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vacant":
        return { color: "success", text: "Available" };
      case "occupied":
        return { color: "warning", text: "Occupied" };
      case "maintenance":
        return { color: "danger", text: "Maintenance" };
      default:
        return { color: "primary", text: "New Unit" };
    }
  };

  const statusBadge = getStatusBadge(status);

  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="position-relative">
            <Image
              src={properties1}
              alt="unit-preview"
              className="img-fluid rounded bg-light"
            />
            <span className="position-absolute top-0 end-0 p-1">
              <span className={`badge bg-${statusBadge.color} text-light fs-13`}>
                {statusBadge.text}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <h4 className="mb-1">
              {unitNumber}
              <span className="fs-14 text-muted ms-1">({unitType})</span>
            </h4>
            <p className="mb-1">{communityName || "Community not selected"}</p>
            <h5 className="text-dark fw-medium mt-3">Monthly Rent :</h5>
            <h4 className="fw-semibold mt-2 text-muted">
              {rentAmount == null ? "Not entered" : "GH₵" + rentAmount.toLocaleString()}
            </h4>
          </div>
          <Row className="mt-2 g-2">
            <Col lg={6} xs={6}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:home-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;{unitType}
              </span>
            </Col>
            <Col lg={6} xs={6}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:bath-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;{bathrooms ?? "—"} Bath
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
                &nbsp;{floor ?? "—"} Floor
              </span>
            </Col>
            <Col lg={6} xs={6}>
              <span className="badge bg-light-subtle text-muted border fs-12">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:bed-broken"
                    className="align-middle"
                  />
                </span>
                &nbsp;{bedrooms ?? "—"} Bed
              </span>
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="bg-light-subtle border-top">
          <div className="w-100">
            <h6 className="fs-14 mb-2">Unit Features:</h6>
            <div className="d-flex flex-wrap gap-2">
              {amenities.slice(0, 4).map((amenity, index) => (
                <span key={index} className={`badge bg-${amenity.color}-subtle text-${amenity.color}`}>
                  {amenity.name}
                </span>
              ))}
              {amenities.length === 0 && (
                <span className="text-muted small">No features selected yet.</span>
              )}
              {amenities.length > 4 && (
                <span className="badge bg-secondary-subtle text-secondary">
                  +{amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardBody>
          <h5 className="fs-15 fw-semibold mb-3">Quick Actions</h5>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" size="sm" disabled>
              <IconifyIcon icon="solar:gallery-broken" className="me-2" />
              Add More Photos
            </Button>
            <Button variant="outline-secondary" size="sm" disabled>
              <IconifyIcon icon="solar:map-point-broken" className="me-2" />
              Set Location
            </Button>
            <Button variant="outline-success" size="sm" disabled>
              <IconifyIcon icon="solar:document-broken" className="me-2" />
              Upload Documents
            </Button>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default UnitAddCard;
