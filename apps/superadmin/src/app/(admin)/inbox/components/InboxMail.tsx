'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, CardBody, Form, Spinner } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEmailContext } from '@/context/useEmailContext';
import { type AdminEmailRecord, useAdminEmails, useUpdateAdminEmail } from '@/hooks/useAdminEmails';

const formatTimeLabel = (value?: string | null) => {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No timestamp';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCounterparty = (email: AdminEmailRecord, folder: string) => {
  if (folder === 'sent' || folder === 'drafts') {
    return email.recipient?.full_name || email.recipient?.email || 'Unknown recipient';
  }
  return email.sender?.full_name || email.sender?.email || 'System email';
};

const InboxMail = () => {
  const { activeMail, changeActiveMail, activeLabel } = useEmailContext();
  const [search, setSearch] = useState('');
  const updateEmailMutation = useUpdateAdminEmail();
  const { data, isLoading, isError, error } = useAdminEmails({
    folder: (activeLabel as any) || 'inbox',
    search,
    limit: 100,
  });

  const emails = data?.data || [];

  useEffect(() => {
    if (!emails.length) {
      if (activeMail) changeActiveMail('');
      return;
    }

    const activeExists = emails.some((email) => email.id === activeMail);
    if (!activeExists) {
      changeActiveMail(emails[0].id);
    }
  }, [activeMail, changeActiveMail, emails]);

  const selectedId = activeMail;
  const orderedEmails = useMemo(() => emails, [emails]);

  const handleSelect = (email: AdminEmailRecord) => {
    changeActiveMail(email.id);
    if (email.is_read === false) {
      updateEmailMutation.mutate({
        id: email.id,
        updates: { is_read: true },
      });
    }
  };

  return (
    <div className="border-end border-light h-100">
      <CardBody className="border-bottom border-light">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:letter-bold-duotone" className="fs-20" />
            Email Records
          </h5>
          <span className="badge bg-light text-dark">{orderedEmails.length}</span>
        </div>
        <Form.Control
          type="search"
          placeholder="Search subject or message"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </CardBody>

      <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto' }}>
        {isLoading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : null}

        {isError ? (
          <Alert variant="danger" className="m-3 mb-0">
            {error instanceof Error ? error.message : 'Failed to load emails.'}
          </Alert>
        ) : null}

        {!isLoading && !orderedEmails.length ? (
          <div className="text-center text-muted py-5 px-3">
            <IconifyIcon icon="solar:letter-opened-bold-duotone" className="fs-36 d-block mb-2" />
            No email records found for this view.
          </div>
        ) : null}

        <ul className="list-unstyled mb-0">
          {orderedEmails.map((email) => {
            const isActive = selectedId === email.id;
            const counterparty = getCounterparty(email, String(activeLabel || 'inbox'));

            return (
              <li key={email.id} className="border-bottom border-light">
                <button
                  type="button"
                  className={`w-100 text-start border-0 bg-transparent p-3 ${isActive ? 'bg-primary-subtle' : ''}`}
                  onClick={() => handleSelect(email)}
                >
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h6 className={`mb-1 text-truncate ${email.is_read === false ? 'fw-bold' : 'fw-semibold'}`}>
                        {counterparty}
                      </h6>
                      <div className="text-muted small text-truncate">{email.subject}</div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div className="small text-muted">{formatTimeLabel(email.sent_at || email.created_at)}</div>
                      {email.priority && ['high', 'urgent'].includes(email.priority) ? (
                        <span className="badge bg-danger-subtle text-danger mt-1 text-uppercase">{email.priority}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="small text-muted text-truncate">{email.body_preview}</div>
                  <div className="d-flex align-items-center gap-2 mt-2 small text-muted">
                    <span className="badge bg-light text-dark text-uppercase">{email.status || 'unknown'}</span>
                    {email.is_starred ? <IconifyIcon icon="solar:star-bold-duotone" className="text-warning" /> : null}
                    {email.resolved_community_name ? <span>{email.resolved_community_name}</span> : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default InboxMail;
