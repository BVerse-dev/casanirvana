import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, Card, CardBody, CardHeader, Col, Table, Badge } from "react-bootstrap";
import Link from "next/link";
import type { Database } from "@/lib/database.types";
import { useListUnits } from "@/hooks/useUnits";

type Society = Database["public"]["Tables"]["societies"]["Row"];

interface CommunityUnitsProps {
  society: Society;
}

const CommunityUnits = ({ society }: CommunityUnitsProps) => {
  // Fetch units for this specific society
  const { data: unitsData, isLoading, error } = useListUnits({ 
    societyId: society.id, 
    pageSize: 100 // Get all units for this society
  });
  
  const units = unitsData?.data || [];
  const occupiedUnits = units.filter(unit => unit.status === 'occupied');
  const vacantUnits = units.filter(unit => unit.status === 'available');

  if (isLoading) {
    return (
      <Col xl={12}>
        <Card>
          <CardHeader>
            <h4 className="card-title mb-0">Units in {society.name}</h4>
          </CardHeader>
          <CardBody>
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading units...</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col xl={12}>
        <Card>
          <CardHeader>
            <h4 className="card-title mb-0">Units in {society.name}</h4>
          </CardHeader>
          <CardBody>
            <div className="text-center py-4">
              <IconifyIcon icon="solar:danger-bold-duotone" className="fs-48 text-danger mb-3 d-block" />
              <h5 className="text-danger">Error loading units</h5>
              <p className="text-muted">Unable to fetch units for this society.</p>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1">Units in {society.name}</h4>
            <div className="d-flex gap-3">
              <span className="text-muted small">
                <IconifyIcon icon="solar:home-2-bold-duotone" className="me-1 text-success" />
                {occupiedUnits.length} Occupied
              </span>
              <span className="text-muted small">
                <IconifyIcon icon="solar:home-broken" className="me-1 text-warning" />
                {vacantUnits.length} Vacant
              </span>
              <span className="text-muted small">
                <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-1 text-primary" />
                {units.length} Total Units
              </span>
            </div>
          </div>
          <Link href="/property/add">
            <Button variant="primary" size="sm">
              <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
              Add Unit
            </Button>
          </Link>
        </CardHeader>
        <CardBody>
          {units.length === 0 ? (
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
              <Table className="table-centered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Unit</th>
                    <th>Block/Floor</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Owner/Tenant</th>
                    <th>Rent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.slice(0, 10).map((unit) => {
                    // Handle profile data safely
                    const profile = unit.profiles && typeof unit.profiles === 'object' && 'first_name' in unit.profiles 
                      ? unit.profiles as { first_name: string; last_name: string; email: string; phone?: string }
                      : null;
                    
                    return (
                      <tr key={unit.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-light rounded me-2 d-flex align-items-center justify-content-center">
                              <IconifyIcon 
                                icon={unit.status === 'occupied' ? "solar:home-bold-duotone" : "solar:home-broken"} 
                                className={unit.status === 'occupied' ? "text-success" : "text-warning"} 
                              />
                            </div>
                            <div>
                              <h6 className="mb-1">
                                <Link 
                                  href={`/property/details?id=${unit.id}`} 
                                  className="text-decoration-none"
                                >
                                  {unit.number || unit.unit_number || `Unit ${unit.id.substring(0, 8)}`}
                                </Link>
                              </h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">Block {unit.block || 'A'}</div>
                            <div className="text-muted small">Floor {unit.floor || 1}</div>
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <div>{unit.bedrooms || 2} BHK</div>
                            <div className="text-muted">{unit.floor_area || unit.area_sqft || 800} sqft</div>
                          </div>
                        </td>
                        <td>
                          <Badge 
                            bg={unit.status === 'occupied' ? "success" : "warning"} 
                            className="small"
                          >
                            {unit.status === 'occupied' ? 'Occupied' : 'Available'}
                          </Badge>
                        </td>
                        <td>
                          {profile?.first_name || profile?.last_name ? (
                            <div>
                              <div className="fw-medium small">
                                {profile.first_name} {profile.last_name}
                              </div>
                              <div className="text-muted small">Owner</div>
                            </div>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td>
                          {unit.rent_amount ? (
                            <span className="fw-medium">₹{unit.rent_amount.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link href={`/property/details?id=${unit.id}`}>
                              <Button 
                                variant="light" 
                                size="sm"
                                title="View Details"
                              >
                                <IconifyIcon icon="solar:eye-bold-duotone" />
                              </Button>
                            </Link>
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
                    );
                  })}
                </tbody>
              </Table>
              
              {units.length > 10 && (
                <div className="text-center mt-3">
                  <Link href={`/property/list?society=${society.id}`}>
                    <Button variant="outline-primary">
                      <IconifyIcon icon="solar:eye-bold-duotone" className="me-1" />
                      View All {units.length} Units
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default CommunityUnits;
