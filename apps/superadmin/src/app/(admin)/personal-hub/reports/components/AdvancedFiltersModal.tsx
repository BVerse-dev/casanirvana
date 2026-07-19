'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { PersonalHubReportOption } from '@/hooks/usePersonalHubReports';

export interface PersonalHubAdvancedFilters {
  serviceTypes: string[];
  statuses: string[];
  providers: string[];
  minAmount: string;
  maxAmount: string;
}

interface AdvancedFiltersModalProps {
  show: boolean;
  onHide: () => void;
  onApplyFilters: (filters: PersonalHubAdvancedFilters) => void;
  currentFilters: PersonalHubAdvancedFilters;
  options: {
    services: PersonalHubReportOption[];
    statuses: PersonalHubReportOption[];
    providers: PersonalHubReportOption[];
  };
}

const SelectPillGroup = ({
  items,
  selected,
  onToggle,
}: {
  items: PersonalHubReportOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) => {
  if (items.length === 0) {
    return <div className="text-muted small">No options available for the selected period.</div>;
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item.value);
        return (
          <Button
            key={item.value}
            variant={active ? 'primary' : 'light'}
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={() => onToggle(item.value)}
          >
            <span>{item.label}</span>
            <span className={active ? 'text-white-50' : 'text-muted'}>({item.count})</span>
          </Button>
        );
      })}
    </div>
  );
};

const AdvancedFiltersModal = ({ show, onHide, onApplyFilters, currentFilters, options }: AdvancedFiltersModalProps) => {
  const [draft, setDraft] = useState<PersonalHubAdvancedFilters>(currentFilters);

  useEffect(() => {
    if (show) {
      setDraft(currentFilters);
    }
  }, [currentFilters, show]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (draft.serviceTypes.length > 0) count += 1;
    if (draft.statuses.length > 0) count += 1;
    if (draft.providers.length > 0) count += 1;
    if (draft.minAmount.trim() || draft.maxAmount.trim()) count += 1;
    return count;
  }, [draft]);

  const toggle = (field: 'serviceTypes' | 'statuses' | 'providers', value: string) => {
    setDraft((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((entry) => entry !== value)
        : [...previous[field], value],
    }));
  };

  const clearFilters = () => {
    setDraft({
      serviceTypes: [],
      statuses: [],
      providers: [],
      minAmount: '',
      maxAmount: '',
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <IconifyIcon icon="ri:filter-3-line" />
          Advanced Filters
          {activeCount > 0 && <span className="badge bg-primary">{activeCount}</span>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Services</h5>
              </Card.Header>
              <Card.Body>
                <SelectPillGroup items={options.services} selected={draft.serviceTypes} onToggle={(value) => toggle('serviceTypes', value)} />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Statuses</h5>
              </Card.Header>
              <Card.Body>
                <SelectPillGroup items={options.statuses} selected={draft.statuses} onToggle={(value) => toggle('statuses', value)} />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Providers</h5>
              </Card.Header>
              <Card.Body>
                <SelectPillGroup items={options.providers} selected={draft.providers} onToggle={(value) => toggle('providers', value)} />
              </Card.Body>
            </Card>
          </Col>

          <Col md={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Amount Range</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Minimum Amount (GH₵)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={draft.minAmount}
                        onChange={(event) => setDraft((previous) => ({ ...previous, minAmount: event.target.value }))}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Maximum Amount (GH₵)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={draft.maxAmount}
                        onChange={(event) => setDraft((previous) => ({ ...previous, maxAmount: event.target.value }))}
                        placeholder="1000.00"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="light" onClick={clearFilters}>
          Clear All
        </Button>
        <div className="d-flex gap-2">
          <Button variant="light" onClick={onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onApplyFilters(draft);
              onHide();
            }}
          >
            Apply Filters
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvancedFiltersModal;
