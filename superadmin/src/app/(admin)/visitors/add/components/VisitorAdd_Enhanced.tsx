'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Collapse,
  Modal,
  Row,
} from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import TextFormInput from '@/components/from/TextFormInput'
import SelectFormInput from '@/components/from/SelectFormInput'
import { useListUnits } from '@/hooks/useUnits'
import { useCreateVisitorPass } from '@/hooks/useVisitorPasses'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { Database } from '@/lib/database.types'
import QRCode from 'qrcode'
import Image from 'next/image'

type VisitorType = 'guest' | 'cab' | 'delivery' | 'service'
type VisitorPassInsert = Database['public']['Tables']['visitor_passes']['Insert']

type UnitRecord = Database['public']['Tables']['units']['Row'] & {
  communities?: { name?: string | null } | null
}

type VisitorFormValues = {
  unit_id: string
  visit_date: string
  phone_number: string
  guest_name: string
  driver_name: string
  vehicle_number: string
  vehicle_type: string
  company_name: string
  delivery_person_name: string
  delivery_details: string
  serviceman_name: string
  service_type: string
  send_gate_pass: boolean
}

type CreatedPassSummary = {
  id: string
  visitorName: string
  visitorType: VisitorType
  visitDate: string
  unitLabel: string
  communityName: string
  entryCode: string
  qrPayload: string
}

const TODAY_DATE = () => new Date().toISOString().split('T')[0]

const phonePattern = /^[0-9+()\-\s]{7,20}$/

const optionalPhoneSchema = yup
  .string()
  .trim()
  .test('optional-phone', 'Enter a valid phone number', (value) => !value || phonePattern.test(value))

const requiredPhoneSchema = yup
  .string()
  .trim()
  .required('Please enter phone number')
  .test('required-phone', 'Enter a valid phone number', (value) => Boolean(value && phonePattern.test(value)))

const buildUnitLabel = (unit?: Partial<UnitRecord> | null) => {
  if (!unit) return 'Unit not assigned'
  const block = unit.block?.trim()
  const number = unit.number?.trim() || unit.unit_number?.trim()
  if (block && number) return `${block}-${number}`
  return number || block || 'Unit not assigned'
}

const formatVisitorTypeLabel = (value: VisitorType) => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const normalizePhoneValue = (value?: string | null) => {
  const cleaned = value?.trim()
  return cleaned ? cleaned : null
}

const getFormSchema = (visitorType: VisitorType) => {
  const baseSchema = {
    unit_id: yup.string().required('Please select a unit'),
    visit_date: yup
      .string()
      .required('Please select visit date')
      .test('not-past', 'Visit date cannot be in the past', (value) => !value || value >= TODAY_DATE()),
  }

  switch (visitorType) {
    case 'guest':
      return yup.object({
        ...baseSchema,
        guest_name: yup.string().trim().required('Please enter guest name'),
        phone_number: requiredPhoneSchema,
        send_gate_pass: yup.boolean().optional(),
      })
    case 'cab':
      return yup.object({
        ...baseSchema,
        driver_name: yup.string().trim().optional(),
        phone_number: optionalPhoneSchema,
        vehicle_number: yup.string().trim().required('Please enter vehicle number'),
        vehicle_type: yup.string().trim().required('Please select vehicle type'),
        company_name: yup.string().trim().required('Please select company name'),
        send_gate_pass: yup.boolean().optional(),
      })
    case 'delivery':
      return yup.object({
        ...baseSchema,
        delivery_person_name: yup.string().trim().required('Please enter delivery person name'),
        phone_number: optionalPhoneSchema,
        delivery_details: yup.string().trim().required('Please enter delivery details'),
        company_name: yup.string().trim().required('Please select company name'),
        send_gate_pass: yup.boolean().optional(),
      })
    case 'service':
      return yup.object({
        ...baseSchema,
        serviceman_name: yup.string().trim().required('Please enter serviceman name'),
        company_name: yup.string().trim().required('Please enter company name'),
        phone_number: requiredPhoneSchema,
        service_type: yup.string().trim().required('Please select service type'),
        send_gate_pass: yup.boolean().optional(),
      })
    default:
      return yup.object(baseSchema)
  }
}

const visitorTypeCards: Array<{
  type: VisitorType
  title: string
  icon: string
  color: string
  description: string
}> = [
  {
    type: 'guest',
    title: 'Add Guest',
    icon: 'solar:user-bold-duotone',
    color: 'primary',
    description: 'Personal visitors and household guests',
  },
  {
    type: 'cab',
    title: 'Add Cab',
    icon: 'ri:taxi-line',
    color: 'warning',
    description: 'Ride-hailing and taxi access',
  },
  {
    type: 'delivery',
    title: 'Add Delivery',
    icon: 'solar:box-bold-duotone',
    color: 'info',
    description: 'Package and food delivery visitors',
  },
  {
    type: 'service',
    title: 'Add Service',
    icon: 'ri:tools-line',
    color: 'success',
    description: 'Maintenance and specialist services',
  },
]

const serviceTypeOptions = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'other', label: 'Other' },
]

const cabCompanyOptions = [
  { value: 'Uber', label: 'Uber' },
  { value: 'Bolt', label: 'Bolt' },
  { value: 'Yango', label: 'Yango' },
  { value: 'Taxi/Bike', label: 'Taxi/Bike' },
  { value: 'Other', label: 'Other' },
]

const deliveryCompanyOptions = [
  { value: 'Yango Delivery', label: 'Yango Delivery' },
  { value: 'Uber Delivery', label: 'Uber Delivery' },
  { value: 'Bolt Delivery', label: 'Bolt Delivery' },
  { value: 'Taxi/Bike', label: 'Taxi/Bike' },
  { value: 'Other', label: 'Other' },
]

const vehicleTypeOptions = [
  { value: 'Car', label: 'Car' },
  { value: 'Bike', label: 'Bike' },
  { value: 'Van', label: 'Van' },
  { value: 'Taxi', label: 'Taxi' },
  { value: 'Other', label: 'Other' },
]

const VisitorAddEnhanced = () => {
  const router = useRouter()
  const createVisitorPass = useCreateVisitorPass()
  const { data: unitsResponse, isLoading: unitsLoading } = useListUnits({ page: 1, pageSize: 1000 })
  const units = useMemo(() => {
    return (unitsResponse?.data as UnitRecord[] | undefined) ?? []
  }, [unitsResponse?.data])

  const [selectedVisitorType, setSelectedVisitorType] = useState<VisitorType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [createdPass, setCreatedPass] = useState<CreatedPassSummary | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  const resolver = useMemo(
    () => (selectedVisitorType ? yupResolver(getFormSchema(selectedVisitorType)) : undefined),
    [selectedVisitorType]
  )

  const { handleSubmit, control, reset, watch } = useForm<VisitorFormValues>({
    resolver: resolver as any,
    defaultValues: {
      visit_date: TODAY_DATE(),
      send_gate_pass: true,
      vehicle_type: 'Car',
    },
  })

  const watchedUnitId = watch('unit_id')
  const watchedDate = watch('visit_date')
  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === watchedUnitId),
    [units, watchedUnitId]
  )

  const unitOptions = useMemo(
    () =>
      units
        .map((unit) => {
          const unitLabel = buildUnitLabel(unit)
          const communityName = unit.communities?.name?.trim()
          return {
            value: unit.id,
            label: communityName ? `${unitLabel} - ${communityName}` : unitLabel,
          }
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [units]
  )

  const resetToDefaults = (visitorType?: VisitorType | null) => {
    reset({
      unit_id: '',
      visit_date: TODAY_DATE(),
      phone_number: '',
      guest_name: '',
      driver_name: '',
      vehicle_number: '',
      vehicle_type: 'Car',
      company_name:
        visitorType === 'cab' ? cabCompanyOptions[0].value : visitorType === 'delivery' ? deliveryCompanyOptions[0].value : '',
      delivery_person_name: '',
      delivery_details: '',
      serviceman_name: '',
      service_type: '',
      send_gate_pass: true,
    })
  }

  const handleCardClick = (visitorType: VisitorType) => {
    if (selectedVisitorType === visitorType && isFormOpen) {
      setIsFormOpen(false)
      setSelectedVisitorType(null)
      resetToDefaults(null)
      return
    }

    setSelectedVisitorType(visitorType)
    setIsFormOpen(true)
    resetToDefaults(visitorType)
  }

  const buildInsertPayload = (data: VisitorFormValues, visitorType: VisitorType) => {
    const unit = units.find((item) => item.id === data.unit_id)
    const visitDate = data.visit_date
    const createdAt = new Date().toISOString()
    const fromDate = new Date(`${visitDate}T09:00:00Z`).toISOString()
    const toDate = new Date(`${visitDate}T18:00:00Z`).toISOString()
    const visitorPassToken = `VP-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    const entryCode = visitorPassToken.slice(-8).toUpperCase()

    let visitorName = ''
    let purpose = 'Guest Visit'
    let companyName: string | null = null
    let serviceType: string | null = null
    let vehicleType: string | null = null
    let vehicleNumber: string | null = null
    let driverName: string | null = null
    let deliveryDetails: string | null = null

    switch (visitorType) {
      case 'guest':
        visitorName = data.guest_name.trim()
        purpose = 'Guest Visit'
        break
      case 'cab':
        companyName = data.company_name?.trim() || null
        vehicleType = data.vehicle_type?.trim() || null
        vehicleNumber = data.vehicle_number?.trim() || null
        driverName = data.driver_name?.trim() || null
        visitorName = driverName || [companyName, vehicleNumber].filter(Boolean).join(' - ') || 'Cab Visitor'
        purpose = 'Transportation'
        break
      case 'delivery':
        companyName = data.company_name?.trim() || null
        deliveryDetails = data.delivery_details?.trim() || 'Package delivery'
        visitorName = data.delivery_person_name.trim()
        purpose = 'Delivery'
        break
      case 'service':
        companyName = data.company_name?.trim() || null
        serviceType = data.service_type?.trim() || null
        visitorName = data.serviceman_name.trim()
        purpose = serviceType ? `${serviceType} Service` : 'Service Visit'
        break
    }

    const phoneValue = normalizePhoneValue(data.phone_number)

    const qrPayload = {
      id: visitorPassToken,
      visitor_name: visitorName,
      visitor_phone: phoneValue || '',
      unit_id: data.unit_id,
      visit_date: visitDate,
      from_date: fromDate,
      to_date: toDate,
      created_at: createdAt,
      purpose,
      type: 'visitor_pass',
      entry_code: entryCode,
      visitor_type: visitorType,
      company_name: companyName,
      service_type: serviceType,
      vehicle_type: vehicleType,
      vehicle_number: vehicleNumber,
      driver_name: driverName,
      delivery_details: deliveryDetails,
    }

    const payload: VisitorPassInsert = {
      visitor_name: visitorName,
      visitor_phone: phoneValue,
      purpose,
      visitor_type: visitorType,
      visit_date: visitDate,
      from_date: fromDate,
      to_date: toDate,
      unit_id: data.unit_id,
      community_id: unit?.community_id || null,
      status: 'pending',
      send_gate_pass_notification: Boolean(data.send_gate_pass),
      entry_code: entryCode,
      qr_code_data: JSON.stringify(qrPayload),
      company_name: companyName,
      service_type: serviceType,
      vehicle_type: vehicleType,
      vehicle_number: vehicleNumber,
      driver_name: driverName,
      delivery_details: deliveryDetails,
    }

    return {
      payload,
      summary: {
        visitorName,
        visitorType,
        visitDate,
        unitLabel: buildUnitLabel(unit),
        communityName: unit?.communities?.name?.trim() || 'Unknown community',
        entryCode,
        qrPayload: JSON.stringify(qrPayload),
      },
    }
  }

  const onSubmit = async (data: VisitorFormValues) => {
    try {
      if (!selectedVisitorType) throw new Error('Select a visitor type before submitting')
      if (!unitOptions.length) throw new Error('No units are available for your current access scope')

      const { payload, summary } = buildInsertPayload(data, selectedVisitorType)
      const created = await createVisitorPass.mutateAsync(payload)

      setCreatedPass({
        ...summary,
        id: created.id,
      })

      toast.success(`${formatVisitorTypeLabel(selectedVisitorType)} entry created successfully`)
      setSelectedVisitorType(null)
      setIsFormOpen(false)
      resetToDefaults(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error creating visitor entry')
      console.error('Error creating visitor entry:', error)
    }
  }

  useEffect(() => {
    let active = true
    const payload = createdPass?.qrPayload

    if (!payload) {
      setQrCodeDataUrl(null)
      return () => {
        active = false
      }
    }

    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl: string) => {
        if (!active) return
        setQrCodeDataUrl(dataUrl)
      })
      .catch((error: Error) => {
        if (!active) return
        setQrCodeDataUrl(null)
        toast.error(error?.message || 'Unable to render QR code')
      })

    return () => {
      active = false
    }
  }, [createdPass])

  const handleCloseSuccessModal = () => {
    setCreatedPass(null)
    setQrCodeDataUrl(null)
  }

  const handleCopyEntryCode = async () => {
    if (!createdPass?.entryCode) return
    try {
      await navigator.clipboard.writeText(createdPass.entryCode)
      toast.success('Entry code copied')
    } catch {
      toast.error('Unable to copy entry code')
    }
  }

  const handleDownloadQrCode = () => {
    if (!createdPass || !qrCodeDataUrl) return
    const safeName = createdPass.visitorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const fileName = `${safeName || 'visitor'}-${createdPass.entryCode}.png`
    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const selectedTypeMeta = selectedVisitorType
    ? visitorTypeCards.find((item) => item.type === selectedVisitorType)
    : null

  const canSubmit = unitOptions.length > 0 && !createVisitorPass.isPending
  const selectedCommunityName = selectedUnit?.communities?.name?.trim()

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">
            <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2" />
            Select Visitor Type
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {visitorTypeCards.map((visitorType) => (
              <Col lg={3} md={6} key={visitorType.type} className="mb-3">
                <Card
                  className={`h-100 border-2 ${
                    selectedVisitorType === visitorType.type
                      ? `border-${visitorType.color} bg-${visitorType.color}-subtle`
                      : 'border-light-subtle'
                  }`}
                  onClick={() => handleCardClick(visitorType.type)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <CardBody className="text-center">
                    <div className={`mb-3 text-${visitorType.color}`}>
                      <IconifyIcon icon={visitorType.icon} className="fs-1" />
                    </div>
                    <h6 className="mb-2">{visitorType.title}</h6>
                    <small className="text-muted">{visitorType.description}</small>
                    {selectedVisitorType === visitorType.type && (
                      <div className="mt-2">
                        <IconifyIcon
                          icon={isFormOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                          className={`text-${visitorType.color}`}
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      <Collapse in={isFormOpen && selectedVisitorType !== null}>
        <div>
          {selectedVisitorType && selectedTypeMeta && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className={`border-${selectedTypeMeta.color}`}>
                <CardHeader className={`bg-${selectedTypeMeta.color}-subtle`}>
                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <CardTitle as="h4" className="mb-0">
                      <IconifyIcon icon={selectedTypeMeta.icon} className="me-2" />
                      {selectedTypeMeta.title} Details
                    </CardTitle>
                    <Badge bg={unitsLoading ? 'secondary' : unitOptions.length ? 'success' : 'danger'}>
                      {unitsLoading ? 'Loading units...' : `${unitOptions.length} units available`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <Alert variant="light" className="border d-flex gap-2 align-items-start mb-4">
                    <IconifyIcon icon="ri:shield-check-line" className="fs-18 text-primary mt-1" />
                    <div>
                      <strong>Production contract:</strong> this flow writes the same visitor payload and QR structure as the user app.
                    </div>
                  </Alert>

                  {!unitOptions.length && !unitsLoading && (
                    <Alert variant="warning" className="mb-4">
                      No units found for your current scope. Assign units to your accessible community before creating visitor passes.
                    </Alert>
                  )}

                  <Row>
                    {selectedVisitorType === 'guest' && (
                      <>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput control={control} name="guest_name" placeholder="Enter guest name" label="Guest Name *" />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="phone_number"
                              placeholder="Enter phone number"
                              label="Phone Number *"
                            />
                          </div>
                        </Col>
                      </>
                    )}

                    {selectedVisitorType === 'cab' && (
                      <>
                        <Col lg={6}>
                          <div className="mb-3">
                            <SelectFormInput
                              control={control}
                              name="company_name"
                              placeholder="Select company"
                              label="Company Name *"
                              options={cabCompanyOptions}
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="driver_name"
                              placeholder="Enter driver name (optional)"
                              label="Driver Name"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="phone_number"
                              placeholder="Enter phone number (optional)"
                              label="Phone Number"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <SelectFormInput
                              control={control}
                              name="vehicle_type"
                              placeholder="Select vehicle type"
                              label="Vehicle Type *"
                              options={vehicleTypeOptions}
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="vehicle_number"
                              placeholder="Enter vehicle number"
                              label="Vehicle Number *"
                            />
                          </div>
                        </Col>
                      </>
                    )}

                    {selectedVisitorType === 'delivery' && (
                      <>
                        <Col lg={6}>
                          <div className="mb-3">
                            <SelectFormInput
                              control={control}
                              name="company_name"
                              placeholder="Select company"
                              label="Company Name *"
                              options={deliveryCompanyOptions}
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="delivery_person_name"
                              placeholder="Enter delivery person name"
                              label="Delivery Person Name *"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="phone_number"
                              placeholder="Enter phone number (optional)"
                              label="Phone Number"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="delivery_details"
                              placeholder="Enter delivery details"
                              label="Delivery Details *"
                            />
                          </div>
                        </Col>
                      </>
                    )}

                    {selectedVisitorType === 'service' && (
                      <>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="serviceman_name"
                              placeholder="Enter serviceman name"
                              label="Serviceman Name *"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="company_name"
                              placeholder="Enter company name"
                              label="Company Name *"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <TextFormInput
                              control={control}
                              name="phone_number"
                              placeholder="Enter phone number"
                              label="Phone Number *"
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="mb-3">
                            <SelectFormInput
                              control={control}
                              name="service_type"
                              placeholder="Select service type"
                              label="Service Type *"
                              options={serviceTypeOptions}
                            />
                          </div>
                        </Col>
                      </>
                    )}

                    <Col lg={6}>
                      <div className="mb-3">
                        <TextFormInput
                          control={control}
                          name="visit_date"
                          type="date"
                          label="Visit Date *"
                          min={TODAY_DATE()}
                        />
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="mb-3">
                        <SelectFormInput
                          control={control}
                          name="unit_id"
                          placeholder={unitsLoading ? 'Loading units...' : 'Select unit'}
                          label="Unit *"
                          options={unitOptions}
                          isDisabled={unitsLoading || !unitOptions.length}
                        />
                      </div>
                    </Col>
                    <Col lg={12}>
                      <div className="border rounded p-3 mb-3 bg-light-subtle">
                        <div className="d-flex flex-wrap gap-3">
                          <div>
                            <span className="text-muted fs-12 text-uppercase d-block">Visit Date</span>
                            <span className="fw-semibold">{watchedDate || 'Not selected'}</span>
                          </div>
                          <div>
                            <span className="text-muted fs-12 text-uppercase d-block">Unit</span>
                            <span className="fw-semibold">{selectedUnit ? buildUnitLabel(selectedUnit) : 'Not selected'}</span>
                          </div>
                          <div>
                            <span className="text-muted fs-12 text-uppercase d-block">Community</span>
                            <span className="fw-semibold">{selectedCommunityName || 'Not selected'}</span>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col lg={12}>
                      <div className="mb-3">
                        <Controller
                          name="send_gate_pass"
                          control={control}
                          render={({ field }) => {
                            const { value, ...checkboxField } = field
                            return (
                            <div className="form-check">
                              <input
                                {...checkboxField}
                                type="checkbox"
                                className="form-check-input"
                                id={`${selectedVisitorType}_send_gate_pass`}
                                checked={Boolean(value)}
                              />
                              <label className="form-check-label" htmlFor={`${selectedVisitorType}_send_gate_pass`}>
                                Send gate pass notification
                              </label>
                            </div>
                            )
                          }}
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <Button
                      variant="outline-secondary"
                      type="button"
                      disabled={createVisitorPass.isPending}
                      onClick={() => {
                        setIsFormOpen(false)
                        setSelectedVisitorType(null)
                        resetToDefaults(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="success" type="submit" disabled={!canSubmit}>
                      {createVisitorPass.isPending
                        ? 'Creating...'
                        : `Create ${formatVisitorTypeLabel(selectedVisitorType)} Entry`}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </form>
          )}
        </div>
      </Collapse>

      <Modal show={Boolean(createdPass)} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:shield-check-line" className="text-success" />
            Visitor Pass Created
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createdPass && (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                <div>
                  <div className="text-muted fs-12 text-uppercase">Entry Code</div>
                  <div className="fs-5 fw-semibold">{createdPass.entryCode}</div>
                </div>
                <Button variant="outline-primary" size="sm" onClick={handleCopyEntryCode}>
                  Copy Code
                </Button>
              </div>

              <div className="border rounded p-3">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-muted fs-12 text-uppercase">Visitor</div>
                    <div className="fw-semibold">{createdPass.visitorName}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted fs-12 text-uppercase">Type</div>
                    <div className="fw-semibold">{formatVisitorTypeLabel(createdPass.visitorType)}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted fs-12 text-uppercase">Visit Date</div>
                    <div className="fw-semibold">{createdPass.visitDate}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted fs-12 text-uppercase">Unit</div>
                    <div className="fw-semibold">{createdPass.unitLabel}</div>
                  </div>
                  <div className="col-12">
                    <div className="text-muted fs-12 text-uppercase">Community</div>
                    <div className="fw-semibold">{createdPass.communityName}</div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column align-items-center gap-2 border rounded p-3 bg-light-subtle">
                {qrCodeDataUrl ? (
                  <Image src={qrCodeDataUrl} alt="Visitor pass QR code" width={180} height={180} unoptimized />
                ) : (
                  <div className="text-muted fs-13">Generating QR code...</div>
                )}
                <Button variant="outline-secondary" size="sm" onClick={handleDownloadQrCode} disabled={!qrCodeDataUrl}>
                  Download QR
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={handleCloseSuccessModal}>
            Create Another
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={() => router.push('/visitors/list-view')}>
              Visitor List
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!createdPass?.id) return
                router.push(`/visitors/details?id=${createdPass.id}`)
              }}
            >
              View Details
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default VisitorAddEnhanced
