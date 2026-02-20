'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, InputGroup, Badge } from 'react-bootstrap'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

// Comprehensive Agency interface
interface CreateAgencyData {
  // Basic Information
  agency_name: string
  email: string
  phone: string
  website?: string
  description?: string
  
  // Address Information
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  
  // Contact Person
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_position?: string
  
  // Business Information
  establishment_date: string
  agency_type: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED'
  
  // Social Media & Marketing
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  linkedin_url?: string
  
  // Operational Details
  operating_hours?: string
  languages_spoken?: string[]
  specializations?: string[]
  
  // Multiple Communities Management
  managed_communities: {
    community_name: string
    address: string
    city: string
    state: string
    country: string
    description?: string
    established_date?: string
  }[]
  
  // Financial Information
  employee_count?: number
  
  // Status & Settings
  is_active: boolean
  notification_preferences?: string[]
}

const AgencyAdd = () => {
  const router = useRouter()

  const agencySchema = yup.object({
    // Basic Information
    agency_name: yup.string().required('Please enter agency name'),
    email: yup.string().email('Invalid email format').required('Please enter email'),
    phone: yup.string().required('Please enter phone number'),
    website: yup.string().url('Invalid URL format').optional(),
    description: yup.string().optional(),
    
    // Address Information
    address: yup.string().required('Please enter address'),
    city: yup.string().required('Please enter city'),
    state: yup.string().required('Please enter state/province'),
    country: yup.string().required('Please enter country'),
    postal_code: yup.string().required('Please enter postal code'),
    
    // Contact Person
    contact_person_name: yup.string().required('Please enter contact person name'),
    contact_person_email: yup.string().email('Invalid email format').required('Please enter contact email'),
    contact_person_phone: yup.string().required('Please enter contact phone'),
    contact_person_position: yup.string().optional(),
    
    // Business Information
    establishment_date: yup.string().required('Please enter establishment date'),
    agency_type: yup.string().oneOf(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']).required('Please select agency type'),
    
    // Social Media
    facebook_url: yup.string().url('Invalid URL format').optional(),
    instagram_url: yup.string().url('Invalid URL format').optional(),
    twitter_url: yup.string().url('Invalid URL format').optional(),
    linkedin_url: yup.string().url('Invalid URL format').optional(),
    
    // Operational Details
    operating_hours: yup.string().optional(),
    languages_spoken: yup.array().of(yup.string()).optional(),
    specializations: yup.array().of(yup.string()).optional(),
    
    // Multiple Communities
    managed_communities: yup.array().of(
      yup.object({
        community_name: yup.string().required('Community name is required'),
        address: yup.string().required('Community address is required'),
        city: yup.string().required('City is required'),
        state: yup.string().required('State is required'),
        country: yup.string().required('Country is required'),
        description: yup.string().optional(),
        established_date: yup.string().optional(),
      })
    ).min(1, 'At least one managed community is required'),
    
    // Financial
    employee_count: yup.number().positive('Employee count must be positive').optional(),
    
    // Status
    is_active: yup.boolean().required(),
    notification_preferences: yup.array().of(yup.string()).optional(),
  })

  const { handleSubmit, control, reset } = useForm<CreateAgencyData>({
    resolver: yupResolver(agencySchema),
    defaultValues: {
      is_active: true,
      agency_type: 'RESIDENTIAL',
      managed_communities: [
        {
          community_name: '',
          address: '',
          city: '',
          state: '',
          country: '',
          description: '',
          established_date: '',
        }
      ],
      languages_spoken: [],
      specializations: [],
      certifications: [],
      notification_preferences: [],
    },
  })

  const { fields: communityFields, append: appendCommunity, remove: removeCommunity } = useFieldArray({
    control,
    name: 'managed_communities'
  })

  const onSubmit = async (data: CreateAgencyData) => {
    try {
      // Here you would typically call an API to create the agency
      console.log('Agency data:', data)
      toast.success('Agency created successfully!')
      reset()
      router.push('/agency/list-view')
    } catch (error) {
      toast.error('Error creating agency')
      console.error('Error creating agency:', error)
    }
  }

  const addNewCommunity = () => {
    appendCommunity({
      community_name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      description: '',
      established_date: '',
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Basic Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:buildings-3-bold-duotone" className="me-2" />
            Basic Agency Information
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="agency_name" placeholder="Enter agency name" label="Agency Name *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="email" type="email" placeholder="Enter email address" label="Agency Email *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="phone" placeholder="Enter phone number" label="Phone Number *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="website" placeholder="https://www.example.com" label="Website URL" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="establishment_date" type="date" label="Establishment Date *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="agency-type" className="form-label">Agency Type *</label>
                <Controller
                  name="agency_type"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="agency-type"
                      data-placeholder="Select Agency Type"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose Agency Type</option>
                      <option value="RESIDENTIAL">Residential Properties</option>
                      <option value="COMMERCIAL">Commercial Properties</option>
                      <option value="MIXED">Mixed (Residential & Commercial)</option>
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput
                  control={control}
                  name="description"
                  label="Agency Description"
                  rows={3}
                  placeholder="Describe your agency's services and expertise..."
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Address Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="me-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput control={control} name="address" placeholder="Enter complete address" label="Street Address *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="city" placeholder="Enter city" label="City *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="state" placeholder="Enter state/province" label="State/Province *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="country" placeholder="Enter country" label="Country *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="postal_code" placeholder="Enter postal/ZIP code" label="Postal/ZIP Code *" />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Contact Person */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:user-bold-duotone" className="me-2" />
            Primary Contact Person
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contact_person_name" placeholder="Enter contact person name" label="Full Name *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contact_person_position" placeholder="Manager, Director, etc." label="Position/Title" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contact_person_email" type="email" placeholder="Enter contact email" label="Email Address *" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contact_person_phone" placeholder="Enter contact phone" label="Phone Number *" />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Managed Communities */}
      <Card className="mb-4">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <CardTitle as={'h4'}>
              <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
              Managed Communities
            </CardTitle>
            <Button variant="outline-primary" size="sm" onClick={addNewCommunity}>
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Community
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {communityFields.map((field, index) => (
            <Card key={field.id} className="mb-3 border-start border-primary border-3">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <Badge bg="primary" className="me-2">Community {index + 1}</Badge>
                    Managed Community Details
                  </h6>
                  {communityFields.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeCommunity(index)}>
                      <IconifyIcon icon="ri:delete-bin-line" />
                    </Button>
                  )}
                </div>
                <Row>
                  <Col lg={6}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.community_name`} 
                        placeholder="e.g., Green Valley Community" 
                        label="Community Name *" 
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.established_date`} 
                        type="date" 
                        label="Established Date" 
                      />
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.address`} 
                        placeholder="Enter community address" 
                        label="Community Address *" 
                      />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.city`} 
                        placeholder="City" 
                        label="City *" 
                      />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.state`} 
                        placeholder="State" 
                        label="State *" 
                      />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.country`} 
                        placeholder="Country" 
                        label="Country *" 
                      />
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name={`managed_communities.${index}.description`} 
                        placeholder="Brief description of the community" 
                        label="Description" 
                      />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          ))}
        </CardBody>
      </Card>

      {/* Operational Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:settings-bold-duotone" className="me-2" />
            Operational Details
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="operating_hours" placeholder="Mon-Fri: 9AM-6PM, Sat: 9AM-3PM" label="Operating Hours" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="employee_count" type="number" min="1" placeholder="25" label="Number of Employees" />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Social Media */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as={'h4'}>
            <IconifyIcon icon="solar:share-bold-duotone" className="me-2" />
            Social Media & Online Presence
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Facebook URL</label>
                <InputGroup>
                  <InputGroup.Text><IconifyIcon icon="ri:facebook-fill" className="text-primary" /></InputGroup.Text>
                  <Controller
                    name="facebook_url"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="text" placeholder="https://facebook.com/yourpage" />
                    )}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Instagram URL</label>
                <InputGroup>
                  <InputGroup.Text><IconifyIcon icon="ri:instagram-line" className="text-danger" /></InputGroup.Text>
                  <Controller
                    name="instagram_url"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="text" placeholder="https://instagram.com/yourpage" />
                    )}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Twitter URL</label>
                <InputGroup>
                  <InputGroup.Text><IconifyIcon icon="ri:twitter-line" className="text-info" /></InputGroup.Text>
                  <Controller
                    name="twitter_url"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="text" placeholder="https://twitter.com/yourpage" />
                    )}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">LinkedIn URL</label>
                <InputGroup>
                  <InputGroup.Text><IconifyIcon icon="ri:linkedin-fill" className="text-primary" /></InputGroup.Text>
                  <Controller
                    name="linkedin_url"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} type="text" placeholder="https://linkedin.com/company/yourpage" />
                    )}
                  />
                </InputGroup>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Agency Status */}
      <div className="mb-4">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Form.Check 
              {...field}
              type="switch"
              id="agency-active"
              label="Agency is Active"
              checked={field.value}
              className="fs-16"
            />
          )}
        />
      </div>

      {/* Form Actions */}
      <div className="text-end">
        <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          <IconifyIcon icon="ri:save-line" className="me-1" />
          Create Agency
        </Button>
      </div>
    </form>
  )
}

export default AgencyAdd
