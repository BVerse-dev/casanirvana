'use client'
import SelectFormInput from "@/components/from/SelectFormInput"
import TextFormInput from '@/components/from/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useCreateVisitorPass } from '@/hooks/useVisitorPasses'
import { useListUnits } from '@/hooks/useUnits'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface CreateVisitorPassData {
  visitor_name: string
  visitor_phone?: string
  purpose?: string
  from_date: string
  to_date: string
  unit_id: string
  vehicle_number?: string
  created_by: string
}

const VisitorAdd = () => {
  const router = useRouter()
  const createVisitorPass = useCreateVisitorPass()
  const { data: unitsResponse } = useListUnits()
  const units = unitsResponse?.data || []

  const visitorSchema = yup.object({
    visitor_name: yup.string().required('Please enter visitor name'),
    visitor_phone: yup.string(),
    purpose: yup.string(),
    from_date: yup.string().required('Please enter visit start date'),
    to_date: yup.string().required('Please enter visit end date'),
    unit_id: yup.string().required('Please select a unit'),
    vehicle_number: yup.string(),
    created_by: yup.string().required('Created by is required'),
  })

  const { handleSubmit, control, reset } = useForm<CreateVisitorPassData>({
    resolver: yupResolver(visitorSchema),
    defaultValues: {
      from_date: new Date().toISOString().split('T')[0],
      to_date: new Date().toISOString().split('T')[0],
      created_by: 'current-user-id', // This should be dynamically set from auth
    },
  })

  const onSubmit = async (data: CreateVisitorPassData) => {
    try {
      await createVisitorPass.mutateAsync(data)
      toast.success('Visitor pass created successfully!')
      reset()
      router.push('/visitors/list-view')
    } catch (error) {
      toast.error('Error creating visitor pass')
      console.error('Error creating visitor pass:', error)
    }
  }

  // Options for dropdowns
  const unitOptions = units.map(unit => ({
    value: unit.id,
    label: `${unit.block}-${unit.number}`,
  }))

  const purposeOptions = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'guest', label: 'Guest' },
    { value: 'family_visit', label: 'Family Visit' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Visitor Information */}
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Visitor Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="visitor_name" 
                  placeholder="Enter visitor name" 
                  label="Visitor Name *" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="visitor_phone" 
                  placeholder="Enter phone number" 
                  label="Phone Number" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="purpose"
                  placeholder="Select visit purpose"
                  label="Visit Purpose"
                  options={purposeOptions}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="vehicle_number" 
                  placeholder="Enter vehicle number" 
                  label="Vehicle Number" 
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Visit Details & Unit Selection */}
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Visit Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="unit_id"
                  placeholder="Select unit"
                  label="Unit *"
                  options={unitOptions}
                />
              </div>
            </Col>
            <Col lg={6}>
              {/* Empty col for spacing */}
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="from_date" 
                  type="date" 
                  label="Visit Start Date *" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="to_date" 
                  type="date" 
                  label="Visit End Date *" 
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="outline-secondary" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button variant="success" type="submit" disabled={createVisitorPass.isPending}>
                  {createVisitorPass.isPending ? 'Creating...' : 'Create Visitor Pass'}
                </Button>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </form>
  )
}

export default VisitorAdd
