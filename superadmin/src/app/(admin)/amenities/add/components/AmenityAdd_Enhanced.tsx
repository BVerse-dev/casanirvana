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

interface AmenityFormData {
  // Basic Information
  name: string;
  description?: string;
  amenity_type: string;
  location?: string;
  capacity?: number;
  
  // Booking Rules
  is_active: boolean;
  is_paid: boolean;
  price?: number;
  price_per_hour?: number;
  advance_booking_hours: number;
  max_advance_booking_days: number;
  minimum_booking_duration_hours: number;
  maximum_booking_duration_hours: number;
  booking_slots_per_day: number;
  booking_cancellation_hours: number;
  
  // Contact and Schedule
  contact_person?: string;
  contact_phone?: string; // PHONE FIELD
  rules?: string;
  
  // Community
  community_id: string;
}

const AmenityAddForm = () => {
  const router = useRouter()

  const amenitySchema = yup.object({
    // Basic Information
    name: yup.string().required('Please enter amenity name'),
    description: yup.string().optional(),
    amenity_type: yup.string().required('Please select amenity type'),
    location: yup.string().optional(),
    capacity: yup.number().min(1, 'Capacity must be at least 1').optional(),
    
    // Booking Rules
    is_active: yup.boolean().required(),
    is_paid: yup.boolean().required(),
    price: yup.number().min(0, 'Price cannot be negative').optional(),
    price_per_hour: yup.number().min(0, 'Price per hour cannot be negative').optional(),
    advance_booking_hours: yup.number().min(0, 'Advance booking hours cannot be negative').required(),
    max_advance_booking_days: yup.number().min(1, 'Max advance booking days must be at least 1').required(),
    minimum_booking_duration_hours: yup.number().min(1, 'Minimum duration must be at least 1 hour').required(),
    maximum_booking_duration_hours: yup.number().min(1, 'Maximum duration must be at least 1 hour').required(),
    booking_slots_per_day: yup.number().min(1, 'Booking slots per day must be at least 1').required(),
    booking_cancellation_hours: yup.number().min(0, 'Cancellation hours cannot be negative').required(),
    
    // Contact and Schedule
    contact_person: yup.string().optional(),
    contact_phone: yup.string().optional(),
    rules: yup.string().optional(),
    
    // Community
    community_id: yup.string().required('Please select community'),
  })

  const { handleSubmit, control, reset, watch } = useForm<AmenityFormData>({
    resolver: yupResolver(amenitySchema),
    defaultValues: {
      is_active: true,
      is_paid: false,
      advance_booking_hours: 24,
      max_advance_booking_days: 30,
      minimum_booking_duration_hours: 1,
      maximum_booking_duration_hours: 8,
      booking_slots_per_day: 1,
      booking_cancellation_hours: 24,
    },
  })

  const isPaid = watch('is_paid')

  const onSubmit = async (data: AmenityFormData) => {
    try {
      // Here you would call your amenity creation API
      console.log('Amenity data:', data)
      toast.success('Amenity created successfully!')
      reset()
      router.push('/amenities')
    } catch (error) {
      toast.error('Error creating amenity')
      console.error('Error creating amenity:', error)
    }
  }

  // Mock communities data
  const communities = [
    { id: '1', name: 'Sunrise Apartments' },
    { id: '2', name: 'Green Valley Community' },
    { id: '3', name: 'Peaceful Heights' },
  ]

  const amenityTypes = [
    'gym',
    'swimming_pool',
    'community_hall',
    'tennis_court',
    'basketball_court',
    'badminton_court',
    'playground',
    'library',
    'party_hall',
    'conference_room',
    'spa',
    'yoga_room',
    'game_room',
    'rooftop_area',
    'other'
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Amenity Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Basic Information */}
            <Col lg={12}>
              <h5 className="mb-3">Basic Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="name" placeholder="Swimming Pool, Gym, etc." label="Amenity Name" required />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="amenity-type-select" className="form-label">
                  Amenity Type <span className="text-danger">*</span>
                </label>
                <Controller
                  name="amenity_type"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="amenity-type-select"
                      data-placeholder="Select Amenity Type"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose Amenity Type</option>
                      {amenityTypes.map(type => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </ChoicesFormInput>
                  )}
                />
              </div>
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
                <TextFormInput control={control} name="location" placeholder="Ground Floor, Rooftop, etc." label="Location" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="capacity" type="number" placeholder="50" label="Capacity (persons)" />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput control={control} name="description" rows={3} placeholder="Describe the amenity..." label="Description" />
              </div>
            </Col>

            {/* Availability & Payment */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Availability & Payment</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="is-active-check"
                  label="Is Active"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="is-paid-check"
                  label="Is Paid"
                />
              </div>
            </Col>
            {isPaid && (
              <>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="price" type="number" placeholder="500" label="Fixed Price (₹)" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput control={control} name="price_per_hour" type="number" placeholder="100" label="Price Per Hour (₹)" />
                  </div>
                </Col>
              </>
            )}

            {/* Booking Rules */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Booking Rules</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="advance_booking_hours" type="number" placeholder="24" label="Advance Booking Hours" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="max_advance_booking_days" type="number" placeholder="30" label="Max Advance Booking Days" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="minimum_booking_duration_hours" type="number" placeholder="1" label="Minimum Booking Duration (hours)" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="maximum_booking_duration_hours" type="number" placeholder="8" label="Maximum Booking Duration (hours)" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="booking_slots_per_day" type="number" placeholder="1" label="Booking Slots Per Day" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="booking_cancellation_hours" type="number" placeholder="24" label="Cancellation Hours" />
              </div>
            </Col>

            {/* Contact Information */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Contact Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contact_person" placeholder="John Doe" label="Contact Person" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contact_phone" placeholder="+1234567890" label="Contact Phone Number" />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput control={control} name="rules" rows={4} placeholder="Rules and regulations for using this amenity..." label="Rules & Regulations" />
              </div>
            </Col>
          </Row>
          <div className="text-end">
            <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Amenity
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default AmenityAddForm
