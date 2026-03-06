'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Row, Col, Button, Nav, Tab, Badge, Spinner, Form, Alert } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAdminCapabilities } from '@/hooks/useAdminCapabilities';

interface ModuleSetting {
    id: number;
    slug: string;
    name: string;
    hub_type: string;
    user_type: string;
    status: number;
    description: string | null;
    icon: string | null;
    display_order: number;
    effective_status: number;
    has_override: boolean;
}

interface Community {
    id: string;
    name: string;
}

interface ModulesGrouped {
    community_hub?: ModuleSetting[];
    personal_hub?: ModuleSetting[];
    guard_hub?: ModuleSetting[];
}

const normalizeRoleName = (role?: string | null) =>
    typeof role === 'string' ? role.trim().toLowerCase().replace(/\s+/g, '_') : '';

const ModuleSettingsPage = () => {
    const [activeTab, setActiveTab] = useState<'RESIDENT' | 'GUARD'>('RESIDENT');
    const [modules, setModules] = useState<ModulesGrouped>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [selectedCommunity, setSelectedCommunity] = useState<string>('');
    const { data: capabilities, isLoading: capabilitiesLoading } = useAdminCapabilities();
    const normalizedRole = normalizeRoleName(capabilities?.role);
    const isSuperadmin = normalizedRole === 'superadmin' || normalizedRole === 'super_admin';
    const scopedCommunityIds = capabilities?.scope?.community_ids || [];
    const hasScopedCommunityAccess = scopedCommunityIds.length > 0;

    const fetchModules = useCallback(async () => {
        if (!capabilitiesLoading && !isSuperadmin && !hasScopedCommunityAccess) {
            setModules({});
            setFeedback({
                type: 'warning',
                message: 'No community scope is assigned to this admin account. Module settings are unavailable until a community is assigned.',
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({ user_type: activeTab });
            if (selectedCommunity) {
                params.append('community_id', selectedCommunity);
            }

            const response = await fetch(`/api/module-settings?${params}`);
            const data = await response.json();

            if (data.status === 'success') {
                setModules(data.data.modules);
                setFeedback(null);
            } else {
                setFeedback({ type: 'danger', message: data.message?.[0] || 'Failed to load module settings.' });
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
            setFeedback({ type: 'danger', message: 'Failed to load module settings.' });
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedCommunity, capabilitiesLoading, isSuperadmin, hasScopedCommunityAccess]);

    const fetchCommunities = useCallback(async () => {
        try {
            const response = await fetch('/api/module-settings/communities');
            const data = await response.json();
            if (data.status === 'success') {
                setCommunities(data.data || []);
                if (!isSuperadmin && (data.data || []).length === 0) {
                    setFeedback({
                        type: 'warning',
                        message: 'No scoped communities are available for this admin account.',
                    });
                }
            } else {
                setFeedback({ type: 'warning', message: data.message?.[0] || 'Unable to load communities. Global settings are still available.' });
            }
        } catch (error) {
            console.error('Error fetching communities:', error);
            setFeedback({ type: 'warning', message: 'Unable to load communities. Global settings are still available.' });
        }
    }, [isSuperadmin]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    useEffect(() => {
        fetchCommunities();
    }, [fetchCommunities]);

    useEffect(() => {
        if (isSuperadmin) {
            return;
        }

        if (communities.length === 0) {
            if (selectedCommunity) {
                setSelectedCommunity('');
            }
            return;
        }

        const allowedCommunityIds = new Set(
            (scopedCommunityIds.length > 0 ? communities.filter((community) => scopedCommunityIds.includes(community.id)) : communities)
                .map((community) => community.id)
        );

        if (!selectedCommunity || !allowedCommunityIds.has(selectedCommunity)) {
            const nextCommunityId = communities.find((community) => allowedCommunityIds.has(community.id))?.id || communities[0].id;
            if (nextCommunityId && nextCommunityId !== selectedCommunity) {
                setSelectedCommunity(nextCommunityId);
            }
        }
    }, [communities, isSuperadmin, scopedCommunityIds, selectedCommunity]);

    const toggleModule = async (module: ModuleSetting) => {
        if (!isSuperadmin && !selectedCommunity) {
            setFeedback({
                type: 'warning',
                message: 'Select a scoped community before changing module settings.',
            });
            return;
        }

        setSaving(module.id);
        const newStatus = module.effective_status === 1 ? 0 : 1;

        try {
            const body: { module_id: number; status: number; community_id?: string } = {
                module_id: module.id,
                status: newStatus,
            };

            if (selectedCommunity) {
                body.community_id = selectedCommunity;
            }

            const response = await fetch('/api/module-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (data.status === 'success') {
                setFeedback({
                    type: 'success',
                    message: selectedCommunity
                        ? `Module updated for selected community.`
                        : 'Global module setting updated.',
                });
                await fetchModules();
            } else {
                setFeedback({ type: 'danger', message: data.message?.[0] || 'Failed to update module.' });
            }
        } catch (error) {
            console.error('Error updating module:', error);
            setFeedback({ type: 'danger', message: 'Failed to update module.' });
        } finally {
            setSaving(null);
        }
    };

    const removeOverride = async (module: ModuleSetting) => {
        if (!selectedCommunity || !module.has_override) return;

        setSaving(module.id);
        try {
            const response = await fetch('/api/module-settings', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module_id: module.id,
                    community_id: selectedCommunity,
                }),
            });

            const data = await response.json();
            if (data.status === 'success') {
                setFeedback({ type: 'success', message: 'Community override removed.' });
                await fetchModules();
            } else {
                setFeedback({ type: 'danger', message: data.message?.[0] || 'Failed to remove override.' });
            }
        } catch (error) {
            console.error('Error removing override:', error);
            setFeedback({ type: 'danger', message: 'Failed to remove override.' });
        } finally {
            setSaving(null);
        }
    };

    const renderModuleCard = (module: ModuleSetting) => (
        <Col key={module.id} xl={4} lg={6} md={6} className="mb-3">
            <Card className={`h-100 border ${module.effective_status === 1 ? 'border-success' : 'border-secondary'}`}>
                <CardBody className="p-3">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                            <div
                                className={`d-flex align-items-center justify-content-center rounded-circle ${module.effective_status === 1 ? 'bg-success' : 'bg-secondary'} bg-opacity-10`}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <IconifyIcon
                                    icon={module.icon || 'ri:apps-line'}
                                    className={`${module.effective_status === 1 ? 'text-success' : 'text-secondary'} fs-5`}
                                />
                            </div>
                            <div className="ms-2">
                                <h6 className="mb-0">{module.name}</h6>
                                <small className="text-muted">{module.slug}</small>
                            </div>
                        </div>
                        <Form.Check
                            type="switch"
                            id={`module-${module.id}`}
                            checked={module.effective_status === 1}
                            onChange={() => toggleModule(module)}
                            disabled={saving === module.id}
                            className="fs-5"
                        />
                    </div>

                    {module.description && (
                        <p className="text-muted small mb-2">{module.description}</p>
                    )}

                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            {module.has_override && selectedCommunity && (
                                <Badge bg="warning" className="me-1">Override</Badge>
                            )}
                            <Badge bg={module.effective_status === 1 ? 'success' : 'secondary'}>
                                {module.effective_status === 1 ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                        {saving === module.id && <Spinner animation="border" size="sm" />}
                        {module.has_override && selectedCommunity && (
                            <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => removeOverride(module)}
                                disabled={saving === module.id}
                            >
                                Reset to Global
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
        </Col>
    );

    const renderHubSection = (title: string, hubModules: ModuleSetting[] | undefined, icon: string) => {
        if (!hubModules || hubModules.length === 0) return null;

        return (
            <div className="mb-4">
                <h5 className="d-flex align-items-center mb-3">
                    <IconifyIcon icon={icon} className="me-2 text-primary" />
                    {title}
                    <Badge bg="primary" className="ms-2">{hubModules.length}</Badge>
                </h5>
                <Row>
                    {hubModules.map(renderModuleCard)}
                </Row>
            </div>
        );
    };

    return (
        <>
            <PageTitle title="Module Settings" subName="Feature Toggles" />

            <Card className="mb-3">
                <CardBody>
                    {feedback && (
                        <Alert
                            variant={feedback.type}
                            dismissible
                            onClose={() => setFeedback(null)}
                            className="mb-3"
                        >
                            {feedback.message}
                        </Alert>
                    )}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <h5 className="mb-1">Module Settings</h5>
                            <p className="text-muted mb-0 small">
                                Control which features are enabled for Residents and Guards in the mobile apps.
                            </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ minWidth: '200px' }}>
                                <Form.Select
                                    value={selectedCommunity}
                                    onChange={(e) => setSelectedCommunity(e.target.value)}
                                    size="sm"
                                    disabled={!isSuperadmin && communities.length <= 1}
                                >
                                    {isSuperadmin ? <option value="">Global Settings</option> : null}
                                    {communities.map((community) => (
                                        <option key={community.id} value={community.id}>
                                            {community.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => fetchModules()}
                                disabled={loading}
                            >
                                <IconifyIcon icon="ri:refresh-line" className="me-1" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {!capabilitiesLoading && !isSuperadmin && hasScopedCommunityAccess && (
                        <div className="alert alert-secondary mt-3 mb-0 d-flex align-items-center">
                            <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                            <span>
                                Community-scoped admin mode is active. You can only manage module settings for your assigned communities.
                            </span>
                        </div>
                    )}

                    {selectedCommunity && (
                        <div className="alert alert-info mt-3 mb-0 d-flex align-items-center">
                            <IconifyIcon icon="ri:information-line" className="me-2" />
                            <span>
                                You are editing settings for <strong>{communities.find(c => c.id === selectedCommunity)?.name}</strong>.
                                Changes here will override global settings for this community only.
                            </span>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'RESIDENT' | 'GUARD')}>
                        <Nav variant="tabs" className="mb-4">
                            <Nav.Item>
                                <Nav.Link eventKey="RESIDENT" className="d-flex align-items-center">
                                    <IconifyIcon icon="ri:user-line" className="me-2" />
                                    Resident Modules
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="GUARD" className="d-flex align-items-center">
                                    <IconifyIcon icon="ri:shield-user-line" className="me-2" />
                                    Guard Modules
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>

                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="text-muted mt-2">Loading modules...</p>
                            </div>
                        ) : (
                            <Tab.Content>
                                <Tab.Pane eventKey="RESIDENT">
                                    {renderHubSection('Community Hub', modules.community_hub, 'ri:community-line')}
                                    {renderHubSection('Personal Hub', modules.personal_hub, 'ri:user-settings-line')}
                                </Tab.Pane>
                                <Tab.Pane eventKey="GUARD">
                                    {renderHubSection('Guard Hub', modules.guard_hub, 'ri:shield-check-line')}
                                </Tab.Pane>
                            </Tab.Content>
                        )}
                    </Tab.Container>
                </CardBody>
            </Card>
        </>
    );
};

export default ModuleSettingsPage;
