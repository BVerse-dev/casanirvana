'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListPayments } from '@/hooks/usePayments'
import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, CardTitle, Col } from 'react-bootstrap'

const PaymentMethodChart = () => {
  const { data: payments = [] } = useListPayments()
  
  // Calculate payment method distribution
  const bankTransferCount = payments.filter(p => p.payment_method === 'bank_transfer').length
  const creditCardCount = payments.filter(p => p.payment_method === 'credit_card').length
  const debitCardCount = payments.filter(p => p.payment_method === 'debit_card').length
  const cashCount = payments.filter(p => p.payment_method === 'cash').length
  const digitalWalletCount = payments.filter(p => p.payment_method === 'digital_wallet').length

  const chartData = [bankTransferCount, creditCardCount, debitCardCount, cashCount, digitalWalletCount]
  const chartLabels = ['Bank Transfer', 'Credit Card', 'Debit Card', 'Cash', 'Digital Wallet']

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartLabels,
    },
    colors: ['#027ef4', '#47ad94', '#f0934e', '#e74c3c', '#9b59b6'],
    grid: {
      borderColor: '#f1f3fa',
    },
    legend: {
      show: false,
    },
  }

  return (
    <Col xl={6} lg={12}>
      <Card className="card-height-100">
        <CardHeader className="d-flex align-items-center border-bottom border-dashed">
          <CardTitle as={'h4'} className="mb-0">
            Payment Methods
          </CardTitle>
          <div className="ms-auto">
            <IconifyIcon icon="ri:bar-chart-line" className="text-muted" />
          </div>
        </CardHeader>
        <CardBody>
          <ReactApexChart
            options={chartOptions}
            series={[{ name: 'Payments', data: chartData }]}
            type="bar"
            height={300}
            className="apex-charts"
          />
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Most Popular:</span>
              <span className="fw-medium text-primary">
                {chartLabels[chartData.indexOf(Math.max(...chartData))]}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Total Methods:</span>
              <span className="fw-medium">{chartLabels.length}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PaymentMethodChart;
