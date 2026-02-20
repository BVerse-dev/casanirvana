"use client";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
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

// Filter interface for type safety
export interface CommunityFilters {
  location: string;
  status: string;
  communityType: string;
  unitsRange: [number, number];
  minOccupancy: number | null;
  maxOccupancy: number | null;
  minArea: number | null;
  maxArea: number | null;
  amenities: string[];
}

interface CommunitiesFilterProps {
  onFiltersChange: (filters: CommunityFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const CommunitiesFilter = ({ onFiltersChange, onApplyFilters, onResetFilters }: CommunitiesFilterProps) => {
  const [filters, setFilters] = useState<CommunityFilters>({
    location: "",
    status: "",
    communityType: "",
    unitsRange: [10, 500],
    minOccupancy: null,
    maxOccupancy: null,
    minArea: null,
    maxArea: null,
    amenities: [],
  });

  const handleFilterChange = (key: keyof CommunityFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSliderChange = (values: number[]) => {
    handleFilterChange('unitsRange', [values[0], values[1]] as [number, number]);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);
    handleFilterChange('amenities', newAmenities);
  };

  const handleReset = () => {
    const resetFilters: CommunityFilters = {
      location: "",
      status: "",
      communityType: "",
      unitsRange: [10, 500],
      minOccupancy: null,
      maxOccupancy: null,
      minArea: null,
      maxArea: null,
      amenities: [],
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    onResetFilters();
  };

  return (
    <Col xl={3} lg={12}>
      <Card>
        <CardHeader className="border-bottom">
          <div>
            <CardTitle as={"h4"}>Societies</CardTitle>
            <p className="mb-0">Filter available societies</p>
          </div>
        </CardHeader>
        <CardBody className="border-light">
          <form>
            <label htmlFor="choices-single-location" className="form-label">
              Location
            </label>
            <ChoicesFormInput
              className="form-control"
              id="choices-single-location"
              data-placeholder="Select Location"
              onChange={(value) => handleFilterChange('location', value)}
            >
              <option value="">Choose a location</option>
              <option value="sector-1">Sector 1</option>
              <option value="sector-2">Sector 2</option>
              <option value="sector-3">Sector 3</option>
              <option value="sector-4">Sector 4</option>
              <option value="sector-5">Sector 5</option>
              <option value="downtown">Downtown</option>
              <option value="uptown">Uptown</option>
              <option value="suburbs">Suburbs</option>
              <option value="mumbai">Mumbai</option>
              <option value="pune">Pune</option>
              <option value="bangalore">Bangalore</option>
              <option value="delhi">Delhi</option>
              <option value="goa">Goa</option>
            </ChoicesFormInput>
            
            <Row className="mt-3">
              <Col lg={12}>
                <label htmlFor="choices-single-status" className="form-label">
                  Status
                </label>
                <ChoicesFormInput
                  className="form-control"
                  id="choices-single-status"
                  data-placeholder="Select Status"
                  onChange={(value) => handleFilterChange('status', value)}
                >
                  <option value="">Choose status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="planned">Planned</option>
                </ChoicesFormInput>
              </Col>
            </Row>
            
            <Row className="mt-3">
              <Col lg={12}>
                <label htmlFor="choices-single-type" className="form-label">
                  Society Type
                </label>
                <ChoicesFormInput
                  className="form-control"
                  id="choices-single-type"
                  data-placeholder="Select Type"
                  onChange={(value) => handleFilterChange('communityType', value)}
                >
                  <option value="">Choose community type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed Use</option>
                  <option value="luxury">Luxury</option>
                  <option value="affordable">Affordable Housing</option>
                </ChoicesFormInput>
              </Col>
            </Row>

            <div className="mt-3">
              <label className="form-label">Total Units Range</label>
              <Nouislider
                range={{ min: 10, max: 1000 }}
                start={filters.unitsRange}
                connect
                onSlide={handleSliderChange}
                tooltips={[true, true]}
                format={{
                  to: (value: number) => Math.round(value),
                  from: (value: string) => Number(value),
                }}
              />
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">{filters.unitsRange[0]} units</span>
                <span className="text-muted">{filters.unitsRange[1]} units</span>
              </div>
            </div>
            
            <Row className="mt-3">
              <Col lg={6}>
                <label htmlFor="min-occupancy" className="form-label">
                  Min Occupancy (%)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="min-occupancy"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={filters.minOccupancy || ''}
                  onChange={(e) => handleFilterChange('minOccupancy', e.target.value ? Number(e.target.value) : null)}
                />
              </Col>
              <Col lg={6}>
                <label htmlFor="max-occupancy" className="form-label">
                  Max Occupancy (%)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="max-occupancy"
                  placeholder="100"
                  min="0"
                  max="100"
                  value={filters.maxOccupancy || ''}
                  onChange={(e) => handleFilterChange('maxOccupancy', e.target.value ? Number(e.target.value) : null)}
                />
              </Col>
            </Row>
            
            <Row className="mt-3">
              <Col lg={6}>
                <label htmlFor="min-area" className="form-label">
                  Min Area (acres)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="min-area"
                  placeholder="0.5"
                  step="0.1"
                  value={filters.minArea || ''}
                  onChange={(e) => handleFilterChange('minArea', e.target.value ? Number(e.target.value) : null)}
                />
              </Col>
              <Col lg={6}>
                <label htmlFor="max-area" className="form-label">
                  Max Area (acres)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="max-area"
                  placeholder="50"
                  step="0.1"
                  value={filters.maxArea || ''}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value ? Number(e.target.value) : null)}
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col lg={12}>
                <label className="form-label">Amenities</label>
                <div className="mt-2">
                  {[
                    { id: 'swimming-pool', label: 'Swimming Pool' },
                    { id: 'gym', label: 'Gym' },
                    { id: 'playground', label: 'Playground' },
                    { id: 'clubhouse', label: 'Clubhouse' },
                    { id: 'parking', label: 'Parking' },
                    { id: 'security', label: '24x7 Security' },
                    { id: 'gardens', label: 'Gardens' },
                    { id: 'power-backup', label: 'Power Backup' },
                  ].map((amenity) => (
                    <div key={amenity.id} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={amenity.id}
                        id={`amenity-${amenity.id}`}
                        checked={filters.amenities.includes(amenity.id)}
                        onChange={(e) => handleAmenityChange(amenity.id, e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`amenity-${amenity.id}`}>
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </form>
        </CardBody>
        <CardFooter className="border-top">
          <div className="hstack gap-2">
            <Button variant="primary" className="w-100" onClick={onApplyFilters}>
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

export default CommunitiesFilter;
