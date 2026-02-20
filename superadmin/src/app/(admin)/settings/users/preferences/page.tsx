'use client';

import { useState } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, ProgressBar } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Supabase Hooks
import { 
  useListPreferenceCategories,
  useListPreferenceSettings,
  useCreatePreferenceSetting,
  useUpdatePreferenceSetting,
  useDeletePreferenceSetting,
  usePreferenceSettingsStats,
  mapPreferenceCategoryToUI,
  mapPreferenceSettingToUI,
  mapUIToPreferenceSetting
} from '@/hooks/useUserPreferences';

interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

interface PreferenceSetting {
  id: string;
  categoryId: string;
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'select' | 'text' | 'number' | 'color' | 'time';
  defaultValue: any;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  isUserEditable: boolean;
  isSystemSetting: boolean;
  affectedUsers: number;
  createdDate: string;
  updatedDate: string;
}

interface UserPreference {
  userId: string;
  userName: string;
  userRole: string;
  preferences: Record<string, any>;
  lastUpdated: string;
  customizations: number;
}

interface PreferenceFormData {
  categoryId: string;
  key: string;
  name: string;
  description: string;
  type: string;
  defaultValue: any;
  options: Array<{ value: any; label: string }> | null;
  isUserEditable: boolean;
  validation: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

const preferenceValidationSchema = yup.object({
  categoryId: yup.string().required('Category is required'),
  key: yup.string().required('Key is required').matches(/^[a-z_]+$/, 'Key must be lowercase with underscores only'),
  name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().required('Description is required'),
  type: yup.string().required('Type is required'),
  defaultValue: yup.mixed().required('Default value is required'),
  options: yup.array().of(yup.object({
    value: yup.mixed().required(),
    label: yup.string().required()
  })).default([]).nullable(),
  isUserEditable: yup.boolean().default(true),
  validation: yup.object({
    required: yup.boolean().default(false),
    min: yup.number().optional(),
    max: yup.number().optional(),
    pattern: yup.string().optional()
  }).default({ required: false })
});

// No mock data - all data comes from Supabase

const preferenceTypes = [
  { value: 'boolean', label: 'Boolean (True/False)' },
  { value: 'select', label: 'Select (Dropdown)' },
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'color', label: 'Color Picker' },
  { value: 'time', label: 'Time Picker' }
];

export default function UserPreferencesPage() {
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<PreferenceSetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('settings');
  const [operationError, setOperationError] = useState<string | null>(null);

  // Supabase Hooks
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useListPreferenceCategories();

  const { 
    data: preferencesResponse, 
    isLoading: preferencesLoading, 
    error: preferencesError
  } = useListPreferenceSettings({
    search: searchTerm !== '' ? searchTerm : undefined,
    categoryId: categoryFilter !== 'all' ? categoryFilter : undefined
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = usePreferenceSettingsStats();

  const createPreferenceMutation = useCreatePreferenceSetting();
  const updatePreferenceMutation = useUpdatePreferenceSetting();
  const deletePreferenceMutation = useDeletePreferenceSetting();

  // Convert Supabase data to UI format - no fallbacks
  const categories: PreferenceCategory[] = categoriesData?.map(mapPreferenceCategoryToUI) || [];
  const preferences: PreferenceSetting[] = preferencesResponse?.data?.map(mapPreferenceSettingToUI) || [];
  
  // Check for missing data - we'll show errors in the UI
  const hasCategoriesError = !categoriesError && categories.length === 0;
  const hasPreferencesError = !preferencesError && (!preferencesResponse || !preferencesResponse.data);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<PreferenceFormData>({
    resolver: yupResolver(preferenceValidationSchema),
    defaultValues: {
      categoryId: '',
      key: '',
      name: '',
      description: '',
      type: 'boolean',
      defaultValue: false,
      options: [],
      isUserEditable: true,
      validation: {
        required: false
      }
    }
  });

  const selectedType = watch('type');
  const selectedOptions = watch('options') || [];

  // Use stats directly from Supabase, no fallbacks
  const preferenceStats = {
    total: statsData?.total || 0,
    userEditable: statsData?.userEditable || 0,
    systemSettings: statsData?.systemSettings || 0,
    totalUsers: 200, // Placeholder, would come from a separate query in full implementation
    byCategory: statsData?.byCategory || {},
    categoriesMap: statsData?.categoriesMap || {},
    byType: statsData?.byType || {}
  };
  
  // We no longer filter the data client-side since filtering is handled by Supabase
  // Using this ensures backward compatibility with the existing UI code
  const filteredPreferences = preferences;

  const handleCreatePreference = async (data: PreferenceFormData) => {
    setOperationError(null);
    try {
      const dbPreference = mapUIToPreferenceSetting(data);
      await createPreferenceMutation.mutateAsync(dbPreference as any);
      setShowCreateModal(false);
      reset();
    } catch (error) {
      console.error('Error creating preference:', error);
      setOperationError(`Failed to create preference in database: ${String(error)}`);
    }
  };

  const handleEditPreference = async (data: PreferenceFormData) => {
    if (!selectedPreference) return;
    setOperationError(null);
    
    try {
      const dbPreference = mapUIToPreferenceSetting({
        ...data,
        id: selectedPreference.id
      });
      
      await updatePreferenceMutation.mutateAsync(dbPreference as any);
      setShowEditModal(false);
      setSelectedPreference(null);
      reset();
    } catch (error) {
      console.error('Error updating preference:', error);
      setOperationError(`Failed to update preference in database: ${String(error)}`);
    }
  };

  const handleDeletePreference = async () => {
    if (!selectedPreference) return;
    setOperationError(null);
    
    try {
      await deletePreferenceMutation.mutateAsync(selectedPreference.id);
      setShowDeleteModal(false);
      setSelectedPreference(null);
    } catch (error) {
      console.error('Error deleting preference:', error);
      setOperationError(`Failed to delete preference from database: ${String(error)}`);
    }
  };

  const openEditModal = (preference: PreferenceSetting) => {
    setSelectedPreference(preference);
    setValue('categoryId', preference.categoryId);
    setValue('key', preference.key);
    setValue('name', preference.name);
    setValue('description', preference.description);
    setValue('type', preference.type);
    setValue('defaultValue', preference.defaultValue);
    setValue('options', preference.options || []);
    setValue('isUserEditable', preference.isUserEditable);
    setShowEditModal(true);
  };

  const openDeleteModal = (preference: PreferenceSetting) => {
    setSelectedPreference(preference);
    setShowDeleteModal(true);
  };

  const addOption = () => {
    setValue('options', [...selectedOptions, { value: '', label: '' }]);
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const newOptions = [...selectedOptions];
    newOptions[index][field] = value;
    setValue('options', newOptions);
  };

  const removeOption = (index: number) => {
    setValue('options', selectedOptions.filter((_, i) => i !== index));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getTypeLabel = (type: string) => {
    const typeObj = preferenceTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getUsagePercentage = (affectedUsers: number) => {
    if (preferenceStats.totalUsers === 0) return 0;
    return Math.round((affectedUsers / preferenceStats.totalUsers) * 100);
  };

  const PreferenceModal = ({ show, onHide, title, onSubmit }: any) => (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {operationError && (
            <Alert variant="danger" className="mb-3">
              <Alert.Heading>Database Operation Failed</Alert.Heading>
              <p>The preference setting could not be saved to the database.</p>
              <hr />
              <p className="mb-0">Error details: {operationError}</p>
            </Alert>
          )}
          
          {categories.length === 0 && (
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>No Categories Available</Alert.Heading>
              <p>No preference categories are available in the database. You must have at least one category to create a preference setting.</p>
            </Alert>
          )}
          <Row>
            <Col md={6}>
              <SelectFormInput
                name="categoryId"
                label="Category"
                control={control}
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              />
              {errors.categoryId && <div className="text-danger small">{errors.categoryId.message}</div>}
            </Col>
            <Col md={6}>
              <SelectFormInput
                name="type"
                label="Preference Type"
                control={control}
                options={preferenceTypes}
              />
              {errors.type && <div className="text-danger small">{errors.type.message}</div>}
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <TextFormInput
                name="name"
                label="Display Name"
                placeholder="Enter preference name"
                control={control}
              />
              {errors.name && <div className="text-danger small">{errors.name.message}</div>}
            </Col>
            <Col md={6}>
              <TextFormInput
                name="key"
                label="Setting Key"
                placeholder="e.g., email_notifications"
                control={control}
              />
              {errors.key && <div className="text-danger small">{errors.key.message}</div>}
            </Col>
          </Row>

          <TextAreaFormInput
            name="description"
            label="Description"
            placeholder="Enter preference description"
            rows={3}
            control={control}
          />
          {errors.description && <div className="text-danger small">{errors.description.message}</div>}

          <div className="mb-3">
            <Form.Label className="fw-semibold">Default Value</Form.Label>
            {selectedType === 'boolean' && (
              <Form.Check
                type="checkbox"
                label="Enable by default"
                checked={watch('defaultValue')}
                onChange={(e) => setValue('defaultValue', e.target.checked)}
              />
            )}
            {selectedType === 'text' && (
              <Form.Control
                type="text"
                placeholder="Enter default text value"
                value={watch('defaultValue') || ''}
                onChange={(e) => setValue('defaultValue', e.target.value)}
              />
            )}
            {selectedType === 'number' && (
              <Form.Control
                type="number"
                placeholder="Enter default number"
                value={watch('defaultValue') || ''}
                onChange={(e) => setValue('defaultValue', parseFloat(e.target.value) || 0)}
              />
            )}
            {selectedType === 'color' && (
              <Form.Control
                type="color"
                value={watch('defaultValue') || '#000000'}
                onChange={(e) => setValue('defaultValue', e.target.value)}
              />
            )}
            {selectedType === 'select' && (
              <Form.Select
                value={watch('defaultValue') || ''}
                onChange={(e) => setValue('defaultValue', e.target.value)}
              >
                <option value="">Select default option</option>
                {selectedOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            )}
          </div>

          {selectedType === 'select' && (
            <div className="mb-3">
              <Form.Label className="fw-semibold">Options</Form.Label>
              {selectedOptions.map((option, index) => (
                <div key={index} className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Value"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    placeholder="Label"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                  />
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <IconifyIcon icon="material-symbols:delete" />
                  </Button>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" onClick={addOption}>
                <IconifyIcon icon="material-symbols:add" className="me-1" />
                Add Option
              </Button>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="isUserEditable"
              label="Allow users to modify this setting"
              checked={watch('isUserEditable')}
              onChange={(e) => setValue('isUserEditable', e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <IconifyIcon icon="material-symbols:save" className="me-1" />
            {title.includes('Create') ? 'Create Setting' : 'Update Setting'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  return (
    <>
      <PageTitle
        title="User Preferences"
        subName="Settings"
      />
      
      <ComponentContainerCard 
        title="User Preferences Settings"
        description="Configure user preference settings and default values for your community management system"
        id="preferences-settings"
      >
        {/* Show database status alerts */}
        {preferencesError && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Database Error</Alert.Heading>
            <p>Unable to load preference settings from database. Some functionality may be limited.</p>
            <p className="mb-0">Error details: {String(preferencesError)}</p>
          </Alert>
        )}
        
        {categoriesError && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Database Error</Alert.Heading>
            <p>Unable to load preference categories from database. Some functionality may be limited.</p>
            <p className="mb-0">Error details: {String(categoriesError)}</p>
          </Alert>
        )}
        
        {statsError && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Statistics Error</Alert.Heading>
            <p>Unable to load preference usage statistics. The interface will display partial information.</p>
            <p className="mb-0">Error details: {String(statsError)}</p>
          </Alert>
        )}
        
        {/* Loading states */}
        {(preferencesLoading || categoriesLoading || statsLoading) && (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading preference data from database...</p>
          </div>
        )}
        
        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:settings" className="fs-1 text-primary mb-2" />
                <h4 className="mb-1">{preferenceStats.total}</h4>
                <p className="text-muted mb-0">Total Settings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:edit" className="fs-1 text-success mb-2" />
                <h4 className="mb-1">{preferenceStats.userEditable}</h4>
                <p className="text-muted mb-0">User Editable</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:admin-panel-settings" className="fs-1 text-warning mb-2" />
                <h4 className="mb-1">{preferenceStats.systemSettings}</h4>
                <p className="text-muted mb-0">System Settings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:category" className="fs-1 text-info mb-2" />
                <h4 className="mb-1">{categories.length}</h4>
                <p className="text-muted mb-0">Categories</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Row className="mb-4">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>
                <IconifyIcon icon="material-symbols:search" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search preferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={5}>
            <Button 
              variant="primary" 
              className="w-100"
              onClick={() => setShowCreateModal(true)}
            >
              <IconifyIcon icon="material-symbols:add" className="me-1" />
              Create Preference Setting
            </Button>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'settings')} className="mb-4">
          <Tab eventKey="settings" title="Settings List">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Default Value</th>
                  <th>Usage</th>
                  <th>User Editable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreferences.map((preference) => (
                  <tr key={preference.id}>
                    <td>
                      <div>
                        <div className="fw-semibold">{preference.name}</div>
                        <small className="text-muted">{preference.description}</small>
                        <div>
                          <code className="small">{preference.key}</code>
                          {preference.isSystemSetting && (
                            <Badge bg="secondary" className="ms-2 small">System</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">{getCategoryName(preference.categoryId)}</Badge>
                    </td>
                    <td>
                      <Badge bg="info">{getTypeLabel(preference.type)}</Badge>
                    </td>
                    <td>
                      <div>
                        {preference.type === 'boolean' ? (
                          <Badge bg={preference.defaultValue ? 'success' : 'secondary'}>
                            {preference.defaultValue ? 'Enabled' : 'Disabled'}
                          </Badge>
                        ) : preference.type === 'color' ? (
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded me-2"
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: preference.defaultValue 
                              }}
                            ></div>
                            <small>{preference.defaultValue}</small>
                          </div>
                        ) : (
                          <span>{preference.defaultValue}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small>{preference.affectedUsers} users</small>
                          <small>{getUsagePercentage(preference.affectedUsers)}%</small>
                        </div>
                        <ProgressBar 
                          now={getUsagePercentage(preference.affectedUsers)} 
                          style={{ height: '4px' }}
                          variant={getUsagePercentage(preference.affectedUsers) > 70 ? 'success' : 'primary'}
                        />
                      </div>
                    </td>
                    <td>
                      {preference.isUserEditable ? (
                        <Badge bg="success">
                          <IconifyIcon icon="material-symbols:check" className="me-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Admin Only</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => openEditModal(preference)}
                        >
                          <IconifyIcon icon="material-symbols:edit" />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => openDeleteModal(preference)}
                          disabled={preference.isSystemSetting}
                        >
                          <IconifyIcon icon="material-symbols:delete" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="categories" title="By Category">
            <Row>
              {categories.map(category => (
                <Col md={6} key={category.id} className="mb-4">
                  <Card>
                    <Card.Header className="d-flex align-items-center">
                      <IconifyIcon icon={category.icon} className="me-2 fs-4" />
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{category.name}</h6>
                        <small className="text-muted">{category.description}</small>
                      </div>
                      <Badge bg="light" text="dark">
                        {preferenceStats.byCategory[category.id] || 0} settings
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      {preferences
                        .filter(p => p.categoryId === category.id)
                        .slice(0, 5)
                        .map(preference => (
                          <div key={preference.id} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <div className="fw-semibold small">{preference.name}</div>
                              <Badge bg="info" className="small">{getTypeLabel(preference.type)}</Badge>
                            </div>
                            <div className="text-end">
                              <small className="text-muted">{preference.affectedUsers} users</small>
                            </div>
                          </div>
                        ))}
                      {preferenceStats.byCategory[category.id] > 5 && (
                        <small className="text-muted">
                          +{preferenceStats.byCategory[category.id] - 5} more settings...
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Settings by Type</h6>
                  </Card.Header>
                  <Card.Body>
                    {preferenceTypes.map(type => (
                      <div key={type.value} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{type.label}</span>
                        <Badge bg="light" text="dark">
                          {preferenceStats.byType[type.value] || 0}
                        </Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Most Used Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    {preferences
                      .sort((a, b) => b.affectedUsers - a.affectedUsers)
                      .slice(0, 5)
                      .map(preference => (
                        <div key={preference.id} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="fw-semibold">{preference.name}</small>
                            <small>{preference.affectedUsers} users</small>
                          </div>
                          <ProgressBar 
                            now={getUsagePercentage(preference.affectedUsers)} 
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

      {/* Create Preference Modal */}
      <PreferenceModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        title="Create New Preference Setting"
        onSubmit={handleCreatePreference}
      />

      {/* Edit Preference Modal */}
      <PreferenceModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedPreference(null);
          reset();
        }}
        title="Edit Preference Setting"
        onSubmit={handleEditPreference}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <IconifyIcon icon="material-symbols:warning" className="me-2" />
            Are you sure you want to delete the preference setting &quot;{selectedPreference?.name}&quot;?
          </Alert>
          <p className="text-muted">
            This action cannot be undone. User preferences for this setting will be reset to default values.
          </p>
          {selectedPreference && selectedPreference.affectedUsers > 0 && (
            <Alert variant="warning">
              <strong>Warning:</strong> This setting is currently used by {selectedPreference.affectedUsers} user(s).
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePreference}>
            <IconifyIcon icon="material-symbols:delete" className="me-1" />
            Delete Setting
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
