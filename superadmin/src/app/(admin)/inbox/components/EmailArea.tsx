'use client';

import { Alert, Button, CardBody, CardFooter, CardHeader, Placeholder, Spinner } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEmailContext } from '@/context/useEmailContext';
import { useAdminEmail, useUpdateAdminEmail } from '@/hooks/useAdminEmails';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EmailArea = () => {
  const { activeMail } = useEmailContext();
  const { data, isLoading, isError, error } = useAdminEmail(activeMail || null);
  const updateEmailMutation = useUpdateAdminEmail();

  const email = data?.data;

  if (!activeMail) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center text-center p-5">
        <div>
          <IconifyIcon icon="solar:letter-opened-bold-duotone" className="fs-48 text-muted mb-3 d-block" />
          <h4 className="mb-2">Select an email record</h4>
          <p className="text-muted mb-0">Choose an item from the list to inspect its status, routing, and recipient details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Placeholder as="div" animation="glow">
          <Placeholder xs={8} className="mb-3" />
          <Placeholder xs={4} className="mb-4" />
          <Placeholder xs={12} className="mb-2" />
          <Placeholder xs={12} className="mb-2" />
          <Placeholder xs={10} />
        </Placeholder>
      </div>
    );
  }

  if (isError || !email) {
    return (
      <Alert variant="danger" className="m-4">
        {error instanceof Error ? error.message : 'Failed to load the selected email.'}
      </Alert>
    );
  }

  const counterpart = email.folder === 'sent' || email.is_draft
    ? email.recipient?.full_name || email.recipient?.email || 'Unknown recipient'
    : email.sender?.full_name || email.sender?.email || 'System email';

  return (
    <div className="h-100 d-flex flex-column">
      <CardHeader className="border-bottom bg-light-subtle d-flex align-items-start justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <h4 className="mb-0">{email.subject}</h4>
            <span className="badge bg-light text-dark text-uppercase">{email.status || 'unknown'}</span>
            {email.priority ? <span className="badge bg-danger-subtle text-danger text-uppercase">{email.priority}</span> : null}
          </div>
          <div className="text-muted small">
            {email.folder === 'sent' || email.is_draft ? 'To' : 'From'}: {counterpart}
            {email.resolved_community_name ? ` | ${email.resolved_community_name}` : ''}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          <Button
            variant="light"
            size="sm"
            onClick={() => updateEmailMutation.mutate({ id: email.id, updates: { is_starred: !email.is_starred } })}
            disabled={updateEmailMutation.isPending}
          >
            <IconifyIcon icon={email.is_starred ? 'solar:star-bold-duotone' : 'solar:star-line-duotone'} className="me-1" />
            {email.is_starred ? 'Unstar' : 'Star'}
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => updateEmailMutation.mutate({ id: email.id, updates: { is_read: !(email.is_read ?? false) } })}
            disabled={updateEmailMutation.isPending}
          >
            <IconifyIcon icon="solar:letter-bold-duotone" className="me-1" />
            {email.is_read ? 'Mark unread' : 'Mark read'}
          </Button>
          {email.is_draft ? (
            <Button
              size="sm"
              onClick={() => updateEmailMutation.mutate({ id: email.id, updates: { status: 'queued' } })}
              disabled={updateEmailMutation.isPending}
            >
              <IconifyIcon icon="solar:plain-2-bold-duotone" className="me-1" />
              Queue Draft
            </Button>
          ) : null}
          <Button
            variant="light"
            size="sm"
            onClick={() => updateEmailMutation.mutate({ id: email.id, updates: { folder: 'archive' } })}
            disabled={updateEmailMutation.isPending}
          >
            <IconifyIcon icon="solar:archive-bold-duotone" className="me-1" />
            Archive
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => updateEmailMutation.mutate({ id: email.id, updates: { folder: 'deleted' } })}
            disabled={updateEmailMutation.isPending}
          >
            <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="me-1" />
            Move to Trash
          </Button>
        </div>
      </CardHeader>

      <CardBody className="flex-grow-1 overflow-auto">
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Sender</div>
              <div className="fw-semibold">{email.sender?.full_name || email.sender?.email || 'System / unknown'}</div>
              <div className="text-muted small">{email.sender?.email || 'Not available'}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Recipient</div>
              <div className="fw-semibold">{email.recipient?.full_name || email.recipient?.email || 'Not available'}</div>
              <div className="text-muted small">{email.recipient?.email || 'Not available'}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Community</div>
              <div className="fw-semibold">{email.resolved_community_name || 'Global / legacy record'}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Sent At</div>
              <div className="fw-semibold">{formatDateTime(email.sent_at || email.created_at)}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Read At</div>
              <div className="fw-semibold">{formatDateTime(email.read_at)}</div>
            </div>
          </div>
        </div>

        <div className="border rounded p-4 bg-light-subtle">
          <div className="small text-muted text-uppercase mb-2">Message Body</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{email.body}</div>
        </div>

        {email.attachments ? (
          <div className="border rounded p-3 mt-4">
            <div className="fw-semibold mb-2">Attachments</div>
            <pre className="mb-0 small text-muted">{JSON.stringify(email.attachments, null, 2)}</pre>
          </div>
        ) : null}
      </CardBody>

      <CardFooter className="border-top bg-light-subtle d-flex align-items-center justify-content-between gap-3">
        <div className="small text-muted">
          Folder: {email.folder || 'unknown'}
          {' | '}
          Type: {email.email_type || 'unknown'}
        </div>
        {updateEmailMutation.isPending ? (
          <div className="d-flex align-items-center gap-2 small text-muted">
            <Spinner animation="border" size="sm" />
            Updating email record...
          </div>
        ) : null}
      </CardFooter>
    </div>
  );
};

export default EmailArea;
