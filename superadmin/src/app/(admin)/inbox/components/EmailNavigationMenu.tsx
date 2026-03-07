'use client';

import { useMemo, useState } from 'react';
import { Alert, Button, CardBody, Form, ListGroup, Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useEmailContext } from '@/context/useEmailContext';
import { getEmailSummaryOrEmpty, useAdminEmailContacts, useAdminEmails, useCreateAdminEmail } from '@/hooks/useAdminEmails';

const folderItems = [
  { key: 'inbox', label: 'Inbox', icon: 'solar:inbox-bold-duotone', summaryKey: 'inbox' },
  { key: 'sent', label: 'Sent', icon: 'solar:plain-2-bold-duotone', summaryKey: 'sent' },
  { key: 'drafts', label: 'Drafts', icon: 'solar:document-text-bold-duotone', summaryKey: 'drafts' },
  { key: 'starred', label: 'Starred', icon: 'solar:star-bold-duotone', summaryKey: 'starred' },
  { key: 'important', label: 'Important', icon: 'solar:flag-bold-duotone', summaryKey: 'important' },
  { key: 'archive', label: 'Archive', icon: 'solar:archive-bold-duotone', summaryKey: 'archived' },
  { key: 'deleted', label: 'Trash', icon: 'solar:trash-bin-trash-bold-duotone', summaryKey: 'deleted' },
] as const;

const defaultForm = {
  recipient_id: '',
  subject: '',
  body: '',
  priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
};

const EmailNavigationMenu = () => {
  const { activeLabel, changeActiveLabel, composeEmail } = useEmailContext();
  const { data } = useAdminEmails({ folder: 'all', limit: 50 });
  const { data: contactsData, isLoading: contactsLoading } = useAdminEmailContacts();
  const createEmailMutation = useCreateAdminEmail();

  const summary = getEmailSummaryOrEmpty(data?.summary);
  const contacts = contactsData?.data || [];

  const [form, setForm] = useState(defaultForm);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.user_id === form.recipient_id) || null,
    [contacts, form.recipient_id]
  );

  const closeCompose = () => {
    composeEmail.toggle();
    setForm(defaultForm);
    setSubmitError(null);
  };

  const handleSubmit = async (action: 'draft' | 'queue') => {
    setSubmitError(null);

    if (!form.recipient_id || !form.subject.trim() || !form.body.trim()) {
      setSubmitError('Recipient, subject, and message are required.');
      return;
    }

    try {
      await createEmailMutation.mutateAsync({
        recipient_id: form.recipient_id,
        subject: form.subject.trim(),
        body: form.body.trim(),
        priority: form.priority,
        action,
      });
      changeActiveLabel(action === 'draft' ? 'drafts' : 'sent');
      closeCompose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create email record.');
    }
  };

  return (
    <div className="border-end border-light h-100">
      <CardBody>
        <Button className="w-100 d-flex align-items-center justify-content-center gap-2 mb-3" onClick={composeEmail.toggle}>
          <IconifyIcon icon="solar:pen-new-square-bold-duotone" className="fs-18" />
          Compose
        </Button>

        <ListGroup variant="flush" className="mail-nav-list">
          {folderItems.map((item) => {
            const isActive = activeLabel === item.key;
            return (
              <ListGroup.Item
                action
                key={item.key}
                active={isActive}
                onClick={() => changeActiveLabel(item.key)}
                className="border-0 rounded mb-1 d-flex align-items-center justify-content-between"
              >
                <span className="d-flex align-items-center gap-2">
                  <IconifyIcon icon={item.icon} className="fs-18" />
                  <span>{item.label}</span>
                </span>
                <span className={`badge ${isActive ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                  {summary[item.summaryKey]}
                </span>
              </ListGroup.Item>
            );
          })}
        </ListGroup>

        <div className="mt-4 pt-3 border-top">
          <h6 className="text-uppercase text-muted mb-3">Queue Health</h6>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Queued</span>
            <span className="fw-semibold">{summary.queued}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Delivered</span>
            <span className="fw-semibold">{summary.delivered}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Failed</span>
            <span className="fw-semibold text-danger">{summary.failed}</span>
          </div>
        </div>
      </CardBody>

      <Modal show={composeEmail.open} onHide={closeCompose} centered size="lg">
        <ModalHeader closeButton>
          <ModalTitle>Compose Email</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {submitError ? <Alert variant="danger">{submitError}</Alert> : null}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Recipient</Form.Label>
              <Form.Select
                value={form.recipient_id}
                onChange={(event) => setForm((current) => ({ ...current, recipient_id: event.target.value }))}
                disabled={contactsLoading || createEmailMutation.isPending}
              >
                <option value="">Select a recipient</option>
                {contacts.map((contact) => (
                  <option key={contact.profile_id} value={contact.user_id || ''} disabled={!contact.user_id}>
                    {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email}
                    {contact.community_name ? ` - ${contact.community_name}` : ''}
                  </option>
                ))}
              </Form.Select>
              {selectedContact ? (
                <Form.Text className="text-muted">
                  {selectedContact.email}
                  {selectedContact.community_name ? ` | ${selectedContact.community_name}` : ''}
                </Form.Text>
              ) : null}
            </Form.Group>

            <div className="row g-3">
              <div className="col-md-8">
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    disabled={createEmailMutation.isPending}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as typeof form.priority }))}
                    disabled={createEmailMutation.isPending}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-0">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={form.body}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                disabled={createEmailMutation.isPending}
              />
              <Form.Text className="text-muted">
                This workspace currently logs internal platform emails and queues outbound records for delivery workflows.
              </Form.Text>
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" onClick={closeCompose} disabled={createEmailMutation.isPending}>
              Cancel
            </Button>
            <Button variant="outline-primary" onClick={() => handleSubmit('draft')} disabled={createEmailMutation.isPending}>
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit('queue')} disabled={createEmailMutation.isPending}>
              Queue Email
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default EmailNavigationMenu;
