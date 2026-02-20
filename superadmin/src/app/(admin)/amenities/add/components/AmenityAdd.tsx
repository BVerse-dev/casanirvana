'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import SelectFormInput from '@/components/from/SelectFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import CheckFormInput from '@/components/from/CheckFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, InputGroup, Badge } from 'react-bootstrap'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import * as yup from 'yup'
import { useCreateAmenity } from '@/hooks/useAmenities'
import { useListCommunities } from '@/hooks/useCommunities'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const amenityTypes = [
  { value: 'Recreation', label: 'Recreation' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Event Space', label: 'Event Space' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Utility', label: 'Utility' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Business', label: 'Business' },
  { value: 'Entertainment', label: 'Entertainment' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'renovation', label: 'Under Renovation' },
]

const priorityLevels = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical' },
]

const accessibilityFeatures = [
  'Wheelchair Accessible',
  'Elevator Access',
  'Accessible Parking',
  'Audio Visual Aids',
  'Sign Language Support',
  'Braille Signage',
]

const safetyFeatures = [
  'CCTV Surveillance',
  'Emergency Exits',
  'Fire Safety Equipment',
  'First Aid Kit',
  'Security Personnel',
  'Emergency Lighting',
  'Panic Buttons',
]

const cancellationPolicies = [
  { value: 'Free cancellation up to 24 hours before booking', label: 'Free cancellation up to 24 hours' },
  { value: 'Free cancellation up to 12 hours before booking', label: 'Free cancellation up to 12 hours' },
  { value: 'Free cancellation up to 6 hours before booking', label: 'Free cancellation up to 6 hours' },
  { value: 'Free cancellation up to 2 hours before booking', label: 'Free cancellation up to 2 hours' },
  { value: '50% refund if cancelled 24 hours before', label: '50% refund if cancelled 24 hours before' },
  { value: '50% refund if cancelled 12 hours before', label: '50% refund if cancelled 12 hours before' },
  { value: 'No cancellation allowed', label: 'No cancellation allowed' },
]

// Define the amenity data type locally
interface CreateAmenityData {
  name: string
  description: string
  amenity_type: string
  community_id: string
  capacity?: number | null
  area_sqft?: number | null
  floor_location?: string
  is_paid: boolean
  price_per_hour?: number
  security_deposit?: number | null
  is_active: boolean
  status: string
  priority_level: string
  advance_booking_hours: number
  booking_limit_per_day: number
  max_booking_duration: number
  availability_start: string
  availability_end: string
  cancellation_policy: string
  rules_and_regulations: string
  terms_and_conditions?: string
  maintenance_schedule: string
  contact_person: string
  contact_number: string
  contact_email?: string
  accessibility_features?: string[]
  safety_features?: string[]
  requires_approval?: boolean
  auto_approval?: boolean
  send_notifications?: boolean
}

const AmenityAdd = () => {
  const router = useRouter()
  const createAmenity = useCreateAmenity()
  const { data: communitiesData } = useListCommunities();
  const communities = communitiesData?.data || [];

  const amenitySchema = yup.object({
    // Basic Information
    name: yup.string().required('Please enter amenity name').min(3, 'Name must be at least 3 characters'),
    description: yup.string().required('Please enter amenity description').min(10, 'Description must be at least 10 characters'),
    amenity_type: yup.string().required('Please select amenity type'),
    community_id: yup.string().required('Please select community'),
    
    // Capacity & Physical Details
    capacity: yup.number().min(1, 'Capacity must be at least 1').nullable(),
    area_sqft: yup.number().min(1, 'Area must be positive').nullable(),
    floor_location: yup.string().optional(),
    
    // Pricing & Service
    is_paid: yup.boolean().required(),
    price_per_hour: yup.number().when('is_paid', {
      is: true,
      then: (schema) => schema.required('Price is required for paid amenities').min(0, 'Price must be positive'),
      otherwise: (schema) => schema.nullable().optional(),
    }),
    security_deposit: yup.number().min(0, 'Security deposit must be positive').nullable().optional(),
    
    // Status & Priority
    is_active: yup.boolean().required(),
    status: yup.string().required('Please select status'),
    priority_level: yup.string().required('Please select priority level'),
    
    // Booking & Availability
    advance_booking_hours: yup.number().min(0, 'Advance booking hours must be positive').required('Please enter advance booking hours'),
    booking_limit_per_day: yup.number().min(1, 'Daily booking limit must be at least 1').required('Please enter daily booking limit'),
    max_booking_duration: yup.number().min(1, 'Maximum booking duration must be at least 1 hour').required('Please enter maximum booking duration'),
    availability_start: yup.string().required('Please enter start time'),
    availability_end: yup.string().required('Please enter end time'),
    
    // Policies & Rules
    cancellation_policy: yup.string().required('Please select cancellation policy'),
    rules_and_regulations: yup.string().required('Please enter rules and regulations'),
    terms_and_conditions: yup.string().optional(),
    
    // Management & Contact
    maintenance_schedule: yup.string().required('Please enter maintenance schedule'),
    contact_person: yup.string().required('Please enter contact person name'),
    contact_number: yup.string().required('Please enter contact number').matches(/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'),
    contact_email: yup.string().email('Please enter a valid email').optional(),
    
    // Features & Accessibility (arrays)
    accessibility_features: yup.array().of(yup.string()).optional(),
    safety_features: yup.array().of(yup.string()).optional(),
    
    // Additional Settings
    requires_approval: yup.boolean().optional(),
    auto_approval: yup.boolean().optional(),
    send_notifications: yup.boolean().optional(),
  })

  const { handleSubmit, control, reset, watch, setValue, getValues } = useForm({
    resolver: yupResolver(amenitySchema),
    mode: 'onChange',
    defaultValues: {
      // Basic Information
      is_paid: false,
      is_active: true,
      status: 'active',
      priority_level: 'medium',
      
      // Booking & Availability
      advance_booking_hours: 24,
      booking_limit_per_day: 3,
      max_booking_duration: 4,
      availability_start: '06:00',
      availability_end: '22:00',
      
      // Policies
      cancellation_policy: 'Free cancellation up to 24 hours before booking',
      rules_and_regulations: 'Please follow community guidelines and maintain cleanliness.',
      maintenance_schedule: 'Daily cleaning and weekly deep maintenance',
      
      // Features
      accessibility_features: [],
      safety_features: [],
      
      // Settings
      requires_approval: false,
      auto_approval: true,
      send_notifications: true,
    },
  })

  const isPaid = watch('is_paid')

  const onSubmit = async (data: any) => {
    try {
      // Clean up the data to match expected types
      const amenityData = {
        ...data,
        price_per_hour: data.is_paid ? data.price_per_hour : undefined,
        accessibility_features: data.accessibility_features?.filter((f: string | undefined) => f !== undefined) || [],
        safety_features: data.safety_features?.filter((f: string | undefined) => f !== undefined) || [],
      }
      
      await createAmenity.mutateAsync(amenityData)
      toast.success('Amenity created successfully!')
      reset()
      router.push('/amenities/list')
    } catch (error) {
      toast.error('Error creating amenity')
      console.error('Error creating amenity:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Basic Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:buildings-3-bold-duotone" className="me-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="name" 
                  placeholder="Enter amenity name" 
                  label="Amenity Name *" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="amenity_type"
                  label="Amenity Type *"
                  placeholder="Select amenity type"
                  options={amenityTypes}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput 
                  control={control} 
                  name="description" 
                  placeholder="Enter detailed description of the amenity, its features and purpose" 
                  label="Description *"
                  rows={4}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="community-select" className="form-label">
                  Assigned Community <span className="text-danger">*</span>
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
                <SelectFormInput
                  control={control}
                  name="priority_level"
                  label="Priority Level *"
                  placeholder="Select priority level"
                  options={priorityLevels}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Physical Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:home-bold-duotone" className="me-2" />
            Physical Details & Location
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="capacity" 
                  type="number"
                  placeholder="Enter maximum capacity" 
                  label="Maximum Capacity"
                />
              </div>
            </Col>
            <Col lg={4}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="area_sqft" 
                  type="number"
                  placeholder="Enter area in sq ft" 
                  label="Area (sq ft)"
                />
              </div>
            </Col>
            <Col lg={4}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="floor_location" 
                  placeholder="e.g., Ground Floor, 2nd Floor" 
                  label="Floor Location"
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Pricing & Service Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
            Pricing & Service Details
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">Service Type <span className="text-danger">*</span></label>
                <Controller
                  name="is_paid"
                  control={control}
                  render={({ field }) => (
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="false"
                          id="free-service"
                          checked={!field.value}
                          onChange={() => field.onChange(false)}
                        />
                        <label className="form-check-label" htmlFor="free-service">
                          <IconifyIcon icon="solar:gift-bold" className="me-1" />
                          Free Service
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="true"
                          id="paid-service"
                          checked={field.value}
                          onChange={() => field.onChange(true)}
                        />
                        <label className="form-check-label" htmlFor="paid-service">
                          <IconifyIcon icon="solar:card-bold" className="me-1" />
                          Paid Service
                        </label>
                      </div>
                    </div>
                  )}
                />
              </div>
            </Col>
            {isPaid && (
              <>
                <Col lg={4}>
                  <div className="mb-3">
                    <label className="form-label">Price per Hour</label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Controller
                        name="price_per_hour"
                        control={control}
                        render={({ field }) => (
                          <Form.Control 
                            {...field} 
                            type="number" 
                            placeholder="Enter price per hour"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        )}
                      />
                    </InputGroup>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="mb-3">
                    <label className="form-label">Security Deposit (Optional)</label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Controller
                        name="security_deposit"
                        control={control}
                        render={({ field }) => (
                          <Form.Control 
                            {...field} 
                            type="number" 
                            placeholder="Enter security deposit"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        )}
                      />
                    </InputGroup>
                  </div>
                </Col>
              </>
            )}
          </Row>
        </CardBody>
      </Card>

      {/* Status & Availability */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2" />
            Status & Availability
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="status"
                  label="Current Status *"
                  placeholder="Select current status"
                  options={statusOptions}
                />
              </div>
            </Col>
            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">Booking Status <span className="text-danger">*</span></label>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="true"
                          id="active-status"
                          checked={field.value}
                          onChange={() => field.onChange(true)}
                        />
                        <label className="form-check-label" htmlFor="active-status">
                          <IconifyIcon icon="solar:check-circle-bold" className="me-1 text-success" />
                          Accept Bookings
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          value="false"
                          id="inactive-status"
                          checked={!field.value}
                          onChange={() => field.onChange(false)}
                        />
                        <label className="form-check-label" htmlFor="inactive-status">
                          <IconifyIcon icon="solar:close-circle-bold" className="me-1 text-danger" />
                          No Bookings
                        </label>
                      </div>
                    </div>
                  )}
                />
              </div>
            </Col>
            <Col lg={4}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="max_booking_duration" 
                  type="number"
                  placeholder="Enter max hours" 
                  label="Max Booking Duration (Hours) *"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Operating Hours - Start Time *</label>
                <InputGroup>
                  <InputGroup.Text><IconifyIcon icon="solar:sunrise-bold" /></InputGroup.Text>
                  <Controller
                    name="availability_start"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="time" />
                    )}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Operating Hours - End Time *</label>
                <InputGroup>
                  <InputGroup.Text><IconifyIcon icon="solar:sunset-bold" /></InputGroup.Text>
                  <Controller
                    name="availability_end"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="time" />
                    )}
                  />
                </InputGroup>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Booking Rules & Policies */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:document-text-bold-duotone" className="me-2" />
            Booking Rules & Policies
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">Advance Booking Required *</label>
                <InputGroup>
                  <Controller
                    name="advance_booking_hours"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="number" placeholder="Enter hours" />
                    )}
                  />
                  <InputGroup.Text>hours</InputGroup.Text>
                </InputGroup>
              </div>
            </Col>
            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">Daily Booking Limit *</label>
                <InputGroup>
                  <Controller
                    name="booking_limit_per_day"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="number" placeholder="Enter daily limit" />
                    )}
                  />
                  <InputGroup.Text>bookings/day</InputGroup.Text>
                </InputGroup>
              </div>
            </Col>
            <Col lg={4}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="cancellation_policy"
                  label="Cancellation Policy *"
                  placeholder="Select cancellation policy"
                  options={cancellationPolicies}
                />
              </div>
            </Col>
            
            {/* Booking Settings */}
            <Col lg={12}>
              <div className="mb-3">
                <h6 className="mb-3">Booking Settings</h6>
                <Row>
                  <Col lg={4}>
                    <div className="form-check form-switch mb-2">
                      <Controller
                        name="requires_approval"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="requires-approval"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                            <label className="form-check-label" htmlFor="requires-approval">
                              Requires Manual Approval
                            </label>
                          </>
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="form-check form-switch mb-2">
                      <Controller
                        name="auto_approval"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="auto-approval"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                            <label className="form-check-label" htmlFor="auto-approval">
                              Auto Approve Bookings
                            </label>
                          </>
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="form-check form-switch mb-2">
                      <Controller
                        name="send_notifications"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="send-notifications"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                            <label className="form-check-label" htmlFor="send-notifications">
                              Send Booking Notifications
                            </label>
                          </>
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput 
                  control={control} 
                  name="rules_and_regulations" 
                  placeholder="Enter rules and regulations for using this amenity" 
                  label="Rules & Regulations *"
                  rows={4}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput 
                  control={control} 
                  name="terms_and_conditions" 
                  placeholder="Enter terms and conditions (optional)" 
                  label="Terms & Conditions"
                  rows={3}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Features & Accessibility */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:shield-check-bold-duotone" className="me-2" />
            Features & Accessibility
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <h6 className="mb-3">
                  <IconifyIcon icon="solar:accessibility-bold" className="me-2" />
                  Accessibility Features
                </h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {accessibilityFeatures.map((feature) => (
                    <div key={feature} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`accessibility-${feature.replace(/\s+/g, '-').toLowerCase()}`}
                        onChange={(e) => {
                          const currentFeatures = getValues('accessibility_features') || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature]
                            : currentFeatures.filter((f: string | undefined) => f !== feature && f !== undefined);
                          setValue('accessibility_features', newFeatures);
                        }}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`accessibility-${feature.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <h6 className="mb-3">
                  <IconifyIcon icon="solar:shield-plus-bold" className="me-2" />
                  Safety Features
                </h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {safetyFeatures.map((feature) => (
                    <div key={feature} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`safety-${feature.replace(/\s+/g, '-').toLowerCase()}`}
                        onChange={(e) => {
                          const currentFeatures = getValues('safety_features') || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature]
                            : currentFeatures.filter((f: string | undefined) => f !== feature && f !== undefined);
                          setValue('safety_features', newFeatures);
                        }}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`safety-${feature.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Management & Contact */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:user-speak-bold-duotone" className="me-2" />
            Management & Contact
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="contact_person" 
                  placeholder="Enter contact person name" 
                  label="Contact Person Name *"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="contact_number" 
                  placeholder="Enter 10-digit mobile number" 
                  label="Contact Number *"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="contact_email" 
                  type="email"
                  placeholder="Enter email address (optional)" 
                  label="Contact Email"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">
                  Priority Level
                  <Badge bg="info" className="ms-2">
                    {watch('priority_level')?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </label>
                <div className="text-muted small">
                  <IconifyIcon icon="solar:info-circle-bold" className="me-1" />
                  {watch('priority_level') === 'high' || watch('priority_level') === 'critical' 
                    ? 'High priority amenities get preference in maintenance and support'
                    : 'Standard priority level for regular maintenance schedule'
                  }
                </div>
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput 
                  control={control} 
                  name="maintenance_schedule" 
                  placeholder="Enter maintenance schedule details (e.g., Daily cleaning at 6 AM, Weekly deep cleaning on Sunday)" 
                  label="Maintenance Schedule *"
                  rows={3}
                />
              </div>
            </Col>
          </Row>
          
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="mb-3">
              <IconifyIcon icon="solar:bookmark-bold" className="me-2" />
              Form Summary
            </h6>
            <Row>
              <Col lg={4}>
                <small className="text-muted">Service Type:</small>
                <div className="fw-semibold">
                  <IconifyIcon icon={isPaid ? "solar:card-bold" : "solar:gift-bold"} className="me-1" />
                  {isPaid ? 'Paid Service' : 'Free Service'}
                  {isPaid && watch('price_per_hour') && (
                    <span className="text-success ms-2">${watch('price_per_hour')}/hour</span>
                  )}
                </div>
              </Col>
              <Col lg={4}>
                <small className="text-muted">Booking Status:</small>
                <div className="fw-semibold">
                  <IconifyIcon 
                    icon={watch('is_active') ? "solar:check-circle-bold" : "solar:close-circle-bold"} 
                    className={`me-1 ${watch('is_active') ? 'text-success' : 'text-danger'}`} 
                  />
                  {watch('is_active') ? 'Accepting Bookings' : 'Not Accepting Bookings'}
                </div>
              </Col>
              <Col lg={4}>
                <small className="text-muted">Operating Hours:</small>
                <div className="fw-semibold">
                  <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                  {watch('availability_start')} - {watch('availability_end')}
                </div>
              </Col>
            </Row>
          </div>

          <div className="text-end mt-4">
            <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
              <IconifyIcon icon="solar:arrow-left-bold" className="me-1" />
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createAmenity.isPending}>
              <IconifyIcon icon={createAmenity.isPending ? "solar:hourglass-bold" : "solar:add-circle-bold"} className="me-1" />
              {createAmenity.isPending ? 'Creating Amenity...' : 'Add Amenity'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default AmenityAdd
