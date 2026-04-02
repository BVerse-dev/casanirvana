"use client";

import React from 'react';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import type { AdminPersonalHubCatalogProvider } from '@/hooks/useAdminPersonalHubCatalog';
import usePaymentGatewaySettings from '@/hooks/usePaymentGatewaySettings';
import { useExpressPayGatewayConfig } from '@/hooks/useExpressPayGatewayConfig';

type SyncFeedback = {
  variant: 'success' | 'danger';
  message: string;
} | null;

type AvailabilityAlert = {
  variant: 'info' | 'warning' | 'danger' | 'success';
  message: string;
} | null;

type ExpressPayCatalogSyncNoticeProps = {
  description: string;
  secondaryNote?: string;
  providers: AdminPersonalHubCatalogProvider[];
  isSyncing: boolean;
  onSync: () => Promise<void> | void;
  feedback?: SyncFeedback;
  availabilityAlert?: AvailabilityAlert;
};

const formatLastSyncedAt = (value: string | null) => {
  if (!value) {
    return 'Not yet synced';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const ExpressPayCatalogSyncNotice = ({
  description,
  secondaryNote,
  providers,
  isSyncing,
  onSync,
  feedback = null,
  availabilityAlert = null,
}: ExpressPayCatalogSyncNoticeProps) => {
  const enabledCount = providers.filter((provider) => provider.is_active && provider.is_enabled_for_app).length;
  const { paymentGatewaySettings } = usePaymentGatewaySettings();
  const expressPayMode = paymentGatewaySettings?.expresspay_mode === 'live' ? 'live' : 'test';
  const { data: expressPayConfig } = useExpressPayGatewayConfig(expressPayMode, 'global');
  const billPayReady = Boolean(
    expressPayConfig?.billpay_username_configured && expressPayConfig?.billpay_auth_token_configured
  );
  const lastSyncedAt = providers.reduce<string | null>((latest, provider) => {
    if (!provider.last_synced_at) {
      return latest;
    }

    if (!latest) {
      return provider.last_synced_at;
    }

    return new Date(provider.last_synced_at) > new Date(latest) ? provider.last_synced_at : latest;
  }, null);

  return (
    <>
      <Card className="mb-3 border-info-subtle">
        <Card.Body className="d-flex flex-column flex-xl-row align-items-xl-center gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <IconifyIcon icon="ri:links-line" className="fs-20 text-info" />
              <h5 className="mb-0">ExpressPay Catalog Control</h5>
            </div>
            <p className="text-muted mb-2">{description}</p>
            {secondaryNote ? <p className="text-muted small mb-2">{secondaryNote}</p> : null}
            <div className="d-flex flex-wrap gap-3 small text-muted">
              <span>
                Cached providers: <strong className="text-dark">{providers.length}</strong>
              </span>
              <span>
                Enabled in app: <strong className="text-dark">{enabledCount}</strong>
              </span>
              <span>
                Last sync: <strong className="text-dark">{formatLastSyncedAt(lastSyncedAt)}</strong>
              </span>
              <span>
                BillPay readiness:{' '}
                <strong className={billPayReady ? 'text-success' : 'text-warning'}>
                  {billPayReady ? 'Configured' : 'Missing credentials'}
                </strong>
              </span>
            </div>
          </div>

          <Button variant="primary" onClick={() => void onSync()} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Syncing...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:refresh-line" className="me-1" />
                Sync ExpressPay Catalog
              </>
            )}
          </Button>
        </Card.Body>
      </Card>

      {!billPayReady ? (
        <Alert variant="warning">
          ExpressPay catalog sync is available, but provider-side BillPay fulfillment is not ready for the active{' '}
          <strong>{expressPayMode}</strong> mode. Airtime, data, bill, insurance, and transfer purchases can take
          payment without completing downstream delivery until BillPay credentials are configured and tested in
          Payment Gateway settings.
        </Alert>
      ) : null}

      {feedback ? <Alert variant={feedback.variant}>{feedback.message}</Alert> : null}
      {availabilityAlert ? <Alert variant={availabilityAlert.variant}>{availabilityAlert.message}</Alert> : null}
    </>
  );
};

export default ExpressPayCatalogSyncNotice;
