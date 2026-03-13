'use client'

import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { useCreateAgencyDirectory } from '@/hooks/useAgencyDirectory'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, InputGroup, Badge } from 'react-bootstrap'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import * as yup from 'yup'

interface ManagedCommunityData {
  community_name: string
  address: string
  city: string
  state: string
  country: string
  description?: string
  established_date?: string
}

interface CreateAgencyData {
  agency_name: string
  email: string
  phone: string
  website?: string
  description?: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_position?: string
  establishment_date: string
  agency_type: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED'
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  linkedin_url?: string
  operating_hours?: string
  languages_spoken?: string[]
  specializations?: string[]
  certifications?: string[]
  managed_communities: ManagedCommunityData[]
  employee_count?: number
  is_active: boolean
  notification_preferences?: string[]
}

const agencySchema = yup.object({
  agency_name: yup.string().trim().required('Please enter agency name'),
  email: yup.string().trim().email('Invalid email format').required('Please enter email'),
  phone: yup.string().trim().required('Please enter phone number'),
  website: yup.string().url('Invalid URL format').optional(),
  description: yup.string().optional(),
  address: yup.string().trim().required('Please enter address'),
  city: yup.string().trim().required('Please enter city'),
  state: yup.string().trim().required('Please enter state/province'),
  country: yup.string().trim().required('Please enter country'),
  postal_code: yup.string().trim().required('Please enter postal code'),
  contact_person_name: yup.string().trim().required('Please enter contact person name'),
  contact_person_email: yup.string().trim().email('Invalid email format').required('Please enter contact email'),
  contact_person_phone: yup.string().trim().required('Please enter contact phone'),
  contact_person_position: yup.string().optional(),
  establishment_date: yup.string().required('Please enter establishment date'),
  agency_type: yup.string().oneOf(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']).required('Please select agency type'),
  facebook_url: yup.string().url('Invalid URL format').optional(),
  instagram_url: yup.string().url('Invalid URL format').optional(),
  twitter_url: yup.string().url('Invalid URL format').optional(),
  linkedin_url: yup.string().url('Invalid URL format').optional(),
  operating_hours: yup.string().optional(),
  languages_spoken: yup.array().of(yup.string()).optional(),
  specializations: yup.array().of(yup.string()).optional(),
  certifications: yup.array().of(yup.string()).optional(),
  managed_communities: yup
    .array()
    .of(
      yup.object({
        community_name: yup.string().trim().required('Community name is required'),
        address: yup.string().trim().required('Community address is required'),
        city: yup.string().trim().required('City is required'),
        state: yup.string().trim().required('State is required'),
        country: yup.string().trim().required('Country is required'),
        description: yup.string().optional(),
        established_date: yup.string().optional(),
      })
    )
    .min(1, 'At least one managed community is required'),
  employee_count: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue == null ? undefined : value))
    .positive('Employee count must be positive')
    .optional(),
  is_active: yup.boolean().required(),
  notification_preferences: yup.array().of(yup.string()).optional(),
})

const stripEmptyValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => stripEmptyValues(entry))
      .filter((entry) => entry !== undefined)
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).reduce<Record<string, unknown>>((accumulator, [key, entry]) => {
      const normalized = stripEmptyValues(entry)
      if (normalized !== undefined) {
        accumulator[key] = normalized
      }
      return accumulator
    }, {})

    return Object.keys(entries).length > 0 ? entries : undefined
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  return value === null ? undefined : value
}

type AgencyAddProps = {
  formId?: string
}

const AgencyAdd = ({ formId = 'agency-directory-form' }: AgencyAddProps) => {
  const router = useRouter()
  const createAgencyDirectory = useCreateAgencyDirectory()

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateAgencyData>({
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
        },
      ],
      languages_spoken: [],
      specializations: [],
      certifications: [],
      notification_preferences: [],
    },
  })

  const { fields: communityFields, append: appendCommunity, remove: removeCommunity } = useFieldArray({
    control,
    name: 'managed_communities',
  })

  const onSubmit = async (data: CreateAgencyData) => {
    try {
      const payload = stripEmptyValues({
        ...data,
        employee_count: typeof data.employee_count === 'number' ? data.employee_count : undefined,
      })
      await createAgencyDirectory.mutateAsync(payload as Record<string, unknown>)
      reset()
      router.push('/agency/list-view')
    } catch (error) {
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
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
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
                <label htmlFor="agency-type" className="form-label">
                  Agency Type *
                </label>
                <Controller
                  name="agency_type"
                  control={control}
                  render={({ field }) => (
                    <Form.Select
                      id="agency-type"
                      className={errors.agency_type ? 'is-invalid' : ''}
                      value={field.value || 'RESIDENTIAL'}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      <option value="">Choose Agency Type</option>
                      <option value="RESIDENTIAL">Residential Properties</option>
                      <option value="COMMERCIAL">Commercial Properties</option>
                      <option value="MIXED">Mixed (Residential & Commercial)</option>
                    </Form.Select>
                  )}
                />
                {errors.agency_type ? <div className="invalid-feedback d-block">{errors.agency_type.message}</div> : null}
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

      <Card className="mb-4">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <CardTitle as={'h4'}>
              <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
              Managed Communities
            </CardTitle>
            <Button type="button" variant="outline-primary" size="sm" onClick={addNewCommunity}>
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Community
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {errors.managed_communities?.message ? <div className="alert alert-danger mb-3">{errors.managed_communities.message}</div> : null}
          {communityFields.map((field, index) => (
            <Card key={field.id} className="mb-3 border-start border-primary border-3">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <Badge bg="primary" className="me-2">
                      Community {index + 1}
                    </Badge>
                    Managed Community Details
                  </h6>
                  {communityFields.length > 1 && (
                    <Button type="button" variant="outline-danger" size="sm" onClick={() => removeCommunity(index)}>
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
                        placeholder="e.g., Casa Nirvana"
                        label="Community Name *"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <TextFormInput control={control} name={`managed_communities.${index}.established_date`} type="date" label="Established Date" />
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
                      <TextFormInput control={control} name={`managed_communities.${index}.city`} placeholder="City" label="City *" />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput control={control} name={`managed_communities.${index}.state`} placeholder="State" label="State *" />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput control={control} name={`managed_communities.${index}.country`} placeholder="Country" label="Country *" />
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
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:facebook-fill" className="text-primary" />
                  </InputGroup.Text>
                  <Controller
                    name="facebook_url"
                    control={control}
                    render={({ field }) => <Form.Control {...field} value={field.value ?? ''} type="text" placeholder="https://facebook.com/yourpage" />}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Instagram URL</label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:instagram-line" className="text-danger" />
                  </InputGroup.Text>
                  <Controller
                    name="instagram_url"
                    control={control}
                    render={({ field }) => <Form.Control {...field} value={field.value ?? ''} type="text" placeholder="https://instagram.com/yourpage" />}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Twitter URL</label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:twitter-line" className="text-info" />
                  </InputGroup.Text>
                  <Controller
                    name="twitter_url"
                    control={control}
                    render={({ field }) => <Form.Control {...field} value={field.value ?? ''} type="text" placeholder="https://twitter.com/yourpage" />}
                  />
                </InputGroup>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">LinkedIn URL</label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:linkedin-fill" className="text-primary" />
                  </InputGroup.Text>
                  <Controller
                    name="linkedin_url"
                    control={control}
                    render={({ field }) => <Form.Control {...field} value={field.value ?? ''} type="text" placeholder="https://linkedin.com/company/yourpage" />}
                  />
                </InputGroup>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="mb-4">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Form.Check
              type="switch"
              id="agency-active"
              label="Agency is Active"
              checked={!!field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              className="fs-16"
            />
          )}
        />
      </div>

      <div className="text-end">
        <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={createAgencyDirectory.isPending}>
          <IconifyIcon icon="ri:save-line" className="me-1" />
          {createAgencyDirectory.isPending ? 'Creating Agency...' : 'Create Agency'}
        </Button>
      </div>
    </form>
  )
}

export default AgencyAdd
