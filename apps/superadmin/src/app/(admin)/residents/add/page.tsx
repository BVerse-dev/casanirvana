'use client'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import ResidentAdd from './components/ResidentAdd_Enhanced'
import ResidentAddCard from './components/ResidentAddCard'
import { useState } from 'react'
import { CreateResidentData } from '@/hooks/useResidents'
import { useRouter } from 'next/navigation'

// Note: Since we're using 'use client', we can't export metadata
// The metadata would need to be handled differently in a client component

const ResidentAddPage = () => {
  const [formData, setFormData] = useState<CreateResidentData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'resident',
    status: 'active'
  })
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (data: CreateResidentData) => {
    setFormData(data)
  }

  const handleAddResident = () => (document.getElementById('resident-form') as HTMLFormElement | null)?.requestSubmit()

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add Resident" />
      <Row>
        <ResidentAddCard 
          formData={formData}
          onAddResident={handleAddResident}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submittingLabel="Adding..."
        />
        <Col xl={9} lg={8}>
          <ResidentAdd onFormChange={handleFormChange} onSubmittingChange={setIsSubmitting} />
        </Col>
      </Row>
    </>
  )
}

export default ResidentAddPage
