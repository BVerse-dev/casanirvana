import Link from 'next/link';
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

type SettingsRelocationNoticeProps = {
  title: string;
  subName: string;
  scopeLabel: string;
  scopeVariant?: string;
  reason: string;
  destinationLabel: string;
  destinationUrl: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
};

const SettingsRelocationNotice = ({
  title,
  subName,
  scopeLabel,
  scopeVariant = 'primary',
  reason,
  destinationLabel,
  destinationUrl,
  secondaryLabel,
  secondaryUrl,
}: SettingsRelocationNoticeProps) => {
  return (
    <>
      <PageTitle title={title} subName={subName} />

      <ComponentContainerCard id="settings-relocation-notice" title={title}>
        <Alert variant="info" className="d-flex align-items-start gap-3 mb-4">
          <IconifyIcon icon="ri:information-line" className="fs-20 mt-1" />
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <strong>This page has moved out of Settings.</strong>
              <Badge bg={scopeVariant}>{scopeLabel}</Badge>
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
                  Operational lists, dashboards, and entity management now live under their primary modules. Settings only keeps the configuration that changes how those modules behave.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href={destinationUrl} className="btn btn-primary">
                    <IconifyIcon icon="ri:arrow-right-line" className="me-1" />
                    {destinationLabel}
                  </Link>
                  {secondaryLabel && secondaryUrl ? (
                    <Link href={secondaryUrl} className="btn btn-outline-secondary">
                      <IconifyIcon icon="ri:settings-4-line" className="me-1" />
                      {secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h6 className="mb-3">Settings rule</h6>
                <ul className="mb-0 text-muted ps-3">
                  <li>Keep configuration in Settings.</li>
                  <li>Manage entities and workflows in their modules.</li>
                  <li>Use one source of truth for each operational surface.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </ComponentContainerCard>
    </>
  );
};

export default SettingsRelocationNotice;
