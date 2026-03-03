'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface UnitFormData {
  // Basic Unit Information
  block: string;
  number: string;
  floor: number;
  community_id: string;
  
  // Unit Details
  ownership_type: 'owned' | 'rented';
  floor_area: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parking_slots: number;
  
  // Owner Details
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string; // PHONE FIELD
  
  // Tenant Details (for rented units)
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string; // PHONE FIELD
  
  // Occupancy
  is_occupied: boolean;
  occupancy_start_date?: string;
  occupancy_end_date?: string;
  
  // Status
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

const UnitAddEnhanced = () => {
  const router = useRouter()

  const unitSchema = yup.object({
    // Basic Unit Information
    block: yup.string().required('Please enter block number'),
    number: yup.string().required('Please enter unit number'),
    floor: yup.number().required('Please enter floor number').min(0),
    community_id: yup.string().required('Please select community'),
    
    // Unit Details
    ownership_type: yup.string().oneOf(['owned', 'rented']).required(),
    floor_area: yup.number().positive('Floor area must be positive').optional(),
    bedrooms: yup.number().min(0, 'Bedrooms cannot be negative').optional(),
    bathrooms: yup.number().min(0, 'Bathrooms cannot be negative').optional(),
    balconies: yup.number().min(0, 'Balconies cannot be negative').optional(),
    parking_slots: yup.number().min(0, 'Parking slots cannot be negative').optional(),
    
    // Owner Details
    owner_name: yup.string().optional(),
    owner_email: yup.string().email('Invalid email').optional(),
    owner_phone: yup.string().optional(),
    
    // Tenant Details
    tenant_name: yup.string().optional(),
    tenant_email: yup.string().email('Invalid email').optional(),
    tenant_phone: yup.string().optional(),
    
    // Occupancy
    is_occupied: yup.boolean().optional(),
    occupancy_start_date: yup.string().optional(),
    occupancy_end_date: yup.string().optional(),
    
    // Status
    status: yup.string().oneOf(['active', 'inactive', 'suspended', 'pending']).required(),
  })

  const { handleSubmit, control, reset, watch } = useForm<UnitFormData>({
    resolver: yupResolver(unitSchema),
    defaultValues: {
      ownership_type: 'owned',
      is_occupied: false,
      status: 'active',
      parking_slots: 0,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 0,
    },
  })

  const ownershipType = watch('ownership_type')
  const isOccupied = watch('is_occupied')

  const onSubmit = async (data: UnitFormData) => {
    try {
      // Here you would call your unit creation API
      toast.success('Unit created successfully!')
      reset()
      router.push('/settings/communities/units')
    } catch (error) {
      toast.error('Error creating unit')
      console.error('Error creating unit:', error)
    }
  }

  // Mock communities data
  const communities = [
    { id: '1', name: 'Sunrise Apartments' },
    { id: '2', name: 'Green Valley Community' },
    { id: '3', name: 'Peaceful Heights' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Unit Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Basic Unit Information */}
            <Col lg={12}>
              <h5 className="mb-3">Basic Unit Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="community-select" className="form-label">
                  Community <span className="text-danger">*</span>
                </label>
                <Controller
                  name="community_id"
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
                <TextFormInput control={control} name="block" placeholder="A, B, C" label="Block" required />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="number" placeholder="101, 102, 103" label="Unit Number" required />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="floor" type="number" placeholder="1, 2, 3" label="Floor Number" required />
              </div>
            </Col>

            {/* Unit Details */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Unit Details</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="ownership-select" className="form-label">
                  Ownership Type <span className="text-danger">*</span>
                </label>
                <Controller
                  name="ownership_type"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="ownership-select"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="owned">Owned</option>
                      <option value="rented">Rented</option>
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="floor_area" type="number" placeholder="1000" label="Floor Area (sq ft)" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="bedrooms" type="number" placeholder="2" label="Bedrooms" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="bathrooms" type="number" placeholder="2" label="Bathrooms" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="balconies" type="number" placeholder="1" label="Balconies" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="parking_slots" type="number" placeholder="1" label="Parking Slots" />
              </div>
            </Col>

            {/* Owner Details */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Owner Details</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="owner_name" placeholder="Owner Full Name" label="Owner Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="owner_email" placeholder="owner@email.com" label="Owner Email" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="owner_phone" placeholder="+1234567890" label="Owner Phone Number" />
              </div>
            </Col>

            {/* Tenant Details (only show if rented) */}
            {ownershipType === 'rented' && (
              <>
                <Col lg={12}>
                  <h5 className="mb-3 mt-4">Tenant Details</h5>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="tenant_name" placeholder="Tenant Full Name" label="Tenant Name" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="tenant_email" placeholder="tenant@email.com" label="Tenant Email" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="tenant_phone" placeholder="+1234567890" label="Tenant Phone Number" />
                  </div>
                </Col>
              </>
            )}

            {/* Occupancy */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Occupancy Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="is-occupied-check"
                  label="Is Occupied"
                  onChange={(e) => {
                    // Handle checkbox change
                  }}
                />
              </div>
            </Col>
            {isOccupied && (
              <>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="occupancy_start_date" type="date" label="Occupancy Start Date" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="occupancy_end_date" type="date" label="Occupancy End Date" />
                  </div>
                </Col>
              </>
            )}

            {/* Status */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Status</h5>
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
            <Button type="submit" variant="primary">
              Add Unit
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default UnitAddEnhanced
