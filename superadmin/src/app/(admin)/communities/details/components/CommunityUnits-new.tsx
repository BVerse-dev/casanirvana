import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, Card, CardBody, CardHeader, Col, Table, Badge } from "react-bootstrap";
import Link from "next/link";
import { SocietyDummyData } from "@/assets/data/communities-dummy";

interface CommunityUnitsProps {
  society: SocietyDummyData;
}

// Generate dummy units data for the society
const generateDummyUnits = (society: SocietyDummyData) => {
  const units = [];
  const blocks = ['A', 'B', 'C', 'D'];
  const floorsPerBlock = Math.ceil(society.totalUnits / blocks.length / 10);
  
  for (let i = 1; i <= society.totalUnits; i++) {
    const blockIndex = Math.floor((i - 1) / (society.totalUnits / blocks.length));
    const block = blocks[blockIndex] || 'A';
    const floor = Math.floor(((i - 1) % (society.totalUnits / blocks.length)) / 2) + 1;
    const unitNumber = ((i - 1) % 2) + 1;
    const unitCode = `${block}-${floor}${unitNumber.toString().padStart(2, '0')}`;
    
    // Determine if unit is occupied based on society's occupancy rate
    const isOccupied = i <= society.occupiedUnits;
    
    units.push({
      id: `unit-${society.id}-${i}`,
      unitNumber: unitCode,
      block: block,
      floor: floor,
      bedrooms: Math.floor(Math.random() * 3) + 1, // 1-3 bedrooms
      bathrooms: Math.floor(Math.random() * 2) + 1, // 1-2 bathrooms
      floorArea: Math.floor(Math.random() * 500) + 500, // 500-1000 sqft
      isOccupied: isOccupied,
      ownerName: isOccupied ? `Resident ${i}` : null,
      rentAmount: isOccupied ? Math.floor(Math.random() * 20000) + 15000 : null,
      status: isOccupied ? 'Occupied' : 'Vacant',
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return units;
};

const CommunityUnits = ({ society }: CommunityUnitsProps) => {
  const units = generateDummyUnits(society);
  const occupiedUnits = units.filter(unit => unit.isOccupied);
  const vacantUnits = units.filter(unit => !unit.isOccupied);

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
          <Button variant="primary" size="sm" as={Link} href="/property/add">
            <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
            Add Unit
          </Button>
        </CardHeader>
        <CardBody>
          {units.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon 
                icon="solar:home-2-bold-duotone" 
                className="fs-48 text-muted mb-3 d-block" 
              />
              <h5 className="text-muted">No units found</h5>
              <p className="text-muted">This society doesn't have any units yet.</p>
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
                  {units.slice(0, 10).map((unit) => (
                    <tr key={unit.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light rounded me-2 d-flex align-items-center justify-content-center">
                            <IconifyIcon 
                              icon={unit.isOccupied ? "solar:home-bold-duotone" : "solar:home-broken"} 
                              className={unit.isOccupied ? "text-success" : "text-warning"} 
                            />
                          </div>
                          <div>
                            <h6 className="mb-1">
                              <Link 
                                href={`/property/details?id=${unit.id}`} 
                                className="text-decoration-none"
                              >
                                {unit.unitNumber}
                              </Link>
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">Block {unit.block}</div>
                          <div className="text-muted small">Floor {unit.floor}</div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div>{unit.bedrooms} BHK</div>
                          <div className="text-muted">{unit.floorArea} sqft</div>
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={unit.isOccupied ? "success" : "warning"} 
                          className="small"
                        >
                          {unit.status}
                        </Badge>
                      </td>
                      <td>
                        {unit.ownerName ? (
                          <div>
                            <div className="fw-medium small">{unit.ownerName}</div>
                            <div className="text-muted small">Resident</div>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {unit.rentAmount ? (
                          <span className="fw-medium">${unit.rentAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="light" 
                            size="sm"
                            as={Link}
                            href={`/property/details?id=${unit.id}`}
                            title="View Details"
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
              
              {units.length > 10 && (
                <div className="text-center mt-3">
                  <Button variant="outline-primary" as={Link} href={`/property/list?society=${society.id}`}>
                    <IconifyIcon icon="solar:eye-bold-duotone" className="me-1" />
                    View All {units.length} Units
                  </Button>
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
