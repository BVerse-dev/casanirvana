'use client'
import SelectFormInput from '@/components/from/SelectFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { useCreateService } from '@/hooks/useServices'
import { useListCommunities } from '@/hooks/useCommunities'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as yup from 'yup'

const serviceCategories = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'security', label: 'Security' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'repair', label: 'Repair' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'appliance_repair', label: 'Appliance Repair' },
  { value: 'painting', label: 'Painting' },
  { value: 'packers_movers', label: 'Packers & Movers' },
  { value: 'home_sanitization', label: 'Home Sanitization' },
  { value: 'hair_beauty', label: 'Hair & Beauty' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'other', label: 'Other' },
]

type ServiceFormValues = {
  base_price: number | null
  category: string
  community_id: string
  description: string
  features: {
    is_24_7_available: boolean
    is_booking_required: boolean
    is_emergency_service: boolean
    is_premium_service: boolean
  }
  is_active: 'true' | 'false'
  name: string
}

const ServiceAdd = () => {
  const router = useRouter()
  const createServiceMutation = useCreateService()
  const { data: communitiesData = { data: [] } } = useListCommunities({ pageSize: 100 })
  const communities = communitiesData.data || []

  const serviceSchema = yup.object({
    name: yup.string().required('Please enter service name'),
    category: yup.string().required('Please select a category'),
    description: yup.string().required('Please enter service description'),
    base_price: yup.number().min(0, 'Price must be positive').nullable(),
    is_active: yup.string().required('Please select service status'),
    community_id: yup.string().required('Please select a community'),
    features: yup.object({
      is_24_7_available: yup.boolean().default(false),
      is_emergency_service: yup.boolean().default(false),
      is_booking_required: yup.boolean().default(false),
      is_premium_service: yup.boolean().default(false),
    }).optional(),
  })

  const { handleSubmit, control, reset } = useForm<ServiceFormValues>({
    resolver: yupResolver(serviceSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      description: '',
      base_price: null,
      is_active: 'true',
      community_id: '',
      features: {
        is_24_7_available: false,
        is_emergency_service: false,
        is_booking_required: false,
        is_premium_service: false,
      },
    },
  })

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const serviceData = {
        name: data.name,
        category: data.category,
        description: data.description,
        base_price: data.base_price ? Number(data.base_price) : null,
        is_active: data.is_active === 'true',
        community_id: data.community_id,
        features: data.features || {},
      }

      const createdService = await createServiceMutation.mutateAsync(serviceData)
      toast.success('Service created successfully!')
      reset()
      router.push(`/services/details?id=${createdService.id}`)
    } catch (error) {
      console.error('Failed to create service:', error)
      toast.error('Failed to create service. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Service Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="name" 
                  placeholder="Service Name" 
                  label="Service Name" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="category"
                  label="Service Category"
                  placeholder="Select Category"
                  options={serviceCategories}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="base_price" 
                  type="number" 
                  placeholder="0.00" 
                  label="Base Price (Optional)" 
                  step="0.01"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="is_active"
                  label="Service Status"
                  placeholder="Select Status"
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="community_id"
                  label="Community"
                  placeholder="Select Community"
                  options={communities.map(community => ({
                    value: community.id,
                    label: community.name
                  }))}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput 
                  control={control} 
                  name="description" 
                  placeholder="Enter service description" 
                  label="Service Description" 
                  rows={4}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Service Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <div className="mb-3">
                <label className="form-label">Service Features</label>
                <div className="d-flex flex-wrap gap-2">
                  <Controller
                    name="features.is_24_7_available"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-switch form-switch-md">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="feature1"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="feature1">
                          24/7 Available
                        </label>
                      </div>
                    )}
                  />
                  <Controller
                    name="features.is_emergency_service"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-switch form-switch-md">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="feature2"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="feature2">
                          Emergency Service
                        </label>
                      </div>
                    )}
                  />
                  <Controller
                    name="features.is_booking_required"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-switch form-switch-md">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="feature3"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="feature3">
                          Booking Required
                        </label>
                      </div>
                    )}
                  />
                  <Controller
                    name="features.is_premium_service"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-switch form-switch-md">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="feature4"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="feature4">
                          Premium Service
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button 
              type="submit" 
              variant="outline-primary" 
              className="w-100"
              disabled={createServiceMutation.isPending}
            >
              {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="danger" className="w-100" type="button" onClick={() => reset()}>
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default ServiceAdd
