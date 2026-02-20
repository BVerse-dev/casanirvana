"use client";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import TextFormInput from "@/components/from/TextFormInput";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useCreateUnit } from "@/hooks/useUnits";
import { useListCommunities } from "@/hooks/useCommunities";
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
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as yup from "yup";

const UnitAdd = () => {
  const router = useRouter();
  const { data: communitiesData } = useListCommunities();
  const communities = communitiesData?.data || [];
  const createUnitMutation = useCreateUnit();

  const unitSchema = yup.object({
    unit_number: yup.string().required("Please enter unit number"),
    unit_name: yup.string().optional(),
    community_id: yup.string().required("Please select community"),
    type: yup.string().required("Please select unit type"),
    area: yup.number().nullable().optional(),
    floor: yup.number().required("Please enter floor"),
    status: yup.string().required("Please select status"),
    rent_amount: yup.number().nullable(),
    deposit_amount: yup.number().nullable(),
    balconies: yup.number().nullable(),
    bedrooms: yup.number().nullable(),
    bathrooms: yup.number().nullable(),
    description: yup.string().nullable(),
    // Amenities
    parking: yup.boolean().default(false),
    gym: yup.boolean().default(false),
    swimming_pool: yup.boolean().default(false),
    garden: yup.boolean().default(false),
    security: yup.boolean().default(false),
    elevator: yup.boolean().default(false),
    power_backup: yup.boolean().default(false),
    wifi: yup.boolean().default(false),
  });

  const { handleSubmit, control, register, reset, watch } = useForm({
    resolver: yupResolver(unitSchema),
    defaultValues: {
      parking: false,
      gym: false,
      swimming_pool: false,
      garden: false,
      security: false,
      elevator: false,
      power_backup: false,
      wifi: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // Prepare amenities array from checkboxes
      const amenities = [];
      if (data.parking) amenities.push("parking");
      if (data.gym) amenities.push("gym");
      if (data.swimming_pool) amenities.push("swimming_pool");
      if (data.garden) amenities.push("garden");
      if (data.security) amenities.push("security");
      if (data.elevator) amenities.push("elevator");
      if (data.power_backup) amenities.push("power_backup");
      if (data.wifi) amenities.push("wifi");

      // Prepare unit data for database
      const unitData = {
        community_id: data.community_id,
        block: data.unit_number.split('-')[0] || 'A', // Extract block from unit number
        number: data.unit_number.split('-')[1] || data.unit_number, // Extract number
        floor_area: data.area,
        bedrooms: data.bedrooms || 2,
        bathrooms: data.bathrooms || 2,
        // Additional fields for extended schema
        unit_number: data.unit_number,
        unit_name: data.unit_name,
        type: data.type,
        area: data.area,
        floor: data.floor,
        status: data.status,
        rent_amount: data.rent_amount,
        deposit_amount: data.deposit_amount,
        balconies: data.balconies,
        description: data.description,
        amenities: amenities,
      };

      await createUnitMutation.mutateAsync(unitData);
      
      toast.success("Unit created successfully!");
      reset();
      router.push("/property/list");
    } catch (error) {
      console.error("Error creating unit:", error);
      toast.error("Failed to create unit. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Unit Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="unit_number"
                    placeholder="A-101"
                    label="Unit Number"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="unit_name"
                    placeholder="Unit Name (Optional)"
                    label="Unit Name (Optional)"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <label htmlFor="community-select" className="form-label">
                  Community
                </label>
                <select
                  className="form-control"
                  id="community-select"
                  {...register("community_id")}
                >
                  <option value="">Select Community</option>
                  {communities?.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </Col>
              <Col lg={4}>
                <label htmlFor="unit-type" className="form-label">
                  Unit Type
                </label>
                <select
                  className="form-control"
                  id="unit-type"
                  {...register("type")}
                >
                  <option value="">Select Type</option>
                  <option value="1bhk">1 BHK</option>
                  <option value="2bhk">2 BHK</option>
                  <option value="3bhk">3 BHK</option>
                  <option value="4bhk">4 BHK</option>
                  <option value="studio">Studio</option>
                </select>
              </Col>
              
              <Col lg={4}>
                <label htmlFor="unit-floor" className="form-label">
                  Floor (Optional)
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon
                      icon="solar:double-alt-arrow-up-broken"
                      className="align-middle"
                    />
                  </span>
                  <input
                    type="number"
                    id="unit-floor"
                    className="form-control"
                    placeholder="3"
                    {...register("floor")}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="unit-status" className="form-label">
                  Status
                </label>
                <select
                  className="form-control"
                  id="unit-status"
                  {...register("status")}
                >
                  <option value="">Select Status</option>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </Col>
              <Col lg={6}>
                <label htmlFor="rent-amount" className="form-label">
                  Monthly Rent ($)
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20 px-2 py-0">
                    <IconifyIcon icon="ri:money-dollar-circle-line" />
                  </span>
                  <input
                    type="number"
                    id="rent-amount"
                    className="form-control"
                    placeholder="25000"
                    {...register("rent_amount")}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="deposit-amount" className="form-label">
                  Security Deposit ($)
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20 px-2 py-0">
                    <IconifyIcon icon="ri:money-dollar-circle-line" />
                  </span>
                  <input
                    type="number"
                    id="deposit-amount"
                    className="form-control"
                    placeholder="50000"
                    {...register("deposit_amount")}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="unit-balconies" className="form-label">
                  Balconies
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon
                      icon="solar:home-wifi-broken"
                      className="align-middle"
                    />
                  </span>
                  <input
                    type="number"
                    id="unit-balconies"
                    className="form-control"
                    placeholder="2"
                    {...register("balconies")}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="unit-bedrooms" className="form-label">
                  Bedrooms
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon
                      icon="solar:bed-broken"
                      className="align-middle"
                    />
                  </span>
                  <input
                    type="number"
                    id="unit-bedrooms"
                    className="form-control"
                    placeholder="2"
                    {...register("bedrooms")}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="unit-bathrooms" className="form-label">
                  Bathrooms
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon
                      icon="solar:bath-broken"
                      className="align-middle"
                    />
                  </span>
                  <input
                    type="number"
                    id="unit-bathrooms"
                    className="form-control"
                    placeholder="2"
                    {...register("bathrooms")}
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="description"
                    placeholder="Enter unit description..."
                    label="Unit Description"
                    rows={5}
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Amenities & Features</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="parking"
                    {...register("parking")}
                  />
                  <label className="form-check-label" htmlFor="parking">
                    Parking
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="gym"
                    {...register("gym")}
                  />
                  <label className="form-check-label" htmlFor="gym">
                    Gym Access
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="swimming"
                    {...register("swimming_pool")}
                  />
                  <label className="form-check-label" htmlFor="swimming">
                    Swimming Pool
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="garden"
                    {...register("garden")}
                  />
                  <label className="form-check-label" htmlFor="garden">
                    Garden Access
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="security"
                    {...register("security")}
                  />
                  <label className="form-check-label" htmlFor="security">
                    24/7 Security
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="elevator"
                    {...register("elevator")}
                  />
                  <label className="form-check-label" htmlFor="elevator">
                    Elevator
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="power-backup"
                    {...register("power_backup")}
                  />
                  <label className="form-check-label" htmlFor="power-backup">
                    Power Backup
                  </label>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="wifi"
                    {...register("wifi")}
                  />
                  <label className="form-check-label" htmlFor="wifi">
                    Wi-Fi
                  </label>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <div className="text-end">
          <Button
            variant="success"
            type="submit"
            className="me-1"
            disabled={createUnitMutation.isPending}
          >
            {createUnitMutation.isPending ? "Creating..." : "Add Unit"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => reset()}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default UnitAdd;
