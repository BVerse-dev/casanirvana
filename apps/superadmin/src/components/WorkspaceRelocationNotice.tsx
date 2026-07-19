import Link from 'next/link';
import { Alert, Badge, Card, Col, Row } from 'react-bootstrap';

import ComponentContainerCard from '@/components/ComponentContainerCard';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

type WorkspaceRelocationNoticeProps = {
  title: string;
  subName: string;
  badgeLabel: string;
  badgeVariant?: string;
  reason: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  tertiaryLabel?: string;
  tertiaryUrl?: string;
};

const WorkspaceRelocationNotice = ({
  title,
  subName,
  badgeLabel,
  badgeVariant = 'primary',
  reason,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  tertiaryLabel,
  tertiaryUrl,
}: WorkspaceRelocationNoticeProps) => {
  return (
    <>
      <PageTitle title={title} subName={subName} />

      <ComponentContainerCard id="workspace-relocation-notice" title={title}>
        <Alert variant="info" className="d-flex align-items-start gap-3 mb-4">
          <IconifyIcon icon="ri:information-line" className="fs-20 mt-1" />
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <strong>This workspace was consolidated.</strong>
              <Badge bg={badgeVariant}>{badgeLabel}</Badge>
            </div>
            <div className="text-muted">{reason}</div>
          </div>
        </Alert>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h5 className="mb-3">Where to manage this now</h5>
                <p className="text-muted mb-4">
                  Notification operations now run from the shared workspace so campaigns, templates, reporting, and channel setup stay aligned across all apps.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href={primaryUrl} className="btn btn-primary">
                    <IconifyIcon icon="ri:arrow-right-line" className="me-1" />
                    {primaryLabel}
                  </Link>
                  {secondaryLabel && secondaryUrl ? (
                    <Link href={secondaryUrl} className="btn btn-outline-secondary">
                      <IconifyIcon icon="ri:settings-4-line" className="me-1" />
                      {secondaryLabel}
                    </Link>
                  ) : null}
                  {tertiaryLabel && tertiaryUrl ? (
                    <Link href={tertiaryUrl} className="btn btn-outline-secondary">
                      <IconifyIcon icon="ri:file-chart-line" className="me-1" />
                      {tertiaryLabel}
                    </Link>
                  ) : null}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h6 className="mb-3">Workspace rule</h6>
                <ul className="mb-0 text-muted ps-3">
                  <li>Run notification operations in one shared workspace.</li>
                  <li>Keep provider setup and delivery rules in Settings.</li>
                  <li>Filter by channel inside the workspace instead of splitting menus.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </ComponentContainerCard>
    </>
  );
};

export default WorkspaceRelocationNotice;
