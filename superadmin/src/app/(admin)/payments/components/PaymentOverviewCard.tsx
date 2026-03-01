'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListPayments } from '@/hooks/usePayments'
import React from 'react'
import { Card, CardBody, Col } from 'react-bootstrap'

const PaymentOverviewCard = () => {
  const { data: payments = [] } = useListPayments()
  const formatAmount = (amount: number) => `GH₵ ${Math.round(Number(amount || 0)).toLocaleString()}`
  
  // Calculate payment overview statistics
  const totalPayments = payments.length
  const completedPayments = payments.filter(p => p.status === 'completed').length
  const completionRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0
  const pendingPayments = payments.filter(p => p.status === 'initiated' || p.status === 'processing').length
  
  // Calculate average payment amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const avgPaymentAmount = totalPayments > 0 ? totalAmount / totalPayments : 0

  return (
    <Col xl={12} lg={12}>
      <Card className="bg-gradient-primary text-white border-0 overflow-hidden position-relative card-height-90">
        <CardBody className="p-4">
          {/* Background decorative element */}
          <div className="position-absolute top-0 end-0 mt-n4 me-n4">
            <IconifyIcon 
              icon="ri:file-list-3-line" 
              className="text-white-50 opacity-25" 
              style={{ fontSize: '120px' }}
            />
          </div>
          
          <div className="position-relative">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white mb-0">Payment Overview</h5>
              <IconifyIcon icon="ri:bar-chart-box-line" className="text-white fs-20" />
            </div>
            
            <div className="mb-3">
              <h2 className="text-white fw-bold mb-1">
                {completedPayments.toLocaleString()}
              </h2>
              <p className="text-white-50 mb-0 fs-14">
                of {totalPayments.toLocaleString()} total transactions ({pendingPayments.toLocaleString()} in flight)
              </p>
            </div>

            {/* Progress bar for completion rate */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-75 fs-13">Success Rate</span>
                <span className="text-white fw-medium fs-13">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div className="bg-white bg-opacity-25 rounded" style={{ height: '6px' }}>
                <div 
                  className="bg-white rounded h-100 transition-all"
                  style={{ 
                    width: `${Math.min(completionRate, 100)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Average payment indicator */}
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon 
                  icon="ri:money-dollar-box-line" 
                  className="fs-16 text-success"
                />
                <span className="text-white-75 fs-13">Avg Payment</span>
              </div>
              <span className="text-white fw-medium">
                {formatAmount(avgPaymentAmount)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default PaymentOverviewCard
