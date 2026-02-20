'use client'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { Database } from "@/lib/database.types";
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

type Society = Database["public"]["Tables"]["societies"]["Row"];

interface SocietyManagementProps {
  society: Society;
}

const SocietyManagement = ({ society }: SocietyManagementProps) => {
  const contactSchema = yup.object({
    date: yup.string().required('Please enter date'),
    time: yup.string().required('Please enter time'),
    name: yup.string().required('Please enter your name'),
    number: yup.string().required('Please enter your number'),
    email: yup.string().email().required('Please enter email'),
    message: yup.string().required('Please enter message'),
  })

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(contactSchema),
  })

  const onSubmit = async (data: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to send message');
    }
  }

  return (
    <Col xl={4} lg={12}>
      <Card>
        <CardHeader className="bg-light-subtle">
          <CardTitle as={'h4'}>Society Management</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center mb-4">
            <Image 
              src={avatar1} 
              alt="manager" 
              className="avatar-xl rounded-circle border border-2 border-light mx-auto" 
            />
            <div className="mt-2">
              <Link href="" className="fw-medium text-dark fs-16">
                Rajesh Kumar
              </Link>
              <p className="mb-0 text-muted">(Society Manager)</p>
            </div>
            <div className="mt-3">
              <ul className="list-inline justify-content-center d-flex gap-1 mb-0 align-items-center">
                <li className="list-inline-item">
                  <Button variant="light" className="d-flex avatar-sm align-items-center justify-content-center text-primary fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:phone-fill" />
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="light" className="d-flex avatar-sm align-items-center justify-content-center text-info fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:mail-fill" />
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="light" className="d-flex avatar-sm align-items-center justify-content-center text-success fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:whatsapp-fill" />
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-center mb-3">
              <Image 
                src={avatar2} 
                alt="secretary" 
                className="avatar-lg rounded-circle border border-2 border-light mx-auto" 
              />
              <div className="mt-2">
                <Link href="" className="fw-medium text-dark fs-15">
                  Priya Sharma
                </Link>
                <p className="mb-0 text-muted small">(Secretary)</p>
              </div>
            </div>
          </div>

          <div className="border-top pt-3">
            <h6 className="fw-semibold mb-3">Quick Contact</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Office Hours:</span>
              <span className="fw-medium">9 AM - 6 PM</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Emergency:</span>
              <span className="fw-medium">24/7 Available</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Phone:</span>
              <span className="fw-medium">+91 98765 43210</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle as={'h5'}>Send Message</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="date"
                    type="date"
                    label="Date"
                    placeholder="Select date"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="time"
                    type="time"
                    label="Time"
                    placeholder="Select time"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="name"
                    label="Your Name"
                    placeholder="Enter your name"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="number"
                    type="tel"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="message"
                    label="Message"
                    rows={4}
                    placeholder="Type your message here..."
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <Button type="submit" variant="primary" className="w-100">
              <IconifyIcon icon="ri:send-plane-fill" className="me-1" />
              Send Message
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Col>
  )
}

export default SocietyManagement
