"use client";

import React from 'react';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import type { AdminPersonalHubCatalogProvider } from '@/hooks/useAdminPersonalHubCatalog';

type SyncFeedback = {
  variant: 'success' | 'danger';
  message: string;
} | null;

type ExpressPayCatalogSyncNoticeProps = {
  description: string;
  secondaryNote?: string;
  providers: AdminPersonalHubCatalogProvider[];
  isSyncing: boolean;
  onSync: () => Promise<void> | void;
  feedback?: SyncFeedback;
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
}: ExpressPayCatalogSyncNoticeProps) => {
  const enabledCount = providers.filter((provider) => provider.is_active && provider.is_enabled_for_app).length;
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

      {feedback ? <Alert variant={feedback.variant}>{feedback.message}</Alert> : null}
    </>
  );
};

export default ExpressPayCatalogSyncNotice;
