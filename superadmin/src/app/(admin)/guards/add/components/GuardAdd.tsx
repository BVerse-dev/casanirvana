'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useCreateGuard, type CreateGuardData } from '@/hooks/useGuards_Enhanced'
import { useListCommunities } from '@/hooks/useCommunities'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const GuardAdd = () => {
  const router = useRouter()
  const createGuard = useCreateGuard()
  const { data: communitiesResponse } = useListCommunities()
  const communities = communitiesResponse?.data || []

  const guardSchema = yup.object({
    // Basic Information
    first_name: yup.string().required('Please enter first name'),
    last_name: yup.string().required('Please enter last name'),
    email: yup.string().email().required('Please enter email'),
    phone: yup.string().optional(),
    guard_phone: yup.string().optional(), // Alternative phone field
    date_of_birth: yup.string().optional(),
    address: yup.string().optional(),
    
    // Employment Details
    society_id: yup.string().optional(),
    shift_type: yup.string().oneOf(['morning', 'evening', 'night']).optional(),
    shift_start_time: yup.string().optional(),
    shift_end_time: yup.string().optional(),
    gate_assignment: yup.string().optional(),
    license_number: yup.string().optional(),
    employment_date: yup.string().optional(),
    salary: yup.number().positive('Salary must be positive').optional(),
    
    // System Fields
    role: yup.string().oneOf(['guard']).required(),
  })

  const { handleSubmit, control, reset } = useForm<CreateGuardData>({
    resolver: yupResolver(guardSchema),
    defaultValues: {
      role: 'guard' as const,
      shift_type: 'morning',
    },
  })

  const onSubmit = async (data: CreateGuardData) => {
    try {
      await createGuard.mutateAsync(data)
      toast.success('Guard created successfully!')
      reset()
      router.push('/guards/list-view')
    } catch (error) {
      toast.error('Error creating guard')
      console.error('Error creating guard:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Guard Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Basic Information */}
            <Col lg={12}>
              <h5 className="mb-3">Basic Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="first_name" placeholder="First Name" label="First Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="last_name" placeholder="Last Name" label="Last Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="email" placeholder="Enter Email" label="Email Address" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="date_of_birth" type="date" label="Date of Birth" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="phone" placeholder="Enter Primary Phone" label="Primary Phone Number" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="guard_phone" placeholder="Enter Alternative Phone" label="Alternative Phone" />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput control={control} name="address" placeholder="Enter Address" label="Address" />
              </div>
            </Col>

            {/* Employment Details */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Employment Details</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="community-select" className="form-label">
                  Assigned Community
                </label>
                <Controller
                  name="society_id"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="community-select"
                      data-placeholder="Select Community"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose a Community</option>
                      {communities.map(community => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="employment_date" type="date" label="Employment Date" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="shift-select" className="form-label">
                  Shift Type
                </label>
                <Controller
                  name="shift_type"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="shift-select"
                      data-placeholder="Select Shift"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose Shift Type</option>
                      <option value="morning">Morning Shift (6AM - 2PM)</option>
                      <option value="evening">Evening Shift (2PM - 10PM)</option>
                      <option value="night">Night Shift (10PM - 6AM)</option>
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="shift_start_time" type="time" label="Shift Start Time" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="shift_end_time" type="time" label="Shift End Time" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="gate_assignment" placeholder="Main Gate, Side Gate, etc." label="Gate Assignment" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="license_number" placeholder="Enter Security License Number" label="Security License Number" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="salary" type="number" placeholder="Enter Monthly Salary" label="Monthly Salary" />
              </div>
            </Col>

          </Row>
          <div className="text-end">
            <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createGuard.isPending}>
              {createGuard.isPending ? 'Creating...' : 'Add Guard'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default GuardAdd
