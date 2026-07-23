import avatar2 from '@/assets/images/users/avatar-2.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { Button, Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap'
import { mapAvatarUrl } from '@/utils/avatarMapper'
import { CreateResidentData } from '@/hooks/useResidents'

interface ResidentAddCardProps {
  formData?: CreateResidentData
  onAddResident?: () => void
  onCancel?: () => void
  submitLabel?: string
  submittingLabel?: string
  isSubmitting?: boolean
}

const ResidentAddCard = ({
  formData,
  onAddResident,
  onCancel,
  submitLabel = 'Add Resident',
  submittingLabel = 'Saving...',
  isSubmitting = false,
}: ResidentAddCardProps) => {
  const displayName = formData?.first_name || formData?.last_name 
    ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim()
    : 'New Resident'
  
  const displayEmail = formData?.email || 'resident@example.com'
  const displayPhone = formData?.phone || 'No phone provided'
  const displayAddress = formData?.address || 'No address provided'
  
  // Use provided avatar or default
  const avatarSrc = formData?.avatar_url ? (mapAvatarUrl(formData.avatar_url) || avatar2) : avatar2

  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center gap-2 border-bottom pb-3">
            <Image 
              src={avatarSrc} 
              alt="avatar" 
              className="avatar-lg rounded-3 border border-light border-3" 
              width={64}
              height={64}
            />
            <div className="d-block">
              <div className="text-dark fw-medium fs-16">
                {displayName}
              </div>
              <p className="mb-0 text-muted">{displayEmail}</p>
              <p className="mb-0 text-primary">
                {formData?.role ? `Role: ${formData.role}` : 'Role: Resident'}
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="d-flex align-items-center gap-2 mb-2">
              <IconifyIcon icon="solar:phone-bold-duotone" className="fs-18 text-primary" />
              {displayPhone}
            </p>
            <p className="d-flex align-items-center gap-2 mt-2">
              <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
              {displayAddress}
            </p>
            
            
            
            {formData?.status && (
              <p className="d-flex align-items-center gap-2 mt-2">
                <IconifyIcon 
                  icon={formData.status === 'active' ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'} 
                  className={`fs-18 ${formData.status === 'active' ? 'text-success' : 'text-warning'}`} 
                />
                Status: {formData.status}
              </p>
            )}
          </div>
          
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-2">
            <Col lg={6}>
              <Button 
                variant="outline-primary" 
                className="w-100"
                onClick={onAddResident}
                disabled={isSubmitting || !formData?.first_name || !formData?.last_name || !formData?.email}
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </Col>
            <Col lg={6}>
              <Button 
                variant="danger" 
                className="w-100"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default ResidentAddCard
