'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Modal, Row } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';

export type PersonalHubExportFormat = 'csv' | 'json';

interface ExportOptionsModalProps {
  show: boolean;
  onHide: () => void;
  onExport: (format: PersonalHubExportFormat) => void;
  transactionsTotal: number;
  transactionsReturned: number;
  transactionsTruncated: boolean;
}

const FORMAT_OPTIONS: Array<{
  value: PersonalHubExportFormat;
  label: string;
  description: string;
  icon: string;
  variant: string;
}> = [
  {
    value: 'csv',
    label: 'CSV Export',
    description: 'Best for spreadsheet review and finance-team handoff.',
    icon: 'ri:file-excel-2-line',
    variant: 'success',
  },
  {
    value: 'json',
    label: 'JSON Export',
    description: 'Best for engineering review and structured downstream processing.',
    icon: 'ri:file-code-line',
    variant: 'info',
  },
];

const ExportOptionsModal = ({
  show,
  onHide,
  onExport,
  transactionsTotal,
  transactionsReturned,
  transactionsTruncated,
}: ExportOptionsModalProps) => {
  const [format, setFormat] = useState<PersonalHubExportFormat>('csv');

  useEffect(() => {
    if (show) {
      setFormat('csv');
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <IconifyIcon icon="ri:download-2-line" />
          Export Personal Hub Report
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant={transactionsTruncated ? 'warning' : 'info'}>
          {transactionsTruncated
            ? `The current result set contains ${transactionsTotal.toLocaleString('en-GH')} filtered rows, but only the newest ${transactionsReturned.toLocaleString('en-GH')} are currently loaded for export.`
            : `The export will include ${transactionsReturned.toLocaleString('en-GH')} filtered Personal Hub transaction rows.`}
        </Alert>

        <Row className="g-3">
          {FORMAT_OPTIONS.map((option) => {
            const active = option.value === format;
            return (
              <Col xs={12} key={option.value}>
                <Card
                  className={active ? 'border-primary shadow-sm' : 'border'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFormat(option.value)}
                >
                  <Card.Body className="d-flex align-items-start gap-3">
                    <div className={`avatar-sm rounded-circle bg-${option.variant}-subtle d-flex align-items-center justify-content-center`}>
                      <IconifyIcon icon={option.icon} className={`text-${option.variant}`} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <h5 className="mb-1">{option.label}</h5>
                          <p className="text-muted mb-0">{option.description}</p>
                        </div>
                        {active && <IconifyIcon icon="ri:check-line" className="text-primary fs-5" />}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onExport(format);
            onHide();
          }}
        >
          Export {format.toUpperCase()}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportOptionsModal;
