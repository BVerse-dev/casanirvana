"use client";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import TextFormInput from "@/components/from/TextFormInput";
import SelectFormInput from "@/components/from/SelectFormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Form,
  FormCheck,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as yup from "yup";

interface SocietyFormData {
  // Basic Information
  name: string;
  type: string;
  address: string;
  description: string;
  establishedYear: number;
  area: string;
  totalUnits: number;
  totalFloors: number;
  totalBlocks: number;
  
  // Features & Amenities
  amenities: string[];
  features: string[];
  
  // Financial Information
  maintenanceCharges: number;
  currency: string;
  
  // Management Information
  managerName: string;
  managerContact: string;
  secretaryName: string;
  secretaryContact: string;
  
  // Status & Rating
  status: 'active' | 'inactive' | 'under-construction';
  rating: number;
}

const CommunityAdd = () => {
  const router = useRouter();

  // Available options for dropdowns
  const societyTypes = [
    { value: 'residential-complex', label: 'Residential Complex' },
    { value: 'gated-community', label: 'Gated Community' },
    { value: 'high-rise-apartments', label: 'High-Rise Apartments' },
    { value: 'villa-community', label: 'Villa Community' },
    { value: 'residential-tower', label: 'Residential Tower' },
    { value: 'it-hub-apartments', label: 'IT Hub Apartments' },
    { value: 'coastal-residences', label: 'Coastal Residences' },
    { value: 'heritage-villas', label: 'Heritage Villas' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'under-construction', label: 'Under Construction' },
  ];

  const currencyOptions = [
    { value: 'USD', label: '$ US Dollar' },
    { value: 'EUR', label: '€ Euro' },
  ];

  // Available amenities and features
  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Clubhouse', 'Children Play Area', 'Security',
    'Garden', 'Parking', 'Power Backup', 'Water Supply', 'Spa', 'Concierge',
    'Valet Parking', 'Golf Course', 'Tennis Court', 'Library', 'Cafeteria',
    'Wi-Fi', 'Sea View', 'Heritage Architecture', 'Jogging Track',
    'Community Hall', 'Multi-purpose Court', 'Meditation Center'
  ];

  const availableFeatures = [
    'Lift', 'CCTV Security', '24/7 Power Backup', 'Water Harvesting',
    'Waste Management', 'Fire Safety', 'Intercom Facility', 'Visitor Management',
    'Car Wash', 'Laundry Service', 'Housekeeping', 'Maintenance Service',
    'Senior Citizen Care', 'Pet Friendly', 'Solar Power', 'EV Charging'
  ];

  const societySchema = yup.object({
    // Basic Information
    name: yup.string().required("Please enter community name"),
    type: yup.string().required("Please select community type"),
    address: yup.string().required("Please enter address"),
    description: yup.string().required("Please enter description"),
    establishedYear: yup.number()
      .required("Please enter established year")
      .min(1950, "Year must be after 1950")
      .max(new Date().getFullYear(), "Year cannot be in the future"),
    area: yup.string().required("Please enter area/location"),
    totalUnits: yup.number()
      .required("Please enter total units")
      .min(1, "Must have at least 1 unit"),
    totalFloors: yup.number()
      .required("Please enter total floors")
      .min(1, "Must have at least 1 floor"),
    totalBlocks: yup.number()
      .required("Please enter total blocks")
      .min(1, "Must have at least 1 block"),
    
    // Features & Amenities
    amenities: yup.array().of(yup.string().required()).default([]),
    features: yup.array().of(yup.string().required()).default([]),
    
    // Financial Information
    maintenanceCharges: yup.number()
      .required("Please enter maintenance charges")
      .min(0, "Charges cannot be negative"),
    currency: yup.string().required("Please select currency"),
    
    // Management Information
    managerName: yup.string().required("Please enter manager name"),
    managerContact: yup.string().required("Please enter manager contact"),
    secretaryName: yup.string().required("Please enter secretary name"),
    secretaryContact: yup.string().required("Please enter secretary contact"),
    
    // Status & Rating
    status: yup.string().oneOf(['active', 'inactive', 'under-construction']).required("Please select status"),
    rating: yup.number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5")
      .required("Please enter initial rating"),
  });

  const { handleSubmit, control, reset, watch, setValue, getValues } = useForm<SocietyFormData>({
    resolver: yupResolver(societySchema),
    defaultValues: {
      amenities: [],
      features: [],
      establishedYear: new Date().getFullYear(),
      totalUnits: 1,
      totalFloors: 1,
      totalBlocks: 1,
      maintenanceCharges: 0,
      currency: 'USD',
      status: 'active',
      rating: 4.0,
    },
  });

  // Watch form values for preview card
  const watchedValues = watch();

  const onSubmit = async (data: SocietyFormData) => {
    try {
      // Simulate API call with dummy implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would call the API
      console.log("Creating community with data:", data);
      
      toast.success("Community created successfully!");
      reset();
      router.push("/communities/list");
    } catch (error) {
      toast.error("Failed to create community");
      console.error("Error creating community:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={"h4"}>Basic Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="name"
                    placeholder="Community Name"
                    label="Community Name"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <SelectFormInput
                    control={control}
                    name="type"
                    label="Community Type"
                    options={societyTypes}
                    placeholder="Select community type"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="address"
                    label="Community Address"
                    className="form-control"
                    rows={3}
                    placeholder="Enter complete address"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="area"
                    placeholder="Area/Location"
                    label="Area/Location"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="establishedYear"
                    type="number"
                    placeholder="Established Year"
                    label="Established Year"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="description"
                    label="Description"
                    className="form-control"
                    rows={4}
                    placeholder="Enter community description, features, and other details"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Unit Configuration */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={"h4"}>Unit Configuration</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="totalUnits"
                    type="number"
                    placeholder="Total Units"
                    label="Total Units"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="totalFloors"
                    type="number"
                    placeholder="Total Floors"
                    label="Total Floors"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="totalBlocks"
                    type="number"
                    placeholder="Total Blocks"
                    label="Total Blocks"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Financial Information */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={"h4"}>Financial Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="maintenanceCharges"
                    type="number"
                    placeholder="Monthly Maintenance Charges"
                    label="Monthly Maintenance Charges"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <SelectFormInput
                    control={control}
                    name="currency"
                    label="Currency"
                    options={currencyOptions}
                    placeholder="Select currency"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Management Information */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={"h4"}>Management Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="managerName"
                    placeholder="Community Manager Name"
                    label="Community Manager Name"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="managerContact"
                    placeholder="Manager Contact (Phone/Email)"
                    label="Manager Contact"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="secretaryName"
                    placeholder="Secretary Name"
                    label="Secretary Name"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="secretaryContact"
                    placeholder="Secretary Contact (Phone/Email)"
                    label="Secretary Contact"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Amenities & Features */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={"h4"}>Amenities & Features</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <h6 className="mb-3">Available Amenities</h6>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {availableAmenities.map((amenity) => (
                      <FormCheck
                        key={amenity}
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        label={amenity}
                        className="mb-2"
                        onChange={(e) => {
                          const currentAmenities = getValues('amenities') || [];
                          const newAmenities = e.target.checked
                            ? [...currentAmenities, amenity]
                            : currentAmenities.filter(a => a !== amenity);
                          setValue('amenities', newAmenities);
                        }}
                        checked={watchedValues.amenities?.includes(amenity) || false}
                      />
                    ))}
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <h6 className="mb-3">Available Features</h6>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {availableFeatures.map((feature) => (
                      <FormCheck
                        key={feature}
                        type="checkbox"
                        id={`feature-${feature}`}
                        label={feature}
                        className="mb-2"
                        onChange={(e) => {
                          const currentFeatures = getValues('features') || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature]
                            : currentFeatures.filter(f => f !== feature);
                          setValue('features', newFeatures);
                        }}
                        checked={watchedValues.features?.includes(feature) || false}
                      />
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Status & Rating */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={"h4"}>Status & Rating</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <SelectFormInput
                    control={control}
                    name="status"
                    label="Community Status"
                    options={statusOptions}
                    placeholder="Select status"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="Initial Rating (1-5)"
                    label="Initial Rating"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button 
                variant="outline-primary" 
                type="submit" 
                className="w-100"
              >
                Create Community
              </Button>
            </Col>
            <Col lg={2}>
              <Button 
                variant="danger" 
                className="w-100"
                onClick={() => router.push("/communities/list")}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
      </form>
    </>
  );
};

export default CommunityAdd;
