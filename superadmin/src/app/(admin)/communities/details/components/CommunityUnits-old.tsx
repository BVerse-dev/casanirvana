import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, Card, CardBody, CardHeader, Col, Table } from "react-bootstrap";
import Link from "next/link";

interface CommunityUnitsProps {
  society: {
    id: string;
    name: string;
  };
  units: Array<{
    id: string;
    society_id: string;
    block: string;
    number: string;
    owner_id?: string | null;
    floor_area?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    created_at: string;
    updated_at: string;
  }>;
  unitsLoading: boolean;
}

const CommunityUnits = ({ society, units, unitsLoading }: CommunityUnitsProps) => {
  return (
    <Col xl={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h4 className="card-title">Units in {society.name}</h4>
          <Button variant="primary" size="sm">
            <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
            Add Unit
          </Button>
        </CardHeader>
        <CardBody>
          {unitsLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon 
                icon="solar:home-2-bold-duotone" 
                className="fs-48 text-muted mb-3 d-block" 
              />
              <h5 className="text-muted">No units found</h5>
              <p className="text-muted">This society doesn&apos;t have any units yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Unit Number</th>
                    <th>Block</th>
                    <th>Floor Area (sq ft)</th>
                    <th>Bedrooms</th>
                    <th>Bathrooms</th>
                    <th>Owner ID</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td>
                        <Link 
                          href={`/property/details?id=${unit.id}`}
                          className="text-dark fw-medium text-decoration-none"
                        >
                          {unit.number}
                        </Link>
                      </td>
                      <td>{unit.block}</td>
                      <td>{unit.floor_area || '-'}</td>
                      <td>{unit.bedrooms || '-'}</td>
                      <td>{unit.bathrooms || '-'}</td>
                      <td>{unit.owner_id || '-'}</td>
                      <td>{new Date(unit.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="light" 
                            size="sm"
                            title="View Unit"
                          >
                            <IconifyIcon icon="solar:eye-bold-duotone" />
                          </Button>
                          <Button 
                            variant="light" 
                            size="sm"
                            title="Edit Unit"
                          >
                            <IconifyIcon icon="solar:pen-bold-duotone" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          
          {units.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="text-muted">
                Showing {units.length} units
              </span>
              <span className="text-muted">
                Total units in {society.name}: {units.length}
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default CommunityUnits;
