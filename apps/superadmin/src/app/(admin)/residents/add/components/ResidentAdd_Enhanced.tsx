'use client'
import { useCreateResident, useUpdateResident, type CreateResidentData } from '@/hooks/useResidents'
import type { Resident } from '@/hooks/useResidents'
import { useListCommunities } from '@/hooks/useCommunities'
import { useListUnits } from '@/hooks/useUnits'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import React from 'react'
import { toast } from 'react-hot-toast'

type ResidentAddProps = {
  onFormChange?: (data: CreateResidentData) => void
  mode?: 'create' | 'edit'
  resident?: Resident | null
  residentId?: string
  onSuccess?: () => void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

const normalizeRoleForForm = (role?: string | null): 'resident' | 'tenant' => {
  if (role === 'tenant') return 'tenant'
  return 'resident'
}

const normalizeStatusForForm = (
  status?: string | null,
  isActive?: boolean | null,
): 'active' | 'inactive' | 'suspended' | 'pending' => {
  if (status === 'inactive' || status === 'suspended' || status === 'pending') {
    return status
  }
  if (isActive === false) return 'inactive'
  return 'active'
}

const buildInitialFormValues = (resident?: Resident | null): CreateResidentData => ({
  first_name: resident?.first_name || '',
  last_name: resident?.last_name || '',
  email: resident?.email || '',
  phone: resident?.phone || '',
  mobile: resident?.mobile || '',
  date_of_birth: resident?.date_of_birth || '',
  address: resident?.address || '',
  avatar_url: resident?.avatar_url || '',
  unit_id: resident?.unit_id || '',
  unit_number: '',
  block_number: '',
  society_id: resident?.community_id || resident?.societies?.id || '',
  role: normalizeRoleForForm(resident?.role),
  status: normalizeStatusForForm(resident?.status, resident?.is_active),
  is_active: resident?.is_active,
})

const getCommunityFieldValue = (resident?: Resident | null, selectedCommunity?: string) => {
  if (selectedCommunity) return selectedCommunity
  return resident?.community_id || resident?.societies?.id || resident?.communities?.id || ''
}

const ResidentAddEnhanced = ({
  onFormChange,
  mode = 'create',
  resident,
  residentId,
  onSuccess,
  onSubmittingChange,
}: ResidentAddProps) => {
  const router = useRouter()
  const isEditMode = mode === 'edit'

  const createResident = useCreateResident()
  const updateResident = useUpdateResident(residentId || '')

  const { data: unitsResponse } = useListUnits()
  const units = unitsResponse?.data || []

  const { data: communitiesResponse } = useListCommunities()
  const communities = communitiesResponse?.data || []

  const [selectedCommunity, setSelectedCommunity] = useState<string>('')
  const [showUnitWarning, setShowUnitWarning] = useState<boolean>(false)

  const residentSchema = yup.object({
    first_name: yup.string().required('Please enter first name'),
    last_name: yup.string().required('Please enter last name'),
    email: yup.string().email('Please enter a valid email').required('Please enter email'),
    phone: yup.string().optional(),
    mobile: yup.string().optional(),
    date_of_birth: yup.string().optional(),
    address: yup.string().optional(),
    avatar_url: yup.string().optional(),
    unit_id: yup.string().optional(),
    unit_number: yup.string().optional(),
    block_number: yup.string().optional(),
    society_id: yup.string().optional(),
    role: yup.string().oneOf(['resident', 'tenant']).required(),
    status: yup.string().oneOf(['active', 'inactive', 'suspended', 'pending']).optional(),
  })

  const { handleSubmit, control, reset, watch } = useForm<CreateResidentData>({
    resolver: yupResolver(residentSchema),
    defaultValues: buildInitialFormValues(resident),
  })

  React.useEffect(() => {
    const initialValues: CreateResidentData = isEditMode ? buildInitialFormValues(resident) : {
      ...buildInitialFormValues(null),
      role: 'resident',
      status: 'active',
    }
    reset(initialValues)
    if (isEditMode) {
      setSelectedCommunity(getCommunityFieldValue(resident, initialValues.society_id || ''))
    } else {
      setSelectedCommunity('')
      setShowUnitWarning(false)
    }
  }, [isEditMode, resident, reset])

  const selectedCommunityFromForm = watch('society_id')
  React.useEffect(() => {
    if (selectedCommunityFromForm) {
      setSelectedCommunity(selectedCommunityFromForm)
    }
  }, [selectedCommunityFromForm])

  React.useEffect(() => {
    onFormChangeRef.current = onFormChange
  }, [onFormChange])

  const onFormChangeRef = React.useRef(onFormChange)

  React.useEffect(() => {
    onFormChangeRef.current?.(watch())
    const subscription = watch((values) => {
      onFormChangeRef.current?.(values as CreateResidentData)
    })

    return () => subscription.unsubscribe()
  }, [watch])

  const onSubmit = async (data: CreateResidentData) => {
    if (onSubmittingChange) {
      onSubmittingChange(true)
    }
    try {
      if (isEditMode) {
        if (!residentId) {
          toast.error('Missing resident ID for update')
          return
        }
        await updateResident.mutateAsync(data)
        toast.success('Resident updated successfully!')
        onSuccess?.()
        router.push(`/residents/${residentId}`)
        return
      }

      const createdResident = await createResident.mutateAsync(data)
      toast.success('Resident created successfully!')
      reset()
      router.push(`/residents/${createdResident.id}`)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} resident:`, error)
      toast.error(error instanceof Error ? error.message : isEditMode ? 'Error updating resident' : 'Error creating resident')
    } finally {
      if (onSubmittingChange) {
        onSubmittingChange(false)
      }
    }
  }

  const isSubmitting = isEditMode ? updateResident.isPending : createResident.isPending
  const submitLabel = isEditMode ? 'Update Resident' : 'Add Resident'
  const submittingLabel = isEditMode ? 'Updating...' : 'Adding...'

  const filteredUnits = selectedCommunity ? units.filter(unit => unit.community_id === selectedCommunity) : units

  return (
    <form id="resident-form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Resident Information</CardTitle>
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
                        if (value) {
                          setShowUnitWarning(false)
                        }
                      }}
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
                        if (!selectedCommunity) {
                          setShowUnitWarning(true)
                        }
                      }}
                    >
                      <option value="">Choose a Unit</option>
                      {filteredUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.block}-{unit.number} ({(unit as { type?: string }).type || 'Unit'})
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
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default ResidentAddEnhanced
