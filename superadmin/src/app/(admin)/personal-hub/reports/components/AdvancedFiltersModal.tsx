"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Form, Card, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
    preset: 'custom' | 'today' | 'week' | 'month' | 'quarter' | 'year';
  };
  services: string[];
  statuses: string[];
  amountRange: {
    min: string;
    max: string;
  };
  users: {
    userIds: string[];
    verificationStatus: string[];
    kycLevels: string[];
  };
  providers: string[];
  paymentMethods: string[];
  riskLevels: string[];
  countries: string[];
}

interface AdvancedFiltersModalProps {
  show: boolean;
  onHide: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters?: Partial<FilterOptions>;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({ 
  show, 
  onHide, 
  onApplyFilters,
  currentFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: currentFilters.dateRange?.start || '',
      end: currentFilters.dateRange?.end || '',
      preset: currentFilters.dateRange?.preset || 'month'
    },
    services: currentFilters.services || [],
    statuses: currentFilters.statuses || [],
    amountRange: {
      min: currentFilters.amountRange?.min || '',
      max: currentFilters.amountRange?.max || ''
    },
    users: {
      userIds: currentFilters.users?.userIds || [],
      verificationStatus: currentFilters.users?.verificationStatus || [],
      kycLevels: currentFilters.users?.kycLevels || []
    },
    providers: currentFilters.providers || [],
    paymentMethods: currentFilters.paymentMethods || [],
    riskLevels: currentFilters.riskLevels || [],
    countries: currentFilters.countries || []
  });

  const serviceOptions = [
    { value: 'airtime', label: 'Airtime', color: 'primary' },
    { value: 'data', label: 'Data', color: 'info' },
    { value: 'transfer', label: 'Money Transfer', color: 'success' },
    { value: 'bills', label: 'Bill Payments', color: 'warning' },
    { value: 'insurance', label: 'Insurance', color: 'danger' },
    { value: 'marketplace', label: 'Marketplace', color: 'secondary' }
  ];

  const statusOptions = [
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'failed', label: 'Failed', color: 'danger' },
    { value: 'refunded', label: 'Refunded', color: 'info' }
  ];

  const verificationStatusOptions = [
    { value: 'verified', label: 'Verified', color: 'success' },
    { value: 'pending', label: 'Pending Verification', color: 'warning' },
    { value: 'rejected', label: 'Rejected', color: 'danger' },
    { value: 'unverified', label: 'Unverified', color: 'secondary' }
  ];

  const kycLevelOptions = [
    { value: 'level_0', label: 'Level 0 - Basic', color: 'secondary' },
    { value: 'level_1', label: 'Level 1 - Standard', color: 'info' },
    { value: 'level_2', label: 'Level 2 - Enhanced', color: 'success' },
    { value: 'level_3', label: 'Level 3 - Premium', color: 'primary' }
  ];

  const providerOptions = [
    'MTN Ghana', 'Vodafone Ghana', 'AirtelTigo Ghana', 'ECG Ghana', 
    'Ghana Water Company', 'Mobile Money Ghana', 'Hollard Insurance',
    'CasaNirvana Marketplace'
  ];

  const paymentMethodOptions = [
    'mobile_money', 'credit_card', 'debit_card', 'bank_transfer', 'wallet_balance'
  ];

  const riskLevelOptions = [
    { value: 'low', label: 'Low Risk', color: 'success' },
    { value: 'medium', label: 'Medium Risk', color: 'warning' },
    { value: 'high', label: 'High Risk', color: 'danger' }
  ];

  const countryOptions = [
    'Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Uganda', 'Tanzania'
  ];

  const handleServiceToggle = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  const handleVerificationStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      users: {
        ...prev.users,
        verificationStatus: prev.users.verificationStatus.includes(status)
          ? prev.users.verificationStatus.filter(s => s !== status)
          : [...prev.users.verificationStatus, status]
      }
    }));
  };

  const handleKycLevelToggle = (level: string) => {
    setFilters(prev => ({
      ...prev,
      users: {
        ...prev.users,
        kycLevels: prev.users.kycLevels.includes(level)
          ? prev.users.kycLevels.filter(l => l !== level)
          : [...prev.users.kycLevels, level]
      }
    }));
  };

  const handleProviderToggle = (provider: string) => {
    setFilters(prev => ({
      ...prev,
      providers: prev.providers.includes(provider)
        ? prev.providers.filter(p => p !== provider)
        : [...prev.providers, provider]
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFilters(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleRiskLevelToggle = (level: string) => {
    setFilters(prev => ({
      ...prev,
      riskLevels: prev.riskLevels.includes(level)
        ? prev.riskLevels.filter(l => l !== level)
        : [...prev.riskLevels, level]
    }));
  };

  const handleCountryToggle = (country: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      dateRange: { start: '', end: '', preset: 'month' },
      services: [],
      statuses: [],
      amountRange: { min: '', max: '' },
      users: { userIds: [], verificationStatus: [], kycLevels: [] },
      providers: [],
      paymentMethods: [],
      riskLevels: [],
      countries: []
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onHide();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.services.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    if (filters.users.verificationStatus.length > 0) count++;
    if (filters.users.kycLevels.length > 0) count++;
    if (filters.providers.length > 0) count++;
    if (filters.paymentMethods.length > 0) count++;
    if (filters.riskLevels.length > 0) count++;
    if (filters.countries.length > 0) count++;
    return count;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon="ri:filter-3-line" className="me-2" />
          Advanced Filters
          {getActiveFiltersCount() > 0 && (
            <Badge bg="primary" className="ms-2">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row>
          {/* Date Range */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Date Range</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Preset Range</Form.Label>
                  <Form.Select
                    value={filters.dateRange.preset}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, preset: e.target.value as any }
                    }))}
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>
                
                {filters.dateRange.preset === 'custom' && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters(prev => ({
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
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value }
                          }))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Amount Range */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Amount Range</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Amount</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="0.00"
                        value={filters.amountRange.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          amountRange: { ...prev.amountRange, min: e.target.value }
                        }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Maximum Amount</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="10000.00"
                        value={filters.amountRange.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          amountRange: { ...prev.amountRange, max: e.target.value }
                        }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Services */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Services</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <Badge
                      key={service.value}
                      bg={filters.services.includes(service.value) ? service.color : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleServiceToggle(service.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:service-line" className="me-1" />
                      {service.label}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Transaction Status */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Transaction Status</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Badge
                      key={status.value}
                      bg={filters.statuses.includes(status.value) ? status.color : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleStatusToggle(status.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:checkbox-circle-line" className="me-1" />
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* User Verification Status */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">User Verification Status</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {verificationStatusOptions.map((status) => (
                    <Badge
                      key={status.value}
                      bg={filters.users.verificationStatus.includes(status.value) ? status.color : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleVerificationStatusToggle(status.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:shield-check-line" className="me-1" />
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* KYC Levels */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">KYC Levels</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {kycLevelOptions.map((level) => (
                    <Badge
                      key={level.value}
                      bg={filters.users.kycLevels.includes(level.value) ? level.color : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleKycLevelToggle(level.value)}
                      style={{ cursor: 'pointer', fontSize: '11px' }}
                    >
                      <IconifyIcon icon="ri:vip-crown-line" className="me-1" />
                      {level.label}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service Providers */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Service Providers</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {providerOptions.map((provider) => (
                    <Badge
                      key={provider}
                      bg={filters.providers.includes(provider) ? 'primary' : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleProviderToggle(provider)}
                      style={{ cursor: 'pointer', fontSize: '11px' }}
                    >
                      <IconifyIcon icon="ri:building-line" className="me-1" />
                      {provider}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Payment Methods */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Payment Methods</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {paymentMethodOptions.map((method) => (
                    <Badge
                      key={method}
                      bg={filters.paymentMethods.includes(method) ? 'info' : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handlePaymentMethodToggle(method)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:bank-card-line" className="me-1" />
                      {method.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Risk Levels */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Risk Levels</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {riskLevelOptions.map((risk) => (
                    <Badge
                      key={risk.value}
                      bg={filters.riskLevels.includes(risk.value) ? risk.color : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleRiskLevelToggle(risk.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:shield-line" className="me-1" />
                      {risk.label}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Countries */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Countries</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {countryOptions.map((country) => (
                    <Badge
                      key={country}
                      bg={filters.countries.includes(country) ? 'success' : 'outline-secondary'}
                      className="p-2 cursor-pointer"
                      onClick={() => handleCountryToggle(country)}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconifyIcon icon="ri:global-line" className="me-1" />
                      {country}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* User IDs */}
          <Col md={12}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Specific Users</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>User IDs (comma-separated)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter user IDs separated by commas (e.g., USR-ABC123, USR-DEF456)"
                    value={filters.users.userIds.join(', ')}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      users: {
                        ...prev.users,
                        userIds: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                      }
                    }))}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <Button variant="outline-secondary" onClick={handleClearAllFilters}>
              <IconifyIcon icon="ri:eraser-line" className="me-1" />
              Clear All
            </Button>
          </div>
          <div>
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplyFilters}>
              <IconifyIcon icon="ri:filter-3-line" className="me-1" />
              Apply Filters ({getActiveFiltersCount()})
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvancedFiltersModal;
