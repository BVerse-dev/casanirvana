"use client";
import React from "react";
import FileUpload from "@/components/FileUpload";
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
import CommunityAddCard from "./CommunityAddCard";
import { useCreateCommunity, useGetCommunity, useUpdateCommunity } from "@/hooks/useCommunities";

interface CommunityFormData {
  // Basic Information
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  
  // Society Details
  society_type: string;
  status: 'active' | 'inactive' | 'under_construction';
  total_units: number;
  total_floors: number;
  total_blocks: number;
  established_year: number;
  
  // Management Contact
  management_name?: string;
  management_email?: string;
  management_phone?: string;
  management_role?: string;
  
  // Financial
  maintenance_charge: number;
  security_deposit: number;
  parking_slots: number;
  
  // Banking
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
}

type CommunityAddFormProps = {
  editMode?: boolean;
  communityId?: string;
};

type LegacyCommunityFormSeed = {
  management_name?: string | null;
  management_email?: string | null;
  management_phone?: string | null;
  management_role?: string | null;
  bank_details?: {
    bank_name?: string | null;
    account_number?: string | null;
    ifsc_code?: string | null;
    account_holder_name?: string | null;
  } | null;
};

const CommunityAddForm = ({ editMode = false, communityId }: CommunityAddFormProps) => {
  const router = useRouter();
  const createCommunityMutation = useCreateCommunity();
  const { data: existingCommunity } = useGetCommunity(communityId || "");
  const updateCommunityMutation = useUpdateCommunity(communityId || "");

  // Available options for dropdowns
  const communityTypes = [
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
    { value: 'under_construction', label: 'Under Construction' },
  ];

  const communitySchema = yup.object({
    // Basic Information
    name: yup.string().required("Please enter community name"),
    address: yup.string().required("Please enter address"),
    city: yup.string().required("Please enter city"),
    state: yup.string().required("Please enter state"),
    pincode: yup.string().required("Please enter postal code"),
    phone: yup.string().optional(),
    email: yup.string().email("Please enter valid email").optional(),
    website: yup.string().url("Please enter valid website URL").optional(),
    description: yup.string().optional(),
    
    // Society Details
    society_type: yup.string().required("Please select community type"),
    status: yup.string().oneOf(['active', 'inactive', 'under_construction']).required("Please select status"),
    total_units: yup.number()
      .required("Please enter total units")
      .min(1, "Must have at least 1 unit"),
    total_floors: yup.number()
      .required("Please enter total floors")
      .min(1, "Must have at least 1 floor"),
    total_blocks: yup.number()
      .required("Please enter total blocks")
      .min(1, "Must have at least 1 block"),
    established_year: yup.number()
      .required("Please enter established year")
      .min(1950, "Year must be after 1950")
      .max(new Date().getFullYear(), "Year cannot be in the future"),
    
    // Management Contact
    management_name: yup.string().optional(),
    management_email: yup.string().email("Please enter valid email").optional(),
    management_phone: yup.string().optional(),
    management_role: yup.string().optional(),
    
    // Financial
    maintenance_charge: yup.number()
      .required("Please enter maintenance charge")
      .min(0, "Charge cannot be negative"),
    security_deposit: yup.number()
      .required("Please enter security deposit")
      .min(0, "Deposit cannot be negative"),
    parking_slots: yup.number()
      .required("Please enter parking slots")
      .min(0, "Parking slots cannot be negative"),
    
    // Banking
    bank_name: yup.string().optional(),
    account_number: yup.string().optional(),
    ifsc_code: yup.string().optional(),
    account_holder_name: yup.string().optional(),
  });

  const { handleSubmit, control, reset, watch, setValue, getValues } = useForm<CommunityFormData>({
    resolver: yupResolver(communitySchema),
    defaultValues: {
      established_year: new Date().getFullYear(),
      total_units: 1,
      total_floors: 1,
      total_blocks: 1,
      maintenance_charge: 0,
      security_deposit: 0,
      parking_slots: 0,
      status: 'active',
      society_type: 'residential-complex',
      management_name: '',
      management_email: '',
      management_phone: '',
      management_role: '',
    },
  });

  // Watch form values for preview card
  const watchedValues = watch();

  // Prefill form in edit mode when data is available
  React.useEffect(() => {
    if (!editMode || !existingCommunity) return;

    try {
      const legacySeed = existingCommunity as typeof existingCommunity & LegacyCommunityFormSeed;
      reset({
        name: existingCommunity.name || "",
        address: existingCommunity.address || "",
        city: existingCommunity.city || "",
        state: existingCommunity.state || "",
        pincode: existingCommunity.pincode || "",
        phone: existingCommunity.phone || "",
        email: existingCommunity.email || "",
        website: existingCommunity.website || "",
        description: existingCommunity.description || "",
        society_type: existingCommunity.society_type || "residential-complex",
        status: (existingCommunity.status as any) || 'active',
        total_units: Number(existingCommunity.total_units) || 1,
        total_floors: Number(existingCommunity.total_floors) || 1,
        total_blocks: Number(existingCommunity.total_blocks) || 1,
        established_year: Number(existingCommunity.established_year) || new Date().getFullYear(),
        maintenance_charge: Number(existingCommunity.maintenance_charge) || 0,
        security_deposit: Number(existingCommunity.security_deposit) || 0,
        parking_slots: Number(existingCommunity.parking_slots) || 0,
        management_name: legacySeed.management_name || "",
        management_email: legacySeed.management_email || "",
        management_phone: legacySeed.management_phone || "",
        management_role: legacySeed.management_role || "",
        bank_name: legacySeed.bank_details?.bank_name || "",
        account_number: legacySeed.bank_details?.account_number || "",
        ifsc_code: legacySeed.bank_details?.ifsc_code || "",
        account_holder_name: legacySeed.bank_details?.account_holder_name || "",
      });
    } catch (err) {
      console.error('Failed to prefill community form:', err);
    }
  }, [editMode, existingCommunity, reset]);

  const onSubmit = async (data: CommunityFormData) => {
    try {
      // Transform data to match database schema
      const communityData = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        description: data.description || null,
        society_type: data.society_type,
        status: data.status,
        total_units: data.total_units,
        total_floors: data.total_floors,
        total_blocks: data.total_blocks,
        established_year: data.established_year,
        maintenance_charge: data.maintenance_charge,
        security_deposit: data.security_deposit,
        parking_slots: data.parking_slots,
        bank_details: data.bank_name ? {
          bank_name: data.bank_name,
          account_number: data.account_number,
          ifsc_code: data.ifsc_code,
          account_holder_name: data.account_holder_name,
        } : null,
      };

      if (editMode && communityId) {
        await updateCommunityMutation.mutateAsync(communityData as any);
        toast.success("Community updated successfully!");
        router.push(`/communities/list`);
      } else {
        await createCommunityMutation.mutateAsync(communityData as any);
        toast.success("Community created successfully!");
        reset();
        router.push("/communities/list");
      }
    } catch (error) {
      console.error(editMode ? "Error updating community:" : "Error creating community:", error);
      toast.error(editMode ? "Failed to update community" : "Failed to create community");
    }
  };

  return (
    <Row>
      <CommunityAddCard formData={watchedValues} />
      <Col xl={9} lg={8}>
        <FileUpload title={editMode ? "Community Photos" : "Add Community Photos"} />
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
                    name="society_type"
                    label="Community Type"
                    options={communityTypes}
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
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="city"
                    placeholder="City"
                    label="City"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="state"
                    placeholder="State"
                    label="State"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="pincode"
                    placeholder="Postal Code"
                    label="Postal Code"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="phone"
                    placeholder="Phone Number"
                    label="Phone Number"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    label="Email Address"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="website"
                    placeholder="Website URL"
                    label="Website URL"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="established_year"
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
                    name="total_units"
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
                    name="total_floors"
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
                    name="total_blocks"
                    type="number"
                    placeholder="Total Blocks"
                    label="Total Blocks"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="parking_slots"
                    type="number"
                    placeholder="Parking Slots"
                    label="Parking Slots"
                  />
                </div>
              </Col>
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
                    name="maintenance_charge"
                    type="number"
                    placeholder="Monthly Maintenance Charge"
                    label="Monthly Maintenance Charge ($)"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="security_deposit"
                    type="number"
                    placeholder="Security Deposit"
                    label="Security Deposit ($)"
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
                    name="management_name"
                    placeholder="Name"
                    label="Name"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="management_email"
                    type="email"
                    placeholder="Email"
                    label="Email"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="management_phone"
                    placeholder="Phone"
                    label="Phone"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="management_role"
                    placeholder="Role"
                    label="Role"
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
                disabled={editMode ? updateCommunityMutation.isPending : createCommunityMutation.isPending}
              >
                {editMode
                  ? (updateCommunityMutation.isPending ? 'Updating...' : 'Update Community')
                  : (createCommunityMutation.isPending ? 'Creating...' : 'Create Community')}
              </Button>
            </Col>
            <Col lg={2}>
              <Button 
                variant="danger" 
                className="w-100"
                onClick={() => router.push("/communities/list")}
                disabled={createCommunityMutation.isPending}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
        </form>
      </Col>
    </Row>
  );
};

export default CommunityAddForm;
