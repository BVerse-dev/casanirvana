'use client';

import { useMemo, useState } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, ProgressBar, Spinner } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useListUserGroups, 
  useUserGroupsStats, 
  useCreateUserGroup, 
  useUpdateUserGroup, 
  useDeleteUserGroup,
  useGroupMembers,
  type GroupMember,
  type UserGroup,
  type GroupFormData 
} from '@/hooks/useUserGroups';

const groupValidationSchema = yup.object({
  name: yup.string().required('Group name is required').min(3, 'Group name must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  color: yup.string().required('Color is required'),
  type: yup.string().required('Group type is required'),
  maxMembers: yup.number().positive('Max members must be positive').nullable(),
  autoAssign: yup.boolean(),
  assignmentRules: yup.array().of(yup.string()),
  tags: yup.array().of(yup.string())
});

const groupTypes = [
  { value: 'block', label: 'Block/Building', icon: 'material-symbols:apartment' },
  { value: 'role', label: 'Role-based', icon: 'material-symbols:badge' },
  { value: 'interest', label: 'Interest Group', icon: 'material-symbols:interests' },
  { value: 'committee', label: 'Committee', icon: 'material-symbols:groups' },
  { value: 'custom', label: 'Custom Group', icon: 'material-symbols:group-add' }
];

const groupColors = [
  { value: '#dc3545', label: 'Red' },
  { value: '#fd7e14', label: 'Orange' },
  { value: '#ffc107', label: 'Yellow' },
  { value: '#198754', label: 'Green' },
  { value: '#20c997', label: 'Teal' },
  { value: '#0dcaf0', label: 'Cyan' },
  { value: '#0d6efd', label: 'Blue' },
  { value: '#6610f2', label: 'Indigo' },
  { value: '#6f42c1', label: 'Purple' },
  { value: '#d63384', label: 'Pink' }
];

const assignmentRuleOptions = [
  { value: 'role:community_member', label: 'Role: Community Member' },
  { value: 'role:guard', label: 'Role: Security Guard' },
  { value: 'role:maintenance', label: 'Role: Maintenance' },
  { value: 'role:admin', label: 'Role: Administrator' },
  { value: 'block_number:A', label: 'Block: A' },
  { value: 'block_number:B', label: 'Block: B' },
  { value: 'block_number:C', label: 'Block: C' },
  { value: 'status:active', label: 'Status: Active' },
  { value: 'verified:true', label: 'Verified Users' }
];

export default function UserGroupsPage() {
  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('grid');

  // Hooks for data fetching
  const { data: groups = [], isLoading: groupsLoading, error: groupsError } = useListUserGroups();
  const { data: groupStats, isLoading: statsLoading, error: statsError } = useUserGroupsStats();
  const createGroupMutation = useCreateUserGroup();
  const updateGroupMutation = useUpdateUserGroup();
  const deleteGroupMutation = useDeleteUserGroup();
  const {
    data: groupMembers = [],
    isLoading: isLoadingMembers,
    error: groupMembersError,
  } = useGroupMembers(showMembersModal ? selectedGroup?.id : undefined);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<GroupFormData>({
    resolver: yupResolver(groupValidationSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      color: '#0d6efd',
      type: '',
      maxMembers: undefined,
      autoAssign: false,
      assignmentRules: [],
      tags: []
    }
  });

  const selectedRules = watch('assignmentRules') || [];
  const selectedTags = watch('tags') || [];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || group.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const statsDisplay = useMemo(() => {
    if (groupStats) {
      return groupStats;
    }

    const totalMembers = groups.reduce((sum, group) => sum + group.memberCount, 0);

    return {
      total: groups.length,
      active: groups.filter((group) => group.isActive).length,
      totalMembers,
      avgMembersPerGroup: groups.length > 0 ? Math.round(totalMembers / groups.length) : 0,
      byType: groups.reduce<Record<string, number>>((acc, group) => {
        acc[group.type] = (acc[group.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [groupStats, groups]);

  // Handler functions using mutations
  const handleCreateGroup = async (data: GroupFormData) => {
    try {
      await createGroupMutation.mutateAsync(data);
      setShowCreateModal(false);
      reset();
      toast.success('Group created successfully!');
    } catch (error) {
      toast.error('Failed to create group. Please try again.');
      console.error('Create group error:', error);
    }
  };

  const handleEditGroup = async (data: GroupFormData) => {
    if (!selectedGroup) return;
    
    try {
      await updateGroupMutation.mutateAsync({ id: selectedGroup.id, formData: data });
      setShowEditModal(false);
      setSelectedGroup(null);
      reset();
      toast.success('Group updated successfully!');
    } catch (error) {
      toast.error('Failed to update group. Please try again.');
      console.error('Update group error:', error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      await deleteGroupMutation.mutateAsync(selectedGroup.id);
      setShowDeleteModal(false);
      setSelectedGroup(null);
      toast.success('Group deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete group. Please try again.');
      console.error('Delete group error:', error);
    }
  };

  const openEditModal = (group: UserGroup) => {
    setSelectedGroup(group);
    setValue('name', group.name);
    setValue('description', group.description);
    setValue('color', group.color);
    setValue('type', group.type);
    setValue('maxMembers', group.maxMembers);
    setValue('autoAssign', group.autoAssign);
    setValue('assignmentRules', group.assignmentRules || []);
    setValue('tags', group.tags || []);
    setShowEditModal(true);
  };

  const openDeleteModal = (group: UserGroup) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const openMembersModal = (group: UserGroup) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const toggleAssignmentRule = (rule: string) => {
    const current = selectedRules;
    if (current.includes(rule)) {
      setValue('assignmentRules', current.filter(r => r !== rule));
    } else {
      setValue('assignmentRules', [...current, rule]);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      setValue('tags', [...selectedTags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', selectedTags.filter(tag => tag !== tagToRemove));
  };

  const getTypeIcon = (type: string) => {
    const typeObj = groupTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : 'material-symbols:group';
  };

  const getProgressPercentage = (group: UserGroup) => {
    if (!group.maxMembers) return 100;
    return Math.min((group.memberCount / group.maxMembers) * 100, 100);
  };

  const GroupModal = ({ show, onHide, title, onSubmit }: any) => (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <TextFormInput
                name="name"
                label="Group Name"
                placeholder="Enter group name"
                control={control}
              />
            </Col>
            <Col md={4}>
              <SelectFormInput
                name="color"
                label="Group Color"
                control={control}
                options={groupColors}
              />
            </Col>
          </Row>

          <TextAreaFormInput
            name="description"
            label="Description"
            placeholder="Enter group description"
            rows={3}
            control={control}
          />

          <Row>
            <Col md={6}>
              <SelectFormInput
                name="type"
                label="Group Type"
                control={control}
                options={groupTypes}
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="maxMembers"
                label="Max Members (Optional)"
                type="number"
                placeholder="Leave empty for unlimited"
                control={control}
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="autoAssign"
              label="Enable automatic member assignment based on rules"
              checked={watch('autoAssign')}
              onChange={(e) => setValue('autoAssign', e.target.checked)}
            />
          </Form.Group>

          {watch('autoAssign') && (
            <div className="mb-3">
              <Form.Label className="fw-semibold">Assignment Rules</Form.Label>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <p className="small text-muted mb-2">Select criteria for automatic member assignment:</p>
                  <Row>
                    {assignmentRuleOptions.map((rule) => (
                      <Col md={6} key={rule.value} className="mb-2">
                        <Form.Check
                          type="checkbox"
                          id={rule.value}
                          label={rule.label}
                          checked={selectedRules.includes(rule.value)}
                          onChange={() => toggleAssignmentRule(rule.value)}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}

          <div className="mb-3">
            <Form.Label className="fw-semibold">Tags</Form.Label>
            <div className="mb-2">
              {selectedTags.map(tag => (
                <Badge 
                  key={tag} 
                  bg="primary" 
                  className="me-1 mb-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => removeTag(tag)}
                >
                  {tag} <IconifyIcon icon="material-symbols:close" className="ms-1" />
                </Badge>
              ))}
            </div>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Add a tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button 
                variant="outline-secondary"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  addTag(input.value);
                  input.value = '';
                }}
              >
                Add
              </Button>
            </InputGroup>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <IconifyIcon icon="material-symbols:save" className="me-1" />
            {title.includes('Create') ? 'Create Group' : 'Update Group'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  return (
    <>
      <PageTitle title="Access Groups" subName="Identity & Access" />
      
      <ComponentContainerCard 
        id="user-groups-management"
        title="User Groups"
        description="Organize users into logical groups for better community management and communication"
      >
        {/* Loading State */}
        {(groupsLoading || statsLoading) && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">Loading groups...</p>
          </div>
        )}

        {/* Error State */}
        {groupsError && (
          <Alert variant="danger" className="mb-4">
            <IconifyIcon icon="material-symbols:warning" className="me-2" />
            Failed to load groups. Refresh to try again.
          </Alert>
        )}

        {!groupsError && statsError && (
          <Alert variant="warning" className="mb-4">
            <IconifyIcon icon="material-symbols:warning" className="me-2" />
            Group statistics are temporarily unavailable. Showing live totals from current groups.
          </Alert>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:groups" className="fs-1 text-primary mb-2" />
                <h4 className="mb-1">{statsDisplay.total}</h4>
                <p className="text-muted mb-0">Total Groups</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:check-circle" className="fs-1 text-success mb-2" />
                <h4 className="mb-1">{statsDisplay.active}</h4>
                <p className="text-muted mb-0">Active Groups</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:person" className="fs-1 text-info mb-2" />
                <h4 className="mb-1">{statsDisplay.totalMembers}</h4>
                <p className="text-muted mb-0">Total Members</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:average-pace" className="fs-1 text-warning mb-2" />
                <h4 className="mb-1">{statsDisplay.avgMembersPerGroup}</h4>
                <p className="text-muted mb-0">Avg per Group</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Row className="mb-4">
          <Col md={5}>
            <InputGroup>
              <InputGroup.Text>
                <IconifyIcon icon="material-symbols:search" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {groupTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Button 
              variant="primary" 
              className="w-100"
              onClick={() => setShowCreateModal(true)}
            >
              <IconifyIcon icon="material-symbols:group-add" className="me-1" />
              Create Group
            </Button>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'grid')} className="mb-4">
          <Tab eventKey="grid" title="Grid View">
            <Row>
              {filteredGroups.map((group) => (
                <Col md={6} lg={4} key={group.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Header 
                      className="border-0 d-flex align-items-center"
                      style={{ backgroundColor: `${group.color}15` }}
                    >
                      <div 
                        className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: group.color,
                          color: 'white'
                        }}
                      >
                        <IconifyIcon icon={getTypeIcon(group.type)} />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{group.name}</h6>
                        <small className="text-muted">
                          {groupTypes.find(t => t.value === group.type)?.label}
                        </small>
                      </div>
                      <Dropdown>
                        <Dropdown.Toggle 
                          variant="link" 
                          size="sm"
                          className="text-muted border-0 shadow-none"
                        >
                          <IconifyIcon icon="material-symbols:more-vert" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => openMembersModal(group)}>
                            <IconifyIcon icon="material-symbols:group" className="me-2" />
                            View Members
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => openEditModal(group)}>
                            <IconifyIcon icon="material-symbols:edit" className="me-2" />
                            Edit Group
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="text-danger"
                            onClick={() => openDeleteModal(group)}
                          >
                            <IconifyIcon icon="material-symbols:delete" className="me-2" />
                            Delete Group
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted small mb-3">{group.description}</p>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Members</small>
                          <small className="fw-semibold">
                            {group.memberCount}
                            {group.maxMembers && ` / ${group.maxMembers}`}
                          </small>
                        </div>
                        <ProgressBar 
                          now={getProgressPercentage(group)} 
                          style={{ height: '6px' }}
                          variant={getProgressPercentage(group) > 90 ? 'warning' : 'primary'}
                        />
                      </div>

                      <div className="mb-3">
                        {group.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} bg="light" text="dark" className="me-1 small">
                            {tag}
                          </Badge>
                        ))}
                        {group.tags.length > 3 && (
                          <Badge bg="light" text="muted" className="small">
                            +{group.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {group.autoAssign && (
                            <Badge bg="info" className="small">Auto-assign</Badge>
                          )}
                          {group.leaderName && (
                            <small className="text-muted d-block mt-1">
                              Led by {group.leaderName}
                            </small>
                          )}
                        </div>
                        <Badge bg={group.isActive ? 'success' : 'secondary'}>
                          {group.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="list" title="List View">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Type</th>
                  <th>Members</th>
                  <th>Auto-assign</th>
                  <th>Leader</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: group.color,
                            color: 'white'
                          }}
                        >
                          <IconifyIcon icon={getTypeIcon(group.type)} />
                        </div>
                        <div>
                          <div className="fw-semibold">{group.name}</div>
                          <small className="text-muted">{group.description}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">
                        {groupTypes.find(t => t.value === group.type)?.label}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <span className="fw-semibold">{group.memberCount}</span>
                        {group.maxMembers && (
                          <span className="text-muted"> / {group.maxMembers}</span>
                        )}
                      </div>
                      {group.maxMembers && (
                        <ProgressBar 
                          now={getProgressPercentage(group)} 
                          style={{ height: '4px', width: '60px' }}
                          variant={getProgressPercentage(group) > 90 ? 'warning' : 'primary'}
                        />
                      )}
                    </td>
                    <td>
                      {group.autoAssign ? (
                        <Badge bg="success">
                          <IconifyIcon icon="material-symbols:check" className="me-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge bg="light" text="dark">No</Badge>
                      )}
                    </td>
                    <td>{group.leaderName || '-'}</td>
                    <td>
                      <Badge bg={group.isActive ? 'success' : 'secondary'}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-muted">{group.updatedDate}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle 
                          variant="light" 
                          size="sm"
                          className="border-0"
                        >
                          <IconifyIcon icon="material-symbols:more-vert" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => openMembersModal(group)}>
                            <IconifyIcon icon="material-symbols:group" className="me-2" />
                            View Members
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => openEditModal(group)}>
                            <IconifyIcon icon="material-symbols:edit" className="me-2" />
                            Edit Group
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="text-danger"
                            onClick={() => openDeleteModal(group)}
                          >
                            <IconifyIcon icon="material-symbols:delete" className="me-2" />
                            Delete Group
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Groups by Type</h6>
                  </Card.Header>
                  <Card.Body>
                    {groupTypes.map(type => (
                      <div key={type.value} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon={type.icon} className="me-2" />
                          <span>{type.label}</span>
                        </div>
                        <Badge bg="light" text="dark">
                          {statsDisplay.byType?.[type.value] || 0}
                        </Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Membership Distribution</h6>
                  </Card.Header>
                  <Card.Body>
                    {filteredGroups.slice(0, 5).map(group => (
                      <div key={group.id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small>{group.name}</small>
                          <small className="fw-semibold">{group.memberCount} members</small>
                        </div>
                        <ProgressBar 
                          now={statsDisplay.totalMembers ? (group.memberCount / statsDisplay.totalMembers) * 100 : 0} 
                          style={{ height: '6px' }}
                        />
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </ComponentContainerCard>

      {/* Create Group Modal */}
      <GroupModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        title="Create New Group"
        onSubmit={handleCreateGroup}
      />

      {/* Edit Group Modal */}
      <GroupModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
          reset();
        }}
        title="Edit Group"
        onSubmit={handleEditGroup}
      />

      {/* Members Modal */}
      <Modal show={showMembersModal} onHide={() => setShowMembersModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedGroup?.name} Members
            <Badge bg="primary" className="ms-2">{selectedGroup?.memberCount}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingMembers ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading group members...</span>
            </div>
          ) : groupMembersError ? (
            <Alert variant="danger" className="mb-0">
              <IconifyIcon icon="solar:danger-triangle-line-duotone" className="me-2" />
              Failed to load members for this group.
            </Alert>
          ) : groupMembers.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon icon="material-symbols:groups" className="fs-1 text-muted mb-3" />
              <p className="text-muted mb-0">No members are currently assigned to this group.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMembers.map((member: GroupMember) => (
                    <tr key={member.id}>
                      <td>{member.userName}</td>
                      <td>{member.userEmail}</td>
                      <td className="text-capitalize">{member.userRole}</td>
                      <td>{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Badge bg={member.isActive ? 'success' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMembersModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <IconifyIcon icon="material-symbols:warning" className="me-2" />
            Are you sure you want to delete the group &quot;{selectedGroup?.name}&quot;?
          </Alert>
          <p className="text-muted">
            This action cannot be undone. All group members will be removed from this group.
          </p>
          {selectedGroup && selectedGroup.memberCount > 0 && (
            <Alert variant="warning">
              <strong>Warning:</strong> This group currently has {selectedGroup.memberCount} member(s).
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteGroup}>
            <IconifyIcon icon="material-symbols:delete" className="me-1" />
            Delete Group
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
