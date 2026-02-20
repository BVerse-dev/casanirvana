'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useCreateResident, type CreateResidentData } from '@/hooks/useResidents'
import { useListUnits } from '@/hooks/useUnits'
import { useListAgencies } from '@/hooks/useAgencies'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const ResidentAdd = () => {
  const router = useRouter()
  const createResident = useCreateResident()
  const { data: unitsResponse } = useListUnits()
  const units = unitsResponse?.data || []
  const { data: societies = [] } = useListAgencies()

  const residentSchema = yup.object({
    full_name: yup.string().required('Please enter full name'),
    email: yup.string().email().required('Please enter email'),
    phone: yup.string(),
    date_of_birth: yup.string(),
    unit_id: yup.string(),
    society_id: yup.string(),
    role: yup.string().oneOf(['RESIDENT', 'ADMIN', 'GUARD']).required('Please select role'),
  })

  const { handleSubmit, control, reset } = useForm<CreateResidentData>({
    resolver: yupResolver(residentSchema),
    defaultValues: {
      role: 'RESIDENT',
      is_active: true,
    },
  })

  const onSubmit = async (data: CreateResidentData) => {
    try {
      await createResident.mutateAsync(data)
      toast.success('Resident created successfully!')
      reset()
      router.push('/residents/list-view')
    } catch (error) {
      toast.error('Error creating resident')
      console.error('Error creating resident:', error)
    }
  }

  const unitOptions = units.map(unit => ({
    value: unit.id,
    label: `Unit ${unit.unit_number} - ${unit.building}`,
  }))

  const societyOptions = societies.map(society => ({
    value: society.id,
    label: society.name,
  }))

  const roleOptions = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'GUARD', label: 'Guard' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Resident Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="full_name" placeholder="Full Name" label="Resident Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="email" placeholder="Enter Email" label="Email Address" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="phone" placeholder="Enter Phone Number" label="Phone Number" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="date_of_birth" type="date" label="Date of Birth" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <ChoicesFormInput 
                  control={control} 
                  name="unit_id" 
                  label="Unit" 
                  options={unitOptions}
                  placeholder="Select Unit"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <ChoicesFormInput 
                  control={control} 
                  name="society_id" 
                  label="Society" 
                  options={societyOptions}
                  placeholder="Select Society"
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <ChoicesFormInput 
                  control={control} 
                  name="role" 
                  label="Role" 
                  options={roleOptions}
                  placeholder="Select Role"
                />
              </div>
            </Col>
          </Row>
          <div className="text-end">
            <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createResident.isPending}>
              {createResident.isPending ? 'Creating...' : 'Add Resident'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default ResidentAdd
