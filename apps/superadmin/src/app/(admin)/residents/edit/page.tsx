'use client'

import FileUpload from '@/components/FileUpload'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import ResidentAddCard from '../add/components/ResidentAddCard'
import ResidentAddEnhanced from '../add/components/ResidentAdd_Enhanced'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CreateResidentData } from '@/hooks/useResidents'
import { useGetResident } from '@/hooks/useResidents'
import { useRouter } from 'next/navigation'

const ResidentEditPage = () => {
  const searchParams = useSearchParams()
  const residentId = searchParams.get('id')
  const { data: resident, isLoading, error } = useGetResident(residentId || '')
  const router = useRouter()
  const [formData, setFormData] = useState<CreateResidentData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'resident',
    status: 'active',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (data: CreateResidentData) => {
    setFormData(data)
  }

  const handleSubmitFromCard = () => {
    const form = document.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }
  }

  if (!residentId) {
    return (
      <Row>
        <Col xl={12}>
          <PageTitle subName="Casa Nirvana" title="Edit Resident" />
          <div className="alert alert-warning" role="alert">
            Missing resident ID. Open a resident from the Residents list and choose Edit.
          </div>
          <Link href="/residents/list-view" className="btn btn-primary">
            Back to Residents
          </Link>
        </Col>
      </Row>
    )
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <PageTitle subName="Casa Nirvana" title="Edit Resident" />
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <div className="mt-2">Loading resident details...</div>
            </div>
          </div>
        </Col>
      </Row>
    )
  }

  if (error || !resident) {
    return (
      <Row>
        <Col xl={12}>
          <PageTitle subName="Casa Nirvana" title="Edit Resident" />
          <div className="alert alert-danger" role="alert">
            Resident not found. Verify the resident record and try again.
          </div>
          <Link href="/residents/list-view" className="btn btn-primary">
            Back to Residents
          </Link>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Edit Resident" />
      <Row>
        <ResidentAddCard
          formData={formData}
          onAddResident={handleSubmitFromCard}
          onCancel={() => router.push(`/residents/details?id=${resident.id}`)}
          submitLabel="Update Resident"
          isSubmitting={isSubmitting}
          submittingLabel="Updating..."
        />
        <Col xl={9} lg={8}>
          <FileUpload title="Update Resident Photo" />
          <ResidentAddEnhanced
            mode="edit"
            resident={resident}
            residentId={resident.id}
            onFormChange={handleFormChange}
            onSubmittingChange={setIsSubmitting}
            onSuccess={() => {
              router.push(`/residents/details?id=${resident.id}`)
            }}
          />
        </Col>
      </Row>
    </>
  )
}

export default ResidentEditPage
