"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Form, Card, Badge, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  includeColumns: string[];
  reportType: 'transactions' | 'financial' | 'engagement' | 'performance';
  filters: {
    services: string[];
    statuses: string[];
    users: string[];
  };
  groupBy: 'none' | 'service' | 'status' | 'user' | 'date' | 'provider';
  includeCharts: boolean;
  includeMetadata: boolean;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  emailDelivery: {
    enabled: boolean;
    recipients: string[];
    subject: string;
    message: string;
  };
}

interface ExportOptionsModalProps {
  show: boolean;
  onHide: () => void;
  onExport: (options: ExportOptions) => void;
  reportType: 'transactions' | 'financial' | 'engagement' | 'performance';
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ 
  show, 
  onHide, 
  onExport,
  reportType
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0] // today
    },
    includeColumns: [],
    reportType: reportType,
    filters: {
      services: [],
      statuses: [],
      users: []
    },
    groupBy: 'none',
    includeCharts: true,
    includeMetadata: true,
    compressionLevel: 'medium',
    emailDelivery: {
      enabled: false,
      recipients: [],
      subject: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      message: 'Please find the requested report attached.'
    }
  });

  const [estimatedSize, setEstimatedSize] = useState('2.5 MB');
  const [estimatedRows, setEstimatedRows] = useState(8742);

  const formatOptions = [
    { 
      value: 'excel', 
      label: 'Excel (.xlsx)', 
      icon: 'ri:file-excel-2-line', 
      color: 'success',
      description: 'Best for analysis with formulas and charts'
    },
    { 
      value: 'pdf', 
      label: 'PDF (.pdf)', 
      icon: 'ri:file-pdf-line', 
      color: 'danger',
      description: 'Best for sharing and printing'
    },
    { 
      value: 'csv', 
      label: 'CSV (.csv)', 
      icon: 'ri:file-chart-line', 
      color: 'info',
      description: 'Best for importing into other systems'
    },
    { 
      value: 'json', 
      label: 'JSON (.json)', 
      icon: 'ri:file-code-line', 
      color: 'warning',
      description: 'Best for developers and APIs'
    }
  ];

  const getAvailableColumns = () => {
    switch (reportType) {
      case 'transactions':
        return [
          'Transaction ID', 'Reference', 'Date & Time', 'Service', 'Details', 
          'Amount', 'Fee', 'Net Amount', 'User', 'Status', 'Provider', 
          'Payment Method', 'Commission', 'Risk Score'
        ];
      case 'financial':
        return [
          'Date', 'Service', 'Gross Revenue', 'Provider Fees', 'Platform Commission',
          'Net Revenue', 'Margin %', 'Transaction Count', 'Avg Transaction Value'
        ];
      case 'engagement':
        return [
          'Date', 'Service', 'Active Users', 'New Users', 'Session Duration',
          'Sessions per User', 'Conversion Rate', 'Retention Rate'
        ];
      case 'performance':
        return [
          'Date', 'API Endpoint', 'Requests', 'Response Time', 'Success Rate',
          'Error Rate', 'Timeout Rate', 'Uptime %'
        ];
      default:
        return [];
    }
  };

  const serviceOptions = [
    'Airtime', 'Data', 'Money Transfer', 'Bill Payments', 'Insurance', 'Marketplace'
  ];

  const statusOptions = [
    'Completed', 'Pending', 'Failed', 'Refunded'
  ];

  const groupByOptions = [
    { value: 'none', label: 'No Grouping' },
    { value: 'service', label: 'Group by Service' },
    { value: 'status', label: 'Group by Status' },
    { value: 'user', label: 'Group by User' },
    { value: 'date', label: 'Group by Date' },
    { value: 'provider', label: 'Group by Provider' }
  ];

  const compressionOptions = [
    { value: 'none', label: 'No Compression', size: '100%' },
    { value: 'low', label: 'Low Compression', size: '~80%' },
    { value: 'medium', label: 'Medium Compression', size: '~60%' },
    { value: 'high', label: 'High Compression', size: '~40%' }
  ];

  const handleColumnToggle = (column: string) => {
    setOptions(prev => ({
      ...prev,
      includeColumns: prev.includeColumns.includes(column)
        ? prev.includeColumns.filter(c => c !== column)
        : [...prev.includeColumns, column]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        services: prev.filters.services.includes(service)
          ? prev.filters.services.filter(s => s !== service)
          : [...prev.filters.services, service]
      }
    }));
  };

  const handleStatusToggle = (status: string) => {
    setOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        statuses: prev.filters.statuses.includes(status)
          ? prev.filters.statuses.filter(s => s !== status)
          : [...prev.filters.statuses, status]
      }
    }));
  };

  const handleSelectAllColumns = () => {
    const allColumns = getAvailableColumns();
    setOptions(prev => ({
      ...prev,
      includeColumns: prev.includeColumns.length === allColumns.length ? [] : allColumns
    }));
  };

  const handleAddRecipient = () => {
    const email = prompt('Enter email address:');
    if (email && email.includes('@')) {
      setOptions(prev => ({
        ...prev,
        emailDelivery: {
          ...prev.emailDelivery,
          recipients: [...prev.emailDelivery.recipients, email]
        }
      }));
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setOptions(prev => ({
      ...prev,
      emailDelivery: {
        ...prev.emailDelivery,
        recipients: prev.emailDelivery.recipients.filter(r => r !== email)
      }
    }));
  };

  const handleExport = () => {
    onExport(options);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon="ri:download-2-line" className="me-2" />
          Export {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row>
          {/* Export Format */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Export Format</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {formatOptions.map((format) => (
                    <div
                      key={format.value}
                      className={`p-3 border rounded cursor-pointer ${
                        options.format === format.value ? 'border-primary bg-light' : 'border-light'
                      }`}
                      onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <IconifyIcon 
                            icon={format.icon} 
                            size={24} 
                            className={`text-${format.color}`}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{format.label}</h6>
                          <small className="text-muted">{format.description}</small>
                        </div>
                        {options.format === format.value && (
                          <IconifyIcon icon="ri:check-line" className="text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Date Range */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Date Range</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={options.dateRange.start}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={options.dateRange.end}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info" className="mb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Estimated:</strong> {estimatedRows.toLocaleString()} rows
                    </div>
                    <div>
                      <strong>Size:</strong> {estimatedSize}
                    </div>
                  </div>
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          {/* Columns to Include */}
          <Col md={12}>
            <Card className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Columns to Include</h6>
                <Button variant="outline-primary" size="sm" onClick={handleSelectAllColumns}>
                  {options.includeColumns.length === getAvailableColumns().length ? 'Deselect All' : 'Select All'}
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {getAvailableColumns().map((column) => (
                    <Badge
                      key={column}
                      bg={options.includeColumns.includes(column) ? 'primary' : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleColumnToggle(column)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:table-line" className="me-1" />
                      {column}
                    </Badge>
                  ))}
                </div>
                {options.includeColumns.length === 0 && (
                  <div className="text-center text-muted mt-3">
                    <IconifyIcon icon="ri:information-line" className="me-1" />
                    Select at least one column to include in the export
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Filters */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Filter by Services</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <Badge
                      key={service}
                      bg={options.filters.services.includes(service) ? 'success' : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleServiceToggle(service)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:service-line" className="me-1" />
                      {service}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Filter by Status</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Badge
                      key={status}
                      bg={options.filters.statuses.includes(status) ? 'warning' : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleStatusToggle(status)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:checkbox-circle-line" className="me-1" />
                      {status}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Options */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Export Options</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Group Data By</Form.Label>
                  <Form.Select
                    value={options.groupBy}
                    onChange={(e) => setOptions(prev => ({ ...prev, groupBy: e.target.value as any }))}
                  >
                    {groupByOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {(options.format === 'excel' || options.format === 'pdf') && (
                  <Form.Check
                    type="checkbox"
                    id="include-charts"
                    label="Include Charts and Visualizations"
                    checked={options.includeCharts}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="mb-3"
                  />
                )}

                <Form.Check
                  type="checkbox"
                  id="include-metadata"
                  label="Include Report Metadata (filters, generation time, etc.)"
                  checked={options.includeMetadata}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="mb-3"
                />

                <Form.Group>
                  <Form.Label>Compression Level</Form.Label>
                  <Form.Select
                    value={options.compressionLevel}
                    onChange={(e) => setOptions(prev => ({ ...prev, compressionLevel: e.target.value as any }))}
                  >
                    {compressionOptions.map((compression) => (
                      <option key={compression.value} value={compression.value}>
                        {compression.label} ({compression.size})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Email Delivery */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Email Delivery</h6>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="checkbox"
                  id="email-delivery"
                  label="Send report via email"
                  checked={options.emailDelivery.enabled}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    emailDelivery: { ...prev.emailDelivery, enabled: e.target.checked }
                  }))}
                  className="mb-3"
                />

                {options.emailDelivery.enabled && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex justify-content-between align-items-center">
                        Recipients
                        <Button variant="outline-primary" size="sm" onClick={handleAddRecipient}>
                          <IconifyIcon icon="ri:add-line" className="me-1" />
                          Add
                        </Button>
                      </Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {options.emailDelivery.recipients.map((email, index) => (
                          <Badge
                            key={index}
                            bg="primary"
                            className="p-2 d-flex align-items-center"
                          >
                            {email}
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 ms-2 text-white"
                              onClick={() => handleRemoveRecipient(email)}
                            >
                              <IconifyIcon icon="ri:close-line" size={12} />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        value={options.emailDelivery.subject}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          emailDelivery: { ...prev.emailDelivery, subject: e.target.value }
                        }))}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={options.emailDelivery.message}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          emailDelivery: { ...prev.emailDelivery, message: e.target.value }
                        }))}
                      />
                    </Form.Group>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <small className="text-muted">
              Export will include {options.includeColumns.length} columns • 
              Estimated size: {estimatedSize} • 
              Format: {formatOptions.find(f => f.value === options.format)?.label}
            </small>
          </div>
          <div>
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleExport}
              disabled={options.includeColumns.length === 0}
            >
              <IconifyIcon icon="ri:download-2-line" className="me-1" />
              {options.emailDelivery.enabled ? 'Generate & Send' : 'Download Report'}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportOptionsModal;
