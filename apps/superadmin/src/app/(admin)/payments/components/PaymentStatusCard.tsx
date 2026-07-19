'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { usePaymentAnalyticsSummary } from '@/hooks/usePaymentAnalyticsSummary'
import React from 'react'
import { Card, CardBody, Col, ProgressBar } from 'react-bootstrap'

const PaymentStatusCard = () => {
  const {
    collectionRateByAmount,
    currentMonthCollected,
    currentMonthDueTotal,
    error,
    currentMonthProgress,
    currentMonthOutstanding,
  } = usePaymentAnalyticsSummary()
  const formatAmount = (amount: number) => `GH₵ ${Math.round(Number(amount || 0)).toLocaleString()}`

  if (error) {
    return (
      <Col xl={12} lg={12}>
        <Card className="bg-gradient-success text-white border-0 overflow-hidden position-relative card-height-90">
          <CardBody className="p-4 text-center">Collection status is unavailable right now.</CardBody>
        </Card>
      </Col>
    )
  }

  return (
    <Col xl={12} lg={12}>
      <Card className="bg-gradient-success text-white border-0 overflow-hidden position-relative card-height-90">
        <CardBody className="p-4">
          {/* Background decorative element */}
          <div className="position-absolute top-0 end-0 mt-n4 me-n4">
            <IconifyIcon 
              icon="ri:coins-line" 
              className="text-white-50 opacity-25" 
              style={{ fontSize: '120px' }}
            />
          </div>
          
          <div className="position-relative">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white mb-0">Collection Status</h5>
              <IconifyIcon icon="ri:money-dollar-circle-line" className="text-white fs-20" />
            </div>
            
            <div className="mb-3">
              <h2 className="text-white fw-bold mb-1">
                {formatAmount(currentMonthCollected)}
              </h2>
              <p className="text-white-50 mb-0 fs-14">
                {currentMonthDueTotal > 0
                  ? `of ${formatAmount(currentMonthDueTotal)} due this month`
                  : 'No dues recorded for this month'}
              </p>
            </div>

            {/* Progress bar for monthly target */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-75 fs-13">Monthly Collection Progress</span>
                <span className="text-white fw-medium fs-13">
                  {Math.round(currentMonthProgress)}%
                </span>
              </div>
              <div className="bg-white bg-opacity-25 rounded" style={{ height: '6px' }}>
                <div 
                  className="bg-white rounded h-100 transition-all"
                  style={{ 
                    width: `${Math.min(currentMonthProgress, 100)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Collection rate indicator */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon
                  icon={collectionRateByAmount >= 80 ? "ri:check-line" : "ri:time-line"}
                  className={`fs-16 ${collectionRateByAmount >= 80 ? 'text-success' : 'text-warning'}`}
                />
                <span className="text-white-75 fs-13">Overall Collection Rate</span>
              </div>
              <span className="text-white fw-medium">
                {Math.round(collectionRateByAmount)}%
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-white-75 fs-13">Outstanding This Month</span>
              <span className="text-white fw-medium">{formatAmount(currentMonthOutstanding)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default PaymentStatusCard
