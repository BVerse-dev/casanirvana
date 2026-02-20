'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useCreateResident, type CreateResidentData } from '@/hooks/useResidents'
import { useListUnits } from '@/hooks/useUnits'
import { useListCommunities } from '@/hooks/useCommunities'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import React from 'react'

type ResidentAddProps = {
  onFormChange?: (data: CreateResidentData) => void
}

const ResidentAddEnhanced = ({ onFormChange }: ResidentAddProps) => {
  const router = useRouter()
  const createResident = useCreateResident()
  const { data: unitsResponse } = useListUnits()
  const units = unitsResponse?.data || []
  const { data: communitiesResponse } = useListCommunities()
  const communities = communitiesResponse?.data || []
  const [selectedCommunity, setSelectedCommunity] = useState<string>('')
  const [showUnitWarning, setShowUnitWarning] = useState<boolean>(false)

  const residentSchema = yup.object({
    // Basic Information
    first_name: yup.string().required('Please enter first name'),
    last_name: yup.string().required('Please enter last name'),
    email: yup.string().email('Please enter a valid email').required('Please enter email'),
    phone: yup.string().optional(),
    mobile: yup.string().optional(),
    date_of_birth: yup.string().optional(),
    address: yup.string().optional(),
    avatar_url: yup.string().optional(),
    
    // Unit & Community
    unit_id: yup.string().optional(),
    unit_number: yup.string().optional(),
    block_number: yup.string().optional(),
    society_id: yup.string().optional(),
    
    // Emergency Contact (removed)
    
    // System Fields
    role: yup.string().oneOf(['resident', 'tenant', 'admin']).required(),
    status: yup.string().oneOf(['active', 'inactive', 'suspended', 'pending']).optional(),
  })

  const { handleSubmit, control, reset, watch } = useForm<CreateResidentData>({
    resolver: yupResolver(residentSchema),
    defaultValues: {
      role: 'resident',
      status: 'active',
    },
  })

  // Watch form values for real-time preview
  const formValues = watch()

  // Call onFormChange when form values change
  React.useEffect(() => {
    if (onFormChange) {
      onFormChange(formValues)
    }
  }, [formValues, onFormChange])

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

  // Filter units by selected community
  const filteredUnits = selectedCommunity 
    ? units.filter(unit => unit.society_id === selectedCommunity)
    : units

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Resident Information</CardTitle>
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
                <TextFormInput control={control} name="avatar_url" placeholder="Enter Avatar URL" label="Avatar URL" />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput control={control} name="address" placeholder="Enter Address" label="Address" />
              </div>
            </Col>

            {/* Unit & Community Information */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Unit & Community Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="community-select" className="form-label">
                  Community
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
                      onChange={(value) => {
                        field.onChange(value)
                        setSelectedCommunity(value as string)
                        // Hide warning when community is selected
                        if (value) {
                          setShowUnitWarning(false)
                        }
                      }}
                    >
                      <option value="">Choose a Community</option>
                      {communities.map((community: any) => (
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
                <label htmlFor="unit-select" className="form-label">
                  Unit
                </label>
                <Controller
                  name="unit_id"
                  control={control}
                  render={({ field }) => (
                     <ChoicesFormInput
                       {...field}
                       className="form-control"
                       id="unit-select"
                       data-placeholder="Select Unit"
                       onChange={(value) => field.onChange(value)}
                       onFocus={() => {
                         // Show warning if no community selected when user tries to select unit
                         if (!selectedCommunity) {
                           setShowUnitWarning(true)
                         }
                       }}
                     >
                      <option value="">Choose a Unit</option>
                      {filteredUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.block}-{unit.number} ({unit.type || 'Unit'})
                        </option>
                      ))}
                    </ChoicesFormInput>
                  )}
                />
                 {showUnitWarning && (
                   <small className="text-danger">Please select a community first</small>
                 )}
              </div>
            </Col>

            

            {/* System Fields */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">System Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="role-select" className="form-label">
                  Role
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="role-select"
                      data-placeholder="Select Role"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="resident">Resident</option>
                      <option value="tenant">Tenant</option>
                      <option value="admin">Admin</option>
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="status-select" className="form-label">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="status-select"
                      data-placeholder="Select Status"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </ChoicesFormInput>
                  )}
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

export default ResidentAddEnhanced
