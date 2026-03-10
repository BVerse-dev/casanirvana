'use client';

import { Alert, Card } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';

type MarketplaceReadinessNoticeProps = {
  title: string;
  reason: string;
  items: string[];
};

const MarketplaceReadinessNotice = ({ title, reason, items }: MarketplaceReadinessNoticeProps) => (
  <Card>
    <Card.Body className="p-4">
      <Alert variant="warning" className="d-flex align-items-start gap-3 mb-4">
        <IconifyIcon icon="ri:alert-line" className="fs-20 mt-1" />
        <div>
          <h5 className="mb-1">{title}</h5>
          <div className="text-muted">{reason}</div>
        </div>
      </Alert>
      <div className="text-muted">
        <p className="mb-2">This workspace stays visible for planning, but live actions remain disabled until the supporting schema and app delivery paths are implemented.</p>
        <ul className="mb-0 ps-3">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Card.Body>
  </Card>
);

export default MarketplaceReadinessNotice;
