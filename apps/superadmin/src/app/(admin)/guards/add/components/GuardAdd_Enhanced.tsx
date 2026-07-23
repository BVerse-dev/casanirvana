'use client'

import TextFormInput from '@/components/from/TextFormInput'
import { useCreateGuardProfile, useGuardCommunities } from '@/hooks/useGuardOperations'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

const numberField = yup
  .number()
  .transform((value, originalValue) => (originalValue === '' || originalValue == null ? undefined : value))
  .positive('Value must be positive')
  .optional()

const guardSchema = yup.object({
  first_name: yup.string().trim().required('Please enter first name'),
  last_name: yup.string().trim().required('Please enter last name'),
  email: yup.string().trim().email('Please enter a valid email').required('Please enter email'),
  phone: yup.string().trim().optional(),
  guard_phone: yup.string().trim().optional(),
  date_of_birth: yup.string().optional(),
  address: yup.string().trim().optional(),
  community_id: yup.string().trim().required('Please select a community'),
  shift_type: yup.string().oneOf(['morning', 'evening', 'night', 'rotating']).default('morning'),
  shift_start_time: yup.string().optional(),
  shift_end_time: yup.string().optional(),
  gate_assignment: yup.string().trim().optional(),
  license_number: yup.string().trim().optional(),
  employment_date: yup.string().optional(),
  salary: numberField,
  emergency_contact_name: yup.string().trim().optional(),
  emergency_contact_phone: yup.string().trim().optional(),
  assignment_name: yup.string().trim().optional(),
  special_instructions: yup.string().trim().optional(),
  status: yup.string().oneOf(['active', 'inactive', 'suspended']).default('active'),
})

type CreateGuardProfileData = yup.InferType<typeof guardSchema>

type GuardAddProps = {
  formId?: string
}

const GuardAdd = ({ formId = 'guard-provisioning-form' }: GuardAddProps) => {
  const router = useRouter()
  const createGuardProfile = useCreateGuardProfile()
  const { data: communities = [] } = useGuardCommunities()

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateGuardProfileData>({
    resolver: yupResolver(guardSchema),
    defaultValues: {
      community_id: '',
      shift_type: 'morning',
      status: 'active',
    },
  })

  const onSubmit = async (data: CreateGuardProfileData) => {
    try {
      await createGuardProfile.mutateAsync({
        ...data,
        salary: typeof data.salary === 'number' ? data.salary : undefined,
      })
      toast.success('Guard invite sent and assignment created successfully.')
      router.push('/guards')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create guard account.'
      toast.error(message)
      console.error('Error creating guard profile:', error)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Guard Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
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

            <Col lg={12}>
              <h5 className="mb-3 mt-4">Assignment & Employment</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="community-select" className="form-label">
                  Assigned Community
                </label>
                <Controller
                  name="community_id"
                  control={control}
                  render={({ field }) => (
                    <Form.Select
                      id="community-select"
                      className={errors.community_id ? 'is-invalid' : ''}
                      value={field.value || ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      <option value="">Choose a Community</option>
                      {communities.map((community: any) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                {errors.community_id ? (
                  <div className="invalid-feedback d-block">{errors.community_id.message}</div>
                ) : null}
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
                    <Form.Select
                      id="shift-select"
                      value={field.value || 'morning'}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      <option value="morning">Morning Shift (6AM - 2PM)</option>
                      <option value="evening">Evening Shift (2PM - 10PM)</option>
                      <option value="night">Night Shift (10PM - 6AM)</option>
                      <option value="rotating">Rotating Shift</option>
                    </Form.Select>
                  )}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="status-select" className="form-label">
                  Guard Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Form.Select
                      id="status-select"
                      value={field.value || 'active'}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </Form.Select>
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
                <TextFormInput control={control} name="assignment_name" placeholder="Front Gate - Day Shift" label="Assignment Name" />
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
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput control={control} name="special_instructions" placeholder="Any handover or post instructions" label="Special Instructions" />
              </div>
            </Col>

            <Col lg={12}>
              <h5 className="mb-3 mt-4">Emergency Contact</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="emergency_contact_name" placeholder="Emergency Contact Name" label="Emergency Contact Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="emergency_contact_phone" placeholder="Emergency Contact Phone" label="Emergency Contact Phone" />
              </div>
            </Col>
          </Row>
          <div className="text-end">
            <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.push('/guards')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createGuardProfile.isPending}>
              {createGuardProfile.isPending ? 'Sending Invite...' : 'Send Guard Invite'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default GuardAdd
