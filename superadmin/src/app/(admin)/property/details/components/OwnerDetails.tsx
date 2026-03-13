"use client";
import avatar1 from "@/assets/images/users/avatar-1.jpg";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import TextFormInput from "@/components/from/TextFormInput";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetUnit } from "@/hooks/useUnits";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Alert,
  Spinner
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const OwnerDetails = () => {
  // Get unitId from URL query parameter
  const searchParams = useSearchParams();
  const unitId = searchParams.get('id');
  
  // Fetch unit data if ID is provided
  const { data: unit, isLoading, error } = useGetUnit(unitId || '');

  const messageSchema = yup.object({
    date: yup.string().required("Please enter date"),
    time: yup.string().required("Please enter time"),
    name: yup.string().required("Please enter your name"),
    number: yup.string().required("Please enter your number"),
    email: yup.string().email().required("Please enter email"),
    description: yup.string().required("Please enter description"),
  });

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  });

  if (!unitId) {
    return (
      <Col xl={3} lg={4}>
        <Alert variant="warning">
          No unit ID provided. Please select a unit from the list or grid view.
        </Alert>
      </Col>
    );
  }
  
  if (isLoading) {
    return (
      <Col xl={3} lg={4}>
        <div className="text-center p-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading owner details...</p>
        </div>
      </Col>
    );
  }
  
  if (error || !unit) {
    return (
      <Col xl={3} lg={4}>
        <Alert variant="danger">
          <h5>Error Loading Unit</h5>
          <p>{error?.message || "Unit not found"}</p>
        </Alert>
      </Col>
    );
  }

  const ownerName =
    unit.profiles?.full_name ||
    [unit.profiles?.first_name, unit.profiles?.last_name].filter(Boolean).join(" ").trim() ||
    "Owner not assigned";
  const ownerEmail = unit.profiles?.email || null;
  const ownerPhone = unit.profiles?.phone || null;

  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardHeader className="bg-light-subtle">
          <CardTitle as={"h4"}>Property Owner Details</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center">
            <Image
              src={avatar1}
              alt="avatar"
              className="avatar-xl rounded-circle border border-2 border-light mx-auto"
            />
            <div className="mt-2">
              <Link href="" className="fw-medium text-dark fs-16">
                {ownerName}
              </Link>
              <p className="mb-0">{ownerEmail || ownerPhone ? "(Owner)" : "No contact assigned"}</p>
            </div>
            <div className="mt-3 text-muted small">
              {ownerEmail || "No email"}
              {ownerEmail && ownerPhone ? " • " : ""}
              {ownerPhone || ""}
            </div>
          </div>
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-2">
            <Col lg={6}>
              <Button
                as={ownerPhone ? "a" : "button"}
                href={ownerPhone ? `tel:${ownerPhone}` : undefined}
                variant="primary"
                className="w-100"
                disabled={!ownerPhone}
              >
                <IconifyIcon
                  icon="solar:phone-calling-bold-duotone"
                  className="align-middle fs-18"
                />{" "}
                Call Us
              </Button>
            </Col>
            <Col lg={6}>
              <Button
                as={ownerEmail ? "a" : "button"}
                href={ownerEmail ? `mailto:${ownerEmail}` : undefined}
                variant="success"
                className="w-100"
                disabled={!ownerEmail}
              >
                <IconifyIcon
                  icon="solar:chat-round-dots-bold-duotone"
                  className="align-middle fs-16"
                />{" "}
                Message
              </Button>
            </Col>
          </Row>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="bg-light-subtle">
          <CardTitle as={"h4"}>Schedule A Tour</CardTitle>
        </CardHeader>
        <form
          onSubmit={handleSubmit(() => {
            return;
          })}
        >
          <CardBody>
            <Alert variant="info" className="mb-3">
              Tour scheduling is not handled from the superadmin dashboard yet. Use the assigned owner contact details above.
            </Alert>
            <div className="mb-3">
              <TextFormInput
                control={control}
                name="date"
                placeholder="dd-mm-yyyy"
                disabled
              />
            </div>
            <div className="mb-3">
              <TextFormInput
                control={control}
                name="time"
                placeholder="12:00 PM"
                disabled
              />
            </div>
            <div className="mb-3">
              <TextFormInput
                control={control}
                name="name"
                placeholder="Your Full Name"
                disabled
              />
            </div>
            <div className="mb-3">
              <TextFormInput
                control={control}
                name="email"
                placeholder="Email"
                disabled
              />
            </div>
            <div className="mb-3">
              <TextFormInput
                control={control}
                name="number"
                placeholder="Number"
                disabled
              />
            </div>
            <div>
              <TextAreaFormInput
                control={control}
                name="description"
                className="form-control"
                id="schedule-textarea"
                rows={5}
                placeholder="Message"
                disabled
              />
            </div>
          </CardBody>
          <CardFooter className="bg-light-subtle">
            <Button variant="primary" type="submit" className="w-100" disabled>
              Scheduling Unavailable
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Col>
  );
};

export default OwnerDetails;
