'use client';

import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Nav, Row, Spinner, Table } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { useListAgencies } from '@/hooks/useAgencies';
import { useListCommunities } from '@/hooks/useCommunities';
import {
  PaymentChargePreview,
  PaymentChargeTargetInput,
  PaymentChargeTemplate,
  PaymentChargeTemplateInput,
  useCreatePaymentChargeTemplate,
  useIssuePaymentChargeTemplate,
  usePaymentChargeCatalog,
  usePaymentChargeRun,
  usePaymentChargeRuns,
  usePaymentChargeTemplates,
  usePreviewPaymentChargeTemplate,
  useRunDuePaymentCharges,
  useUpdatePaymentChargeTemplate,
} from '@/hooks/usePaymentCharges';

type ChargeScope = 'agency' | 'community';
type ChargeType = 'fixed' | 'variable' | 'formula';
type ChargeFrequency = 'monthly' | 'quarterly' | 'yearly' | 'one_time' | 'custom_period';
type LateFeeType = 'none' | 'fixed' | 'percentage';
type TargetType =
  | 'all_units'
  | 'unit_ids'
  | 'blocks'
  | 'unit_types'
  | 'occupied_only'
  | 'owner_only'
  | 'tenant_only'
  | 'exclude_unit_ids';

const DEFAULT_TARGET: PaymentChargeTargetInput = {
  target_type: 'all_units',
  target_value: '',
};

const EMPTY_TEMPLATE_FORM: PaymentChargeTemplateInput = {
  scope_level: 'community',
  agency_id: null,
  community_id: null,
  name: '',
  charge_code: '',
  catalog_key: 'hoa_dues',
  category: 'HOA Dues',
  charge_type: 'fixed',
  amount: 0,
  currency_code: 'GHS',
  billing_frequency: 'monthly',
  billing_anchor_day: 1,
  billing_anchor_month: null,
  start_date: null,
  due_offset_days: 0,
  grace_period_days: 0,
  late_fee_type: 'none',
  late_fee_value: 0,
  auto_issue: false,
  requires_approval: false,
  is_active: true,
  description: '',
  metadata: {},
  targets: [DEFAULT_TARGET],
};

const EMPTY_PREVIEW_FORM = {
  templateId: '',
  community_id: '',
  billing_period_start: '',
  billing_period_end: '',
  due_date: '',
  run_mode: 'manual' as const,
};

type PreviewForm = {
  templateId: string;
  community_id: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  run_mode: 'manual' | 'scheduled';
};

const targetTypeNeedsValue = (targetType: TargetType) =>
  !['all_units', 'occupied_only', 'owner_only', 'tenant_only'].includes(targetType);

const serializeTargetValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    if (!Object.keys(objectValue).length) {
      return '';
    }
    return JSON.stringify(objectValue);
  }

  return typeof value === 'string' ? value : '';
};

const normalizeTargetsForSubmit = (targets: PaymentChargeTargetInput[]) =>
  targets.map((target) => ({
    target_type: target.target_type,
    target_value: targetTypeNeedsValue(target.target_type)
      ? typeof target.target_value === 'string'
        ? target.target_value.trim()
        : target.target_value
      : undefined,
  }));

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const getRunBadgeVariant = (status: string) => {
  if (status === 'issued') return 'success';
  if (status === 'cancelled') return 'secondary';
  return 'warning';
};

const getObligationBadgeVariant = (status: string) => {
  if (status === 'paid') return 'success';
  if (status === 'overdue') return 'danger';
  if (status === 'cancelled') return 'secondary';
  return 'warning';
};

const PaymentChargesPage = () => {
  const [workspaceTab, setWorkspaceTab] = useState<'templates' | 'issue' | 'issued' | 'runs'>('templates');
  const [templateForm, setTemplateForm] = useState<PaymentChargeTemplateInput>(EMPTY_TEMPLATE_FORM);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<PreviewForm>(EMPTY_PREVIEW_FORM);
  const [previewData, setPreviewData] = useState<PaymentChargePreview | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ variant: 'success' | 'danger' | 'info'; text: string } | null>(null);

  const catalogQuery = usePaymentChargeCatalog();
  const templatesQuery = usePaymentChargeTemplates({ include_inactive: true });
  const runsQuery = usePaymentChargeRuns();
  const runDetailQuery = usePaymentChargeRun(selectedRunId);
  const agenciesQuery = useListAgencies();
  const communitiesQuery = useListCommunities({ page: 1, pageSize: 200 });

  const createTemplate = useCreatePaymentChargeTemplate();
  const updateTemplate = useUpdatePaymentChargeTemplate();
  const previewTemplate = usePreviewPaymentChargeTemplate();
  const issueTemplate = useIssuePaymentChargeTemplate();
  const runDueTemplates = useRunDuePaymentCharges();

  const catalog = catalogQuery.data || [];
  const templates = templatesQuery.data || [];
  const runs = runsQuery.data || [];
  const agencies = agenciesQuery.data || [];
  const communities = communitiesQuery.data?.data || [];

  const selectedCatalogItem = useMemo(
    () => catalog.find((item) => item.key === templateForm.catalog_key) || null,
    [catalog, templateForm.catalog_key]
  );

  const previewSelectedTemplate = useMemo(
    () => templates.find((item) => item.id === previewForm.templateId) || null,
    [templates, previewForm.templateId]
  );

  const scopedCommunities = useMemo(() => {
    if (templateForm.scope_level !== 'agency' || !templateForm.agency_id) {
      return communities;
    }

    return communities.filter((community: Record<string, any>) => community.agency_id === templateForm.agency_id);
  }, [communities, templateForm.agency_id, templateForm.scope_level]);

  const previewCommunityOptions = useMemo(() => {
    if (!previewSelectedTemplate) {
      return communities;
    }

    if (previewSelectedTemplate.scope_level === 'community') {
      return communities.filter((community: Record<string, any>) => community.id === previewSelectedTemplate.community_id);
    }

    if (previewSelectedTemplate.agency_id) {
      return communities.filter((community: Record<string, any>) => community.agency_id === previewSelectedTemplate.agency_id);
    }

    return communities;
  }, [communities, previewSelectedTemplate]);

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setTemplateForm(EMPTY_TEMPLATE_FORM);
  };

  const setCatalogDefaults = (catalogKey: string) => {
    const catalogItem = catalog.find((item) => item.key === catalogKey);
    if (!catalogItem) return;

    setTemplateForm((current) => ({
      ...current,
      catalog_key: catalogItem.key,
      category: catalogItem.category,
      charge_type: catalogItem.defaultChargeType,
      billing_frequency: catalogItem.defaultFrequency,
      name: editingTemplateId ? current.name : current.name || catalogItem.label,
      description: editingTemplateId ? current.description : current.description || catalogItem.description,
    }));
  };

  const handleTemplateChange = <K extends keyof PaymentChargeTemplateInput>(field: K, value: PaymentChargeTemplateInput[K]) => {
    setTemplateForm((current) => ({ ...current, [field]: value }));
  };

  const handleTargetChange = (index: number, field: keyof PaymentChargeTargetInput, value: string) => {
    setTemplateForm((current) => ({
      ...current,
      targets: (current.targets || []).map((target, targetIndex) => {
        if (targetIndex !== index) return target;
        if (field === 'target_type') {
          return {
            target_type: value as TargetType,
            target_value: targetTypeNeedsValue(value as TargetType) ? target.target_value || '' : '',
          };
        }
        return {
          ...target,
          [field]: value,
        };
      }),
    }));
  };

  const addTarget = () => {
    setTemplateForm((current) => ({
      ...current,
      targets: [...(current.targets || []), DEFAULT_TARGET],
    }));
  };

  const removeTarget = (index: number) => {
    setTemplateForm((current) => {
      const nextTargets = (current.targets || []).filter((_, targetIndex) => targetIndex !== index);
      return {
        ...current,
        targets: nextTargets.length ? nextTargets : [DEFAULT_TARGET],
      };
    });
  };

  const startEdit = (template: PaymentChargeTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      scope_level: template.scope_level,
      agency_id: template.agency_id || template.agency?.id || null,
      community_id: template.community_id || template.community?.id || null,
      name: template.name,
      charge_code: template.charge_code,
      catalog_key: template.catalog_key,
      category: template.category,
      charge_type: template.charge_type,
      amount: Number(template.amount || 0),
      currency_code: template.currency_code || 'GHS',
      billing_frequency: template.billing_frequency,
      billing_anchor_day: template.billing_anchor_day ?? null,
      billing_anchor_month: template.billing_anchor_month ?? null,
      start_date: template.start_date ?? null,
      due_offset_days: template.due_offset_days ?? 0,
      grace_period_days: template.grace_period_days ?? 0,
      late_fee_type: (template.late_fee_type as LateFeeType | null) || 'none',
      late_fee_value: Number(template.late_fee_value || 0),
      auto_issue: Boolean(template.auto_issue),
      requires_approval: Boolean(template.requires_approval),
      is_active: template.is_active ?? true,
      description: template.description || '',
      metadata: (template.metadata as Record<string, unknown>) || {},
      targets:
        template.targets?.length
          ? template.targets.map((target) => ({
              target_type: target.target_type,
              target_value: serializeTargetValue(target.target_value),
            }))
          : [DEFAULT_TARGET],
    });

    setPreviewForm((current) => ({
      ...current,
      templateId: template.id,
      community_id: template.scope_level === 'community' ? template.community_id || template.community?.id || '' : current.community_id,
    }));
    setStatusMessage(null);
  };

  const submitTemplate = async () => {
    setStatusMessage(null);

    const payload: PaymentChargeTemplateInput = {
      ...templateForm,
      agency_id: templateForm.scope_level === 'agency' ? templateForm.agency_id || null : null,
      community_id: templateForm.scope_level === 'community' ? templateForm.community_id || null : null,
      name: templateForm.name.trim(),
      charge_code: templateForm.charge_code.trim(),
      category: templateForm.category.trim(),
      description: templateForm.description?.trim() || null,
      targets: normalizeTargetsForSubmit(templateForm.targets || [DEFAULT_TARGET]),
      amount: Number(templateForm.amount || 0),
      late_fee_value: Number(templateForm.late_fee_value || 0),
      due_offset_days: Number(templateForm.due_offset_days || 0),
      grace_period_days: Number(templateForm.grace_period_days || 0),
      billing_anchor_day:
        templateForm.billing_frequency === 'one_time' && !templateForm.billing_anchor_day
          ? null
          : templateForm.billing_anchor_day,
    };

    if (!payload.name || !payload.charge_code || !payload.catalog_key) {
      setStatusMessage({ variant: 'danger', text: 'Name, charge code, and catalog item are required.' });
      return;
    }

    if (payload.scope_level === 'agency' && !payload.agency_id) {
      setStatusMessage({ variant: 'danger', text: 'Select an agency for agency-scoped charge templates.' });
      return;
    }

    if (payload.scope_level === 'community' && !payload.community_id) {
      setStatusMessage({ variant: 'danger', text: 'Select a community for community-scoped charge templates.' });
      return;
    }

    try {
      if (editingTemplateId) {
        await updateTemplate.mutateAsync({ id: editingTemplateId, input: payload });
        setStatusMessage({ variant: 'success', text: 'Charge template updated.' });
      } else {
        const created = await createTemplate.mutateAsync(payload);
        setPreviewForm((current) => ({
          ...current,
          templateId: created.id,
          community_id: created.scope_level === 'community' ? created.community_id || '' : current.community_id,
        }));
        setStatusMessage({ variant: 'success', text: 'Charge template created.' });
      }
      resetTemplateForm();
    } catch (error: any) {
      setStatusMessage({ variant: 'danger', text: error.message || 'Failed to save charge template.' });
    }
  };

  const handlePreview = async () => {
    if (!previewForm.templateId) {
      setStatusMessage({ variant: 'danger', text: 'Select a charge template to preview.' });
      return;
    }

    setStatusMessage(null);
    try {
      const preview = await previewTemplate.mutateAsync({
        id: previewForm.templateId,
        input: {
          community_id: previewForm.community_id || null,
          billing_period_start: previewForm.billing_period_start || null,
          billing_period_end: previewForm.billing_period_end || null,
          due_date: previewForm.due_date || null,
          run_mode: previewForm.run_mode,
        },
      });
      setPreviewData(preview);
      setStatusMessage({ variant: 'info', text: 'Preview generated. Review the targeted units before issuing.' });
    } catch (error: any) {
      setPreviewData(null);
      setStatusMessage({ variant: 'danger', text: error.message || 'Failed to preview charge issuance.' });
    }
  };

  const handleIssue = async () => {
    if (!previewForm.templateId) {
      setStatusMessage({ variant: 'danger', text: 'Select a charge template to issue.' });
      return;
    }

    setStatusMessage(null);
    try {
      const result = await issueTemplate.mutateAsync({
        id: previewForm.templateId,
        input: {
          community_id: previewForm.community_id || null,
          billing_period_start: previewForm.billing_period_start || null,
          billing_period_end: previewForm.billing_period_end || null,
          due_date: previewForm.due_date || null,
          run_mode: previewForm.run_mode,
        },
      });
      setPreviewData(null);
      if (result?.run?.id) {
        setSelectedRunId(result.run.id as string);
      }
      setStatusMessage({
        variant: 'success',
        text: `Charge run issued. ${result?.obligations_created || 0} obligations created for residents.`,
      });
    } catch (error: any) {
      setStatusMessage({ variant: 'danger', text: error.message || 'Failed to issue charges.' });
    }
  };

  const handleRunDue = async () => {
    setStatusMessage(null);
    try {
      const result = await runDueTemplates.mutateAsync({
        community_id: previewForm.community_id || null,
        agency_id: null,
      });
      setStatusMessage({
        variant: 'success',
        text: `Scheduled billing check complete. ${result.created_runs} charge run(s) created.`,
      });
    } catch (error: any) {
      setStatusMessage({ variant: 'danger', text: error.message || 'Failed to run scheduled charge issuance.' });
    }
  };

  const loading =
    catalogQuery.isLoading ||
    templatesQuery.isLoading ||
    runsQuery.isLoading ||
    agenciesQuery.isLoading ||
    communitiesQuery.isLoading;

  const selectedRunObligations = runDetailQuery.data?.obligations || [];
  const selectedRun = runDetailQuery.data?.run || null;

  return (
    <>
      <PageTitle title="Payments" subName="Create, issue, and govern agency and community-scoped resident charges." />

      {statusMessage && (
        <Alert variant={statusMessage.variant} className="mb-3">
          {statusMessage.text}
        </Alert>
      )}

      <Row className="g-3 mb-3">
        <Col xl={4} md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">Charge Catalog</h5>
                  <p className="text-muted mb-0">Standardized fees, dues, utilities, and special assessments.</p>
                </div>
                <Badge bg="primary">{catalog.length}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">Charge Templates</h5>
                  <p className="text-muted mb-0">Reusable rules scoped by agency or individual community.</p>
                </div>
                <Badge bg="success">{templates.length}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={12}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">Charge Runs</h5>
                  <p className="text-muted mb-0">Manual and scheduled issuance that materializes resident obligations.</p>
                </div>
                <Badge bg="warning" text="dark">
                  {runs.length}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="py-3">
          <Row className="g-3 align-items-center">
            <Col xl={8}>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Badge bg="dark-subtle" text="dark">
                  Billing Workspace
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Agency + Community Scoped
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Currency: GH₵
                </Badge>
                <small className="text-muted">
                  Use templates to generate controlled charge runs, then issue resident obligations into the live payment ledger.
                </small>
              </div>
            </Col>
            <Col xl={4}>
              <Nav
                variant="pills"
                activeKey={workspaceTab}
                onSelect={(eventKey) => setWorkspaceTab((eventKey as typeof workspaceTab) || 'templates')}
                className="justify-content-xl-end gap-2 flex-wrap"
              >
                <Nav.Item>
                  <Nav.Link eventKey="templates">Templates</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="issue">Issue Payments</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="issued">Issued Charges</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="runs">Runs</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Card>
          <Card.Body className="py-5 text-center">
            <Spinner animation="border" />
          </Card.Body>
        </Card>
      ) : (
        <>
          {workspaceTab === 'templates' && (
            <>
              <Row className="g-3 mb-3">
                <Col xl={5}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                      <div>
                        <h5 className="mb-0">{editingTemplateId ? 'Edit Payment Template' : 'Create Payment Template'}</h5>
                        <small className="text-muted">Define fixed or variable dues, utility bills, and service charges.</small>
                      </div>
                      {editingTemplateId && (
                        <Button variant="outline-secondary" size="sm" onClick={resetTemplateForm}>
                          Cancel Edit
                        </Button>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Scope</Form.Label>
                            <Form.Select
                              value={templateForm.scope_level}
                              onChange={(event) => handleTemplateChange('scope_level', event.target.value as ChargeScope)}
                            >
                              <option value="community">Community Scoped</option>
                              <option value="agency">Agency Scoped</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Catalog Item</Form.Label>
                            <Form.Select value={templateForm.catalog_key} onChange={(event) => setCatalogDefaults(event.target.value)}>
                              {catalog.map((item) => (
                                <option key={item.key} value={item.key}>
                                  {item.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        {templateForm.scope_level === 'agency' ? (
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Agency</Form.Label>
                              <Form.Select
                                value={templateForm.agency_id || ''}
                                onChange={(event) => handleTemplateChange('agency_id', event.target.value || null)}
                              >
                                <option value="">Select agency</option>
                                {agencies.map((agency) => (
                                  <option key={agency.id} value={agency.id}>
                                    {agency.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        ) : (
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Community</Form.Label>
                              <Form.Select
                                value={templateForm.community_id || ''}
                                onChange={(event) => handleTemplateChange('community_id', event.target.value || null)}
                              >
                                <option value="">Select community</option>
                                {scopedCommunities.map((community: Record<string, any>) => (
                                  <option key={community.id} value={community.id}>
                                    {community.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        )}

                        <Col md={8}>
                          <Form.Group>
                            <Form.Label>Template Name</Form.Label>
                            <Form.Control
                              value={templateForm.name}
                              onChange={(event) => handleTemplateChange('name', event.target.value)}
                              placeholder="e.g. Monthly Water Bill"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Charge Code</Form.Label>
                            <Form.Control
                              value={templateForm.charge_code}
                              onChange={(event) => handleTemplateChange('charge_code', event.target.value.toUpperCase())}
                              placeholder="WATER-001"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Control value={templateForm.category} onChange={(event) => handleTemplateChange('category', event.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Charge Type</Form.Label>
                            <Form.Select
                              value={templateForm.charge_type}
                              onChange={(event) => handleTemplateChange('charge_type', event.target.value as ChargeType)}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="variable">Variable</option>
                              <option value="formula">Formula</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Amount (GH₵)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={templateForm.amount}
                              onChange={(event) => handleTemplateChange('amount', Number(event.target.value))}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Frequency</Form.Label>
                            <Form.Select
                              value={templateForm.billing_frequency}
                              onChange={(event) => handleTemplateChange('billing_frequency', event.target.value as ChargeFrequency)}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="yearly">Yearly</option>
                              <option value="one_time">One Time</option>
                              <option value="custom_period">Custom Period</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Anchor Day</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              max="31"
                              value={templateForm.billing_anchor_day ?? ''}
                              onChange={(event) =>
                                handleTemplateChange('billing_anchor_day', event.target.value ? Number(event.target.value) : null)
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Due Offset (days)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={templateForm.due_offset_days ?? 0}
                              onChange={(event) => handleTemplateChange('due_offset_days', Number(event.target.value))}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Grace Period (days)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={templateForm.grace_period_days ?? 0}
                              onChange={(event) => handleTemplateChange('grace_period_days', Number(event.target.value))}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={templateForm.start_date || ''}
                              onChange={(event) => handleTemplateChange('start_date', event.target.value || null)}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Late Fee Type</Form.Label>
                            <Form.Select
                              value={templateForm.late_fee_type || 'none'}
                              onChange={(event) => handleTemplateChange('late_fee_type', event.target.value as LateFeeType)}
                            >
                              <option value="none">None</option>
                              <option value="fixed">Fixed</option>
                              <option value="percentage">Percentage</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Late Fee Value</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={templateForm.late_fee_value ?? 0}
                              onChange={(event) => handleTemplateChange('late_fee_value', Number(event.target.value))}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Billing Month</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              max="12"
                              value={templateForm.billing_anchor_month ?? ''}
                              onChange={(event) =>
                                handleTemplateChange('billing_anchor_month', event.target.value ? Number(event.target.value) : null)
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={templateForm.description || ''}
                              onChange={(event) => handleTemplateChange('description', event.target.value)}
                              placeholder={selectedCatalogItem?.description || 'Resident-facing invoice description'}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Check
                            type="switch"
                            id="charge-auto-issue"
                            label="Auto issue"
                            checked={Boolean(templateForm.auto_issue)}
                            onChange={(event) => handleTemplateChange('auto_issue', event.target.checked)}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Check
                            type="switch"
                            id="charge-requires-approval"
                            label="Requires approval"
                            checked={Boolean(templateForm.requires_approval)}
                            onChange={(event) => handleTemplateChange('requires_approval', event.target.checked)}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Check
                            type="switch"
                            id="charge-is-active"
                            label="Active"
                            checked={Boolean(templateForm.is_active)}
                            onChange={(event) => handleTemplateChange('is_active', event.target.checked)}
                          />
                        </Col>

                        <Col md={12}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0">Targeting Rules</h6>
                              <small className="text-muted">Apply charges to all units, selected blocks, unit types, or explicit units.</small>
                            </div>
                            <Button variant="outline-primary" size="sm" onClick={addTarget}>
                              Add Target
                            </Button>
                          </div>

                          {(templateForm.targets || []).map((target, index) => (
                            <Row className="g-2 align-items-end mb-2" key={`${target.target_type}-${index}`}>
                              <Col md={4}>
                                <Form.Label className="small text-muted">Target Type</Form.Label>
                                <Form.Select
                                  value={target.target_type}
                                  onChange={(event) => handleTargetChange(index, 'target_type', event.target.value)}
                                >
                                  <option value="all_units">All Units</option>
                                  <option value="occupied_only">Occupied Only</option>
                                  <option value="owner_only">Owner Only</option>
                                  <option value="tenant_only">Tenant Only</option>
                                  <option value="blocks">Blocks</option>
                                  <option value="unit_types">Unit Types</option>
                                  <option value="unit_ids">Specific Unit IDs</option>
                                  <option value="exclude_unit_ids">Exclude Unit IDs</option>
                                </Form.Select>
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small text-muted">Target Value</Form.Label>
                                <Form.Control
                                  value={typeof target.target_value === 'string' ? target.target_value : ''}
                                  onChange={(event) => handleTargetChange(index, 'target_value', event.target.value)}
                                  placeholder={targetTypeNeedsValue(target.target_type) ? 'Comma-separated values or JSON' : 'Not required'}
                                  disabled={!targetTypeNeedsValue(target.target_type)}
                                />
                              </Col>
                              <Col md={2}>
                                <Button variant="outline-danger" className="w-100" onClick={() => removeTarget(index)}>
                                  Remove
                                </Button>
                              </Col>
                            </Row>
                          ))}
                        </Col>

                        <Col md={12} className="d-flex gap-2 justify-content-end">
                          <Button variant="primary" onClick={submitTemplate} disabled={createTemplate.isPending || updateTemplate.isPending}>
                            {createTemplate.isPending || updateTemplate.isPending
                              ? 'Saving...'
                              : editingTemplateId
                                ? 'Update Template'
                                : 'Create Template'}
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={7}>
                  <Row className="g-3">
                    <Col xs={12}>
                      <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Template Library</h5>
                          <small className="text-muted">Use the seeded catalog to keep charges consistent across agencies and communities.</small>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div className="table-responsive" style={{ maxHeight: 280 }}>
                            <Table hover className="align-middle mb-0">
                              <thead>
                                <tr>
                                  <th>Charge</th>
                                  <th>Category</th>
                                  <th>Defaults</th>
                                </tr>
                              </thead>
                              <tbody>
                                {catalog.map((item) => (
                                  <tr key={item.key}>
                                    <td>
                                      <div className="fw-semibold">{item.label}</div>
                                      <small className="text-muted">{item.description}</small>
                                    </td>
                                    <td>{item.category}</td>
                                    <td>
                                      <div className="text-capitalize">{item.defaultChargeType}</div>
                                      <small className="text-muted text-capitalize">{item.defaultFrequency.replace('_', ' ')}</small>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12}>
                      <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Existing Payment Templates</h5>
                          <small className="text-muted">Reusable templates for recurring dues, bills, fees, and special assessments.</small>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div className="table-responsive" style={{ maxHeight: 420 }}>
                            <Table hover className="align-middle mb-0">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Scope</th>
                                  <th>Amount</th>
                                  <th>Frequency</th>
                                  <th>Status</th>
                                  <th className="text-end">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {templates.map((template) => (
                                  <tr key={template.id}>
                                    <td>
                                      <div className="fw-semibold">{template.name}</div>
                                      <small className="text-muted">{template.category}</small>
                                    </td>
                                    <td>
                                      <div className="text-capitalize">{template.scope_level}</div>
                                      <small className="text-muted">{template.community?.name || template.agency?.name || '—'}</small>
                                    </td>
                                    <td>{template.amount_formatted || `GH₵ ${Number(template.amount || 0).toFixed(2)}`}</td>
                                    <td className="text-capitalize">{template.billing_frequency.replace('_', ' ')}</td>
                                    <td>
                                      {template.is_active ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                                    </td>
                                    <td className="text-end">
                                      <div className="d-flex justify-content-end gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={() => startEdit(template)}>
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          onClick={() => {
                                            setWorkspaceTab('issue');
                                            setPreviewForm((current) => ({
                                              ...current,
                                              templateId: template.id,
                                              community_id:
                                                template.scope_level === 'community' ? template.community_id || '' : current.community_id,
                                            }));
                                            setStatusMessage({ variant: 'info', text: `Template ready to preview: ${template.name}.` });
                                          }}
                                        >
                                          Prepare Run
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </>
          )}

          {workspaceTab === 'issue' && (
            <Row className="g-3">
              <Col xl={7}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Issue Payments</h5>
                    <small className="text-muted">Preview the affected residents, invoice totals, and period before publishing obligations.</small>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Payment Template</Form.Label>
                          <Form.Select
                            value={previewForm.templateId}
                            onChange={(event) =>
                              setPreviewForm((current) => ({
                                ...current,
                                templateId: event.target.value,
                                community_id: '',
                              }))
                            }
                          >
                            <option value="">Select template</option>
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Issue Community</Form.Label>
                          <Form.Select
                            value={previewForm.community_id}
                            onChange={(event) => setPreviewForm((current) => ({ ...current, community_id: event.target.value }))}
                            disabled={previewSelectedTemplate?.scope_level === 'community'}
                          >
                            <option value="">Use template scope</option>
                            {previewCommunityOptions.map((community: Record<string, any>) => (
                              <option key={community.id} value={community.id}>
                                {community.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Period Start</Form.Label>
                          <Form.Control
                            type="date"
                            value={previewForm.billing_period_start}
                            onChange={(event) => setPreviewForm((current) => ({ ...current, billing_period_start: event.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Period End</Form.Label>
                          <Form.Control
                            type="date"
                            value={previewForm.billing_period_end}
                            onChange={(event) => setPreviewForm((current) => ({ ...current, billing_period_end: event.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Due Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={previewForm.due_date}
                            onChange={(event) => setPreviewForm((current) => ({ ...current, due_date: event.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Run Mode</Form.Label>
                          <Form.Select
                            value={previewForm.run_mode}
                            onChange={(event) =>
                              setPreviewForm((current) => ({
                                ...current,
                                run_mode: event.target.value as 'manual' | 'scheduled',
                              }))
                            }
                          >
                            <option value="manual">Manual Issue</option>
                            <option value="scheduled">Scheduled Issue</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="d-flex align-items-end gap-2 justify-content-end">
                        <Button variant="outline-secondary" onClick={handlePreview} disabled={previewTemplate.isPending}>
                          {previewTemplate.isPending ? 'Previewing...' : 'Preview'}
                        </Button>
                        <Button variant="primary" onClick={handleIssue} disabled={issueTemplate.isPending}>
                          {issueTemplate.isPending ? 'Issuing...' : 'Issue Charges'}
                        </Button>
                      </Col>
                    </Row>

                    {previewData ? (
                      <Card className="mt-4 border">
                        <Card.Body>
                          <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                            <div>
                              <h6 className="mb-1">{previewData.template.name}</h6>
                              <small className="text-muted">{previewData.community.name}</small>
                            </div>
                            <div className="text-end">
                              <div className="fw-semibold">{previewData.summary.total_amount_formatted}</div>
                              <small className="text-muted">{previewData.summary.units_to_issue} unit(s) ready to issue</small>
                            </div>
                          </div>
                          <Row className="g-3 mb-3">
                            <Col md={4}>
                              <div className="border rounded p-2">
                                <div className="small text-muted">Billing Period</div>
                                <div>
                                  {formatDate(previewData.billing_period_start)} - {formatDate(previewData.billing_period_end)}
                                </div>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="border rounded p-2">
                                <div className="small text-muted">Due Date</div>
                                <div>{formatDate(previewData.due_date)}</div>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="border rounded p-2">
                                <div className="small text-muted">Existing Obligations</div>
                                <div>{previewData.summary.existing_obligations}</div>
                              </div>
                            </Col>
                          </Row>
                          <div className="table-responsive" style={{ maxHeight: 320 }}>
                            <Table hover className="align-middle mb-0">
                              <thead>
                                <tr>
                                  <th>Unit</th>
                                  <th>Amount</th>
                                  <th>Invoice</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {previewData.items.map((item) => (
                                  <tr key={`${item.unit_id}-${item.invoice_number}`}>
                                    <td>
                                      <div className="fw-semibold">{item.unit_label}</div>
                                      <small className="text-muted">{item.unit_type || 'Standard unit'}</small>
                                    </td>
                                    <td>{item.amount_formatted}</td>
                                    <td className="font-monospace small">{item.invoice_number}</td>
                                    <td>
                                      {item.existing_obligation_id ? <Badge bg="secondary">Already Issued</Badge> : <Badge bg="success">Ready</Badge>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    ) : (
                      <Alert variant="light" className="mt-4 mb-0">
                        Preview a charge run to validate targeting, invoice count, and total issue amount before publishing.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col xl={5}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">Automation</h5>
                      <small className="text-muted">Run due templates manually or hand them off to the internal cron endpoint.</small>
                    </div>
                    <Button variant="outline-primary" onClick={handleRunDue} disabled={runDueTemplates.isPending}>
                      {runDueTemplates.isPending ? 'Running...' : 'Run Due Auto-Issue'}
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <div className="border rounded p-3 mb-3">
                      <div className="fw-semibold mb-1">Production Trigger</div>
                      <div className="small text-muted">
                        POST <span className="font-monospace">/internal/payment-charges/run-due</span> with
                        <span className="font-monospace"> x-payment-charge-cron-key</span> for scheduled issuance.
                      </div>
                    </div>
                    <div className="border rounded p-3">
                      <div className="fw-semibold mb-1">Operational Rule</div>
                      <div className="small text-muted">
                        Always preview before issuing manual runs. Scheduled runs should only be enabled for templates with stable targeting and approved fee logic.
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {workspaceTab === 'issued' && (
            <Row className="g-3">
              <Col xl={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Issued Charge Runs</h5>
                    <small className="text-muted">Select a run to inspect the resident obligations and invoice records it created.</small>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: 520 }}>
                      <Table hover className="align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Template</th>
                            <th>Community</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th className="text-end">Invoices</th>
                          </tr>
                        </thead>
                        <tbody>
                          {runs.map((run) => {
                            const issuedCount = Number((run.summary_counts as Record<string, unknown> | null)?.issued_obligations || 0);
                            return (
                              <tr
                                key={run.id}
                                role="button"
                                onClick={() => setSelectedRunId(run.id)}
                                style={{ cursor: 'pointer' }}
                                className={selectedRunId === run.id ? 'table-active' : undefined}
                              >
                                <td>
                                  <div className="fw-semibold">{run.template?.name || 'Charge Run'}</div>
                                  <small className="text-muted">{run.template?.charge_code || run.id}</small>
                                </td>
                                <td>{run.community?.name || '—'}</td>
                                <td>{formatDate(run.due_date)}</td>
                                <td>
                                  <Badge bg={getRunBadgeVariant(run.status)}>{run.status}</Badge>
                                </td>
                                <td className="text-end">{issuedCount}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xl={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Issued Invoices</h5>
                    <small className="text-muted">Resident-facing obligations generated by the selected charge run.</small>
                  </Card.Header>
                  <Card.Body>
                    {!selectedRunId ? (
                      <Alert variant="light" className="mb-0">
                        Select a charge run to inspect the linked obligations and invoice numbers.
                      </Alert>
                    ) : runDetailQuery.isLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" />
                      </div>
                    ) : runDetailQuery.error ? (
                      <Alert variant="danger" className="mb-0">
                        {(runDetailQuery.error as Error).message}
                      </Alert>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between flex-wrap gap-3 mb-3">
                          <div>
                            <div className="fw-semibold">{selectedRun?.template?.name || 'Charge Run'}</div>
                            <small className="text-muted">{selectedRun?.community?.name || 'Community'}</small>
                          </div>
                          <div className="text-end">
                            <div className="fw-semibold">
                              {(selectedRunObligations.length || 0).toLocaleString()} invoice(s)
                            </div>
                            <small className="text-muted">Billing period records</small>
                          </div>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: 420 }}>
                          <Table hover className="align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Invoice</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th className="text-end">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedRunObligations.map((obligation: Record<string, any>) => (
                                <tr key={obligation.id}>
                                  <td className="font-monospace small">{obligation.invoice_number || '—'}</td>
                                  <td>
                                    <div className="fw-semibold">{obligation.title}</div>
                                    <small className="text-muted">{obligation.category}</small>
                                  </td>
                                  <td>
                                    <Badge bg={getObligationBadgeVariant(obligation.status)}>{obligation.status}</Badge>
                                  </td>
                                  <td className="text-end">GH₵ {Number(obligation.amount || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {workspaceTab === 'runs' && (
            <>
              <Row className="g-3 mb-3">
                <Col xl={4} md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="small text-muted">Issued Runs</div>
                      <div className="fs-3 fw-semibold">{runs.length}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xl={4} md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="small text-muted">Selected Run Status</div>
                      <div className="fs-5 fw-semibold text-capitalize">{selectedRun?.status || 'Not selected'}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xl={4} md={12}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="small text-muted">Automation</div>
                        <div className="fw-semibold">Run due templates on demand</div>
                      </div>
                      <Button variant="outline-primary" onClick={handleRunDue} disabled={runDueTemplates.isPending}>
                        {runDueTemplates.isPending ? 'Running...' : 'Run Due'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col xl={7}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Run History</h5>
                      <small className="text-muted">Operational history for manual and scheduled payment issuance.</small>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive" style={{ maxHeight: 420 }}>
                        <Table hover className="align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Template</th>
                              <th>Community</th>
                              <th>Period</th>
                              <th>Status</th>
                              <th className="text-end">Issued</th>
                            </tr>
                          </thead>
                          <tbody>
                            {runs.map((run) => {
                              const issuedCount = Number((run.summary_counts as Record<string, unknown> | null)?.issued_obligations || 0);
                              return (
                                <tr
                                  key={run.id}
                                  role="button"
                                  onClick={() => setSelectedRunId(run.id)}
                                  style={{ cursor: 'pointer' }}
                                  className={selectedRunId === run.id ? 'table-active' : undefined}
                                >
                                  <td>
                                    <div className="fw-semibold">{run.template?.name || 'Charge Run'}</div>
                                    <small className="text-muted">{run.run_mode}</small>
                                  </td>
                                  <td>{run.community?.name || '—'}</td>
                                  <td>
                                    <div>{formatDate(run.billing_period_start)}</div>
                                    <small className="text-muted">{formatDate(run.billing_period_end)}</small>
                                  </td>
                                  <td>
                                    <Badge bg={getRunBadgeVariant(run.status)}>{run.status}</Badge>
                                  </td>
                                  <td className="text-end">{issuedCount}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={5}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Run Summary</h5>
                      <small className="text-muted">Operational context for the selected billing run.</small>
                    </Card.Header>
                    <Card.Body>
                      {!selectedRunId ? (
                        <Alert variant="light" className="mb-0">
                          Select a run to inspect the billing period, due date, and issuance totals.
                        </Alert>
                      ) : runDetailQuery.isLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" />
                        </div>
                      ) : runDetailQuery.error ? (
                        <Alert variant="danger" className="mb-0">
                          {(runDetailQuery.error as Error).message}
                        </Alert>
                      ) : (
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="border rounded p-3 h-100">
                              <div className="small text-muted">Due Date</div>
                              <div className="fw-semibold">{formatDate(selectedRun?.due_date)}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="border rounded p-3 h-100">
                              <div className="small text-muted">Status</div>
                              <div className="fw-semibold text-capitalize">{selectedRun?.status || '—'}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="border rounded p-3 h-100">
                              <div className="small text-muted">Billing Period Start</div>
                              <div className="fw-semibold">{formatDate(selectedRun?.billing_period_start)}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="border rounded p-3 h-100">
                              <div className="small text-muted">Billing Period End</div>
                              <div className="fw-semibold">{formatDate(selectedRun?.billing_period_end)}</div>
                            </div>
                          </Col>
                          <Col md={12}>
                            <div className="border rounded p-3">
                              <div className="small text-muted">Issued Obligations</div>
                              <div className="fw-semibold">
                                {Number((selectedRun?.summary_counts as Record<string, unknown> | null)?.issued_obligations || 0).toLocaleString()}
                              </div>
                              <small className="text-muted">
                                Total issue amount:{' '}
                                {typeof (selectedRun?.summary_amounts as Record<string, unknown> | null)?.total_amount === 'number'
                                  ? `GH₵ ${Number((selectedRun?.summary_amounts as Record<string, unknown>).total_amount || 0).toFixed(2)}`
                                  : '—'}
                              </small>
                            </div>
                          </Col>
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </>
      )}
    </>
  );
};

export default PaymentChargesPage;
