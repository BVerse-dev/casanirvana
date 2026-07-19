"use client";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import { useListCommunities } from "@/hooks/useCommunities";
import Nouislider from "nouislider-react";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";

export interface UnitsFilterState {
  communityId?: string;
  unitType?: string;
  status?: string;
  rentRange: [number, number];
  minArea?: number;
  maxArea?: number;
  minFloor?: number;
  maxFloor?: number;
}

interface UnitsFilterProps {
  onFilterChange: (filters: UnitsFilterState) => void;
  onReset: () => void;
}

const UnitsFilter = ({ onFilterChange, onReset }: UnitsFilterProps) => {
  const { data: communitiesData } = useListCommunities();
  const communities = communitiesData?.data || [];
  
  const [filters, setFilters] = useState<UnitsFilterState>({
    rentRange: [5000, 50000],
  });

  const handleFilterChange = (key: keyof UnitsFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSliderChange = (values: any) => {
    const newFilters = { ...filters, rentRange: values };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters: UnitsFilterState = {
      rentRange: [5000, 50000],
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <Col xl={3} lg={12}>
      <Card>
        <CardHeader className="border-bottom">
          <div>
            <CardTitle as={"h4"}>Units</CardTitle>
            <p className="mb-0">Filter available units</p>
          </div>
        </CardHeader>
        <CardBody className="border-light">
          <form>
            <label htmlFor="choices-single-groups" className="form-label">
              Community Location
            </label>
            <ChoicesFormInput
              className="form-control"
              id="choices-single-groups"
              data-placeholder="Select Community"
              onChange={(value) => handleFilterChange('communityId', value)}
            >
              <option value="">Choose a Community</option>
              {communities?.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </ChoicesFormInput>
            <Row className="mt-3">
              <Col lg={12}>
                <label htmlFor="choices-single-default" className="form-label">
                  Unit Type
                </label>
                <ChoicesFormInput
                  className="form-control"
                  id="choices-single-default"
                  data-placeholder="Select Unit Type"
                  onChange={(value) => handleFilterChange('unitType', value)}
                >
                  <option value="">Choose unit type</option>
                  <option value="1bhk">1 BHK</option>
                  <option value="2bhk">2 BHK</option>
                  <option value="3bhk">3 BHK</option>
                  <option value="4bhk">4 BHK</option>
                  <option value="studio">Studio</option>
                </ChoicesFormInput>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col lg={12}>
                <label htmlFor="choices-single-default2" className="form-label">
                  Status
                </label>
                <ChoicesFormInput
                  className="form-control"
                  id="choices-single-default2"
                  data-placeholder="Select Status"
                  onChange={(value) => handleFilterChange('status', value)}
                >
                  <option value="">Choose status</option>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </ChoicesFormInput>
              </Col>
            </Row>
            <div className="mt-3">
              <label className="form-label">Rent Range ($)</label>
              <Nouislider
                range={{ min: 5000, max: 100000 }}
                start={filters.rentRange}
                connect
                onSlide={handleSliderChange}
                tooltips={[true, true]}
                format={{
                  to: (value: number) => Math.round(value),
                  from: (value: string) => Number(value),
                }}
              />
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">${filters.rentRange[0]}</span>
                <span className="text-muted">${filters.rentRange[1]}</span>
              </div>
            </div>
            <Row className="mt-3">
              <Col lg={6}>
                <label htmlFor="min-area" className="form-label">
                  Min Area (sq ft)
                </label>
                <input
                  type="number"
                  id="min-area"
                  className="form-control"
                  placeholder="500"
                  value={filters.minArea || ''}
                  onChange={(e) => handleFilterChange('minArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </Col>
              <Col lg={6}>
                <label htmlFor="max-area" className="form-label">
                  Max Area (sq ft)
                </label>
                <input
                  type="number"
                  id="max-area"
                  className="form-control"
                  placeholder="2000"
                  value={filters.maxArea || ''}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col lg={6}>
                <label htmlFor="min-floor" className="form-label">
                  Min Floor
                </label>
                <input 
                  type="number" 
                  id="min-floor"
                  className="form-control" 
                  placeholder="1"
                  value={filters.minFloor || ''}
                  onChange={(e) => handleFilterChange('minFloor', e.target.value ? Number(e.target.value) : undefined)}
                />
              </Col>
              <Col lg={6}>
                <label htmlFor="max-floor" className="form-label">
                  Max Floor
                </label>
                <input
                  type="number"
                  id="max-floor"
                  className="form-control"
                  placeholder="20"
                  value={filters.maxFloor || ''}
                  onChange={(e) => handleFilterChange('maxFloor', e.target.value ? Number(e.target.value) : undefined)}
                />
              </Col>
            </Row>
          </form>
        </CardBody>
        <CardFooter className="border-top">
          <div className="hstack gap-2">
            <Button variant="primary" className="w-100" onClick={handleApplyFilters}>
              Apply Filter
            </Button>
            <Button variant="soft-danger" className="w-100" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default UnitsFilter;
