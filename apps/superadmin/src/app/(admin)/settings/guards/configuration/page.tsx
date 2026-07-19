'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ProgressBar, Row, Tab, Tabs } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useSettingsCategory } from '@/hooks/useSettingsCategory';

type GuardConfiguration = {
  defaultShiftHours: number;
  maxOvertimeHours: number;
  splitShiftsAllowed: boolean;
  maxCommunityAssignments: number;
  supervisorApprovalRequired: boolean;
  assignmentRotationDays: number;
  onboardingTrainingDays: number;
  refresherTrainingMonths: number;
  certificationRequired: boolean;
  equipmentCheckInRequired: boolean;
  mandatoryRadioCheck: boolean;
  incidentReportWindowHours: number;
};

const defaults: GuardConfiguration = {
  defaultShiftHours: 8,
  maxOvertimeHours: 4,
  splitShiftsAllowed: false,
  maxCommunityAssignments: 2,
  supervisorApprovalRequired: true,
  assignmentRotationDays: 30,
  onboardingTrainingDays: 5,
  refresherTrainingMonths: 6,
  certificationRequired: true,
  equipmentCheckInRequired: true,
  mandatoryRadioCheck: true,
  incidentReportWindowHours: 2,
};

const GuardConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [formState, setFormState] = useState<GuardConfiguration>(defaults);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    saveSettings,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<GuardConfiguration>({
    queryKey: ['system_settings', 'guards', 'configuration'],
    category: 'guards',
    subcategory: 'configuration',
    defaults,
  });

  useEffect(() => {
    if (data) {
      setFormState(data);
    }
  }, [data]);

  useEffect(() => {
    if (saveSuccess) {
      setSaveMessage('Guard configuration saved successfully.');
      const timeout = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [saveSuccess]);

  const completion = useMemo(() => {
    let completed = 0;
    if (formState.defaultShiftHours > 0) completed++;
    if (formState.maxCommunityAssignments > 0) completed++;
    if (formState.onboardingTrainingDays > 0) completed++;
    if (formState.equipmentCheckInRequired) completed++;
    return Math.round((completed / 4) * 100);
  }, [formState]);

  const updateField = <K extends keyof GuardConfiguration>(key: K, value: GuardConfiguration[K]) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(formState);
  };

  return (
    <>
      <PageTitle title="Guard Configuration" subName="Configure shift rules, assignments, training, and equipment policies" />

      {saveMessage ? (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          {saveMessage}
        </Alert>
      ) : null}

      {saveError ? (
        <Alert variant="danger" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          {saveError instanceof Error ? saveError.message : 'Failed to save guard configuration.'}
        </Alert>
      ) : null}

      <ComponentContainerCard id="guard-configuration" title="Guard Configuration">
        {error ? (
          <Alert variant="danger">{error instanceof Error ? error.message : 'Failed to load guard configuration.'}</Alert>
        ) : null}

        <Row className="mb-4 g-3">
          <Col xl={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="mb-1">Configuration Readiness</h5>
                    <p className="text-muted mb-0">Tenant-level operational defaults</p>
                  </div>
                  <Badge bg="primary">Global</Badge>
                </div>
                <ProgressBar now={completion} label={`${completion}%`} className="mb-3" />
                <small className="text-muted">These settings control how guard operations behave across the platform.</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex flex-wrap gap-2 text-muted small">
                  <span><IconifyIcon icon="ri:time-line" className="me-1" /> Shift defaults</span>
                  <span><IconifyIcon icon="ri:route-line" className="me-1" /> Assignment rules</span>
                  <span><IconifyIcon icon="ri:book-open-line" className="me-1" /> Training requirements</span>
                  <span><IconifyIcon icon="ri:shield-check-line" className="me-1" /> Equipment policies</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'shifts')} className="mb-4">
          <Tab eventKey="shifts" title="Shift Policies">
            <Row className="g-3 mt-1">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Default Shift Hours</Form.Label>
                  <Form.Control type="number" value={formState.defaultShiftHours} onChange={(e) => updateField('defaultShiftHours', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Overtime Hours</Form.Label>
                  <Form.Control type="number" value={formState.maxOvertimeHours} onChange={(e) => updateField('maxOvertimeHours', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Check className="mt-4 pt-2" type="switch" label="Allow Split Shifts" checked={formState.splitShiftsAllowed} onChange={(e) => updateField('splitShiftsAllowed', e.target.checked)} disabled={isLoading} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="assignments" title="Assignment Rules">
            <Row className="g-3 mt-1">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Community Assignments</Form.Label>
                  <Form.Control type="number" value={formState.maxCommunityAssignments} onChange={(e) => updateField('maxCommunityAssignments', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Rotation Interval (Days)</Form.Label>
                  <Form.Control type="number" value={formState.assignmentRotationDays} onChange={(e) => updateField('assignmentRotationDays', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Check className="mt-4 pt-2" type="switch" label="Require Supervisor Approval" checked={formState.supervisorApprovalRequired} onChange={(e) => updateField('supervisorApprovalRequired', e.target.checked)} disabled={isLoading} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="training" title="Training Requirements">
            <Row className="g-3 mt-1">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Onboarding Training (Days)</Form.Label>
                  <Form.Control type="number" value={formState.onboardingTrainingDays} onChange={(e) => updateField('onboardingTrainingDays', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Refresher Interval (Months)</Form.Label>
                  <Form.Control type="number" value={formState.refresherTrainingMonths} onChange={(e) => updateField('refresherTrainingMonths', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Check className="mt-4 pt-2" type="switch" label="Certification Required" checked={formState.certificationRequired} onChange={(e) => updateField('certificationRequired', e.target.checked)} disabled={isLoading} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="equipment" title="Equipment Policies">
            <Row className="g-3 mt-1">
              <Col md={4}>
                <Form.Check type="switch" label="Require Equipment Check-In / Check-Out" checked={formState.equipmentCheckInRequired} onChange={(e) => updateField('equipmentCheckInRequired', e.target.checked)} disabled={isLoading} />
              </Col>
              <Col md={4}>
                <Form.Check type="switch" label="Mandatory Radio Check" checked={formState.mandatoryRadioCheck} onChange={(e) => updateField('mandatoryRadioCheck', e.target.checked)} disabled={isLoading} />
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Incident Report Window (Hours)</Form.Label>
                  <Form.Control type="number" value={formState.incidentReportWindowHours} onChange={(e) => updateField('incidentReportWindowHours', Number(e.target.value) || 0)} disabled={isLoading} />
                </Form.Group>
              </Col>
            </Row>
          </Tab>
        </Tabs>

        <div className="d-flex justify-content-end">
          <Button variant="primary" onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:save-line" className="me-1" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </ComponentContainerCard>
    </>
  );
};

export default GuardConfigurationPage;
