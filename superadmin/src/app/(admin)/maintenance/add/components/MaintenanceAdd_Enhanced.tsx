'use client'
import ChoicesFormInput from '@/components/from/ChoicesFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface MaintenanceRequestFormData {
  // Basic Information
  title: string;
  description: string;
  request_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  
  // Location
  unit_id?: string;
  society_id: string;
  
  // People involved
  requested_by?: string;
  assigned_to?: string;
  
  // Cost and timeline
  estimated_cost?: number;
  actual_cost?: number;
  estimated_completion?: string;
  completed_at?: string;
  
  // Contractor details
  contractor_name?: string;
  contractor_phone?: string; // PHONE FIELD
}

const MaintenanceRequestAddForm = () => {
  const router = useRouter()

  const maintenanceSchema = yup.object({
    // Basic Information
    title: yup.string().required('Please enter title'),
    description: yup.string().required('Please enter description'),
    request_type: yup.string().required('Please select request type'),
    priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']).required('Please select priority'),
    status: yup.string().oneOf(['pending', 'in_progress', 'completed', 'cancelled']).required(),
    
    // Location
    unit_id: yup.string().optional(),
    society_id: yup.string().required('Please select society'),
    
    // People involved
    requested_by: yup.string().optional(),
    assigned_to: yup.string().optional(),
    
    // Cost and timeline
    estimated_cost: yup.number().min(0, 'Cost cannot be negative').optional(),
    actual_cost: yup.number().min(0, 'Cost cannot be negative').optional(),
    estimated_completion: yup.string().optional(),
    completed_at: yup.string().optional(),
    
    // Contractor details
    contractor_name: yup.string().optional(),
    contractor_phone: yup.string().optional(),
  })

  const { handleSubmit, control, reset } = useForm<MaintenanceRequestFormData>({
    resolver: yupResolver(maintenanceSchema),
    defaultValues: {
      priority: 'medium',
      status: 'pending',
    },
  })

  const onSubmit = async (data: MaintenanceRequestFormData) => {
    try {
      // Here you would call your maintenance request creation API
      console.log('Maintenance request data:', data)
      toast.success('Maintenance request created successfully!')
      reset()
      router.push('/maintenance')
    } catch (error) {
      toast.error('Error creating maintenance request')
      console.error('Error creating maintenance request:', error)
    }
  }

  // Mock data
  const societies = [
    { id: '1', name: 'Sunrise Apartments' },
    { id: '2', name: 'Green Valley Society' },
    { id: '3', name: 'Peaceful Heights' },
  ]

  const units = [
    { id: '1', name: 'A-101' },
    { id: '2', name: 'A-102' },
    { id: '3', name: 'B-201' },
  ]

  const staff = [
    { id: '1', name: 'John Maintenance' },
    { id: '2', name: 'Sarah Electrician' },
    { id: '3', name: 'Mike Plumber' },
  ]

  const requestTypes = [
    'plumbing',
    'electrical',
    'hvac',
    'painting',
    'carpentry',
    'appliance_repair',
    'cleaning',
    'landscaping',
    'pest_control',
    'security',
    'lift_maintenance',
    'other'
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Maintenance Request</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Basic Information */}
            <Col lg={12}>
              <h5 className="mb-3">Request Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="title" placeholder="Fix leaking tap" label="Title" required />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="request-type-select" className="form-label">
                  Request Type <span className="text-danger">*</span>
                </label>
                <Controller
                  name="request_type"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="request-type-select"
                      data-placeholder="Select Request Type"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose Request Type</option>
                      {requestTypes.map(type => (
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
                <label htmlFor="priority-select" className="form-label">
                  Priority <span className="text-danger">*</span>
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="priority-select"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
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
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput control={control} name="description" rows={4} placeholder="Describe the maintenance issue in detail..." label="Description" required />
              </div>
            </Col>

            {/* Location */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Location</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="society-select" className="form-label">
                  Society <span className="text-danger">*</span>
                </label>
                <Controller
                  name="society_id"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="society-select"
                      data-placeholder="Select Society"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose a Society</option>
                      {societies.map(society => (
                        <option key={society.id} value={society.id}>
                          {society.name}
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
                  Unit (Optional)
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
                    >
                      <option value="">Choose a Unit (if applicable)</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>

            {/* Assignment */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Assignment</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="assigned-to-select" className="form-label">
                  Assigned To
                </label>
                <Controller
                  name="assigned_to"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="assigned-to-select"
                      data-placeholder="Assign to staff member"
                      onChange={(value) => field.onChange(value)}
                    >
                      <option value="">Choose Staff Member</option>
                      {staff.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </ChoicesFormInput>
                  )}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="estimated_completion" type="date" label="Estimated Completion Date" />
              </div>
            </Col>

            {/* Cost Information */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Cost Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="estimated_cost" type="number" placeholder="1000" label="Estimated Cost (₹)" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="actual_cost" type="number" placeholder="950" label="Actual Cost (₹)" />
              </div>
            </Col>

            {/* Contractor Information */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Contractor Information</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contractor_name" placeholder="ABC Services" label="Contractor Name" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="contractor_phone" placeholder="+1234567890" label="Contractor Phone Number" />
              </div>
            </Col>
          </Row>
          <div className="text-end">
            <Button type="button" variant="outline-secondary" className="me-2" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Request
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default MaintenanceRequestAddForm
