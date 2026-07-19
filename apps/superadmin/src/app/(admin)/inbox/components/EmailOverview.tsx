'use client';

import { Card, CardBody, Col, Row } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getEmailSummaryOrEmpty, useAdminEmails } from '@/hooks/useAdminEmails';

const overviewCards = [
  {
    key: 'inbox',
    label: 'Inbox',
    description: 'Scoped inbound records',
    icon: 'solar:inbox-bold-duotone',
    tone: 'primary',
  },
  {
    key: 'queued',
    label: 'Queued',
    description: 'Outbound emails awaiting delivery',
    icon: 'solar:plain-2-bold-duotone',
    tone: 'warning',
  },
  {
    key: 'drafts',
    label: 'Drafts',
    description: 'Unsent admin drafts',
    icon: 'solar:document-text-bold-duotone',
    tone: 'info',
  },
  {
    key: 'unread',
    label: 'Unread',
    description: 'Needs review',
    icon: 'solar:letter-unread-bold-duotone',
    tone: 'danger',
  },
] as const;

const EmailOverview = () => {
  const { data, isLoading } = useAdminEmails({ folder: 'all', limit: 50 });
  const summary = getEmailSummaryOrEmpty(data?.summary);

  return (
    <Row className="g-3 mb-4">
      {overviewCards.map((card) => (
        <Col md={6} xl={3} key={card.key}>
          <Card className="h-100 border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <span className={`badge bg-${card.tone}-subtle text-${card.tone} text-uppercase mb-2`}>
                    {card.label}
                  </span>
                  <h3 className="mb-1">{isLoading ? '--' : summary[card.key]}</h3>
                  <p className="text-muted mb-0">{card.description}</p>
                </div>
                <div className={`avatar-md bg-${card.tone}-subtle text-${card.tone} rounded-circle flex-centered`}>
                  <IconifyIcon icon={card.icon} className="fs-24" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default EmailOverview;
