'use client';

import { useState } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, ProgressBar } from 'react-bootstrap';
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
import FallbackLoading from '@/components/FallbackLoading';

// Hooks
import {
  useTrainingPrograms,
  useGuardTrainings,
  useGuardCertifications,
  useCreateTrainingProgram,
  useUpdateTrainingProgram,
  useDeleteTrainingProgram,
  useCreateGuardTraining,
  useUpdateGuardTraining,
  useUpdateTrainingStatus,
  useDeleteGuardTraining,
  useCreateGuardCertification,
  useUpdateCertificationStatus,
  useTrainingStats,
  useGuardTrainingRealtime,
  TrainingProgram,
  GuardTraining,
  GuardCertification,
  CreateTrainingProgramData,
  CreateGuardTrainingData,
} from '@/hooks/useGuardTraining';
import { useListGuards } from '@/hooks/useGuards';

interface TrainingFormData {
  guardId: string;
  programId: string;
  startDate: string;
  notes?: string;
}

interface ProgramFormData {
  name: string;
  description: string;
  category: string;
  duration: number;
  difficulty: string;
  isRequired?: boolean;
  validityPeriod: number;
  instructor: string;
  maxParticipants: number;
  cost: number;
  materials?: string;
  prerequisites?: string;
}

const trainingSchema = yup.object().shape({
  guardId: yup.string().required('Guard is required'),
  programId: yup.string().required('Training program is required'),
  startDate: yup.string().required('Start date is required'),
  notes: yup.string(),
});

const programSchema = yup.object().shape({
  name: yup.string().required('Program name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  duration: yup.number().positive().required('Duration is required'),
  difficulty: yup.string().required('Difficulty level is required'),
  instructor: yup.string().required('Instructor is required'),
  maxParticipants: yup.number().positive().required('Max participants is required'),
  cost: yup.number().min(0).required('Cost is required'),
  isRequired: yup.boolean(),
  validityPeriod: yup.number().positive().required('Validity period is required'),
  materials: yup.string(),
  prerequisites: yup.string(),
});

const GuardTrainingPage = () => {
  const [activeTab, setActiveTab] = useState('trainings');
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<GuardTraining | null>(null);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Real-time subscription
  useGuardTrainingRealtime();

  // Data fetching hooks
  const { data: programs = [], isLoading: programsLoading, error: programsError } = useTrainingPrograms({
    category: filterCategory,
    search: searchTerm
  });

  const { data: trainings = [], isLoading: trainingsLoading, error: trainingsError } = useGuardTrainings({
    status: filterStatus,
    search: searchTerm
  });

  const { data: certifications = [], isLoading: certificationsLoading, error: certificationsError } = useGuardCertifications();

  const { data: guards = [], isLoading: guardsLoading } = useListGuards();

  const { data: stats } = useTrainingStats();

  // Mutation hooks
  const createTrainingMutation = useCreateGuardTraining();
  const updateTrainingMutation = useUpdateGuardTraining();
  const updateTrainingStatusMutation = useUpdateTrainingStatus();
  const deleteTrainingMutation = useDeleteGuardTraining();

  const createProgramMutation = useCreateTrainingProgram();
  const updateProgramMutation = useUpdateTrainingProgram();
  const deleteProgramMutation = useDeleteTrainingProgram();

  const {
    control: trainingControl,
    handleSubmit: handleTrainingSubmit,
    reset: resetTraining,
    formState: { errors: trainingErrors, isValid: isTrainingValid },
  } = useForm<TrainingFormData>({
    resolver: yupResolver(trainingSchema),
    mode: 'onChange',
  });

  const {
    control: programControl,
    handleSubmit: handleProgramSubmit,
    reset: resetProgram,
    formState: { errors: programErrors, isValid: isProgramValid },
  } = useForm<ProgramFormData>({
    resolver: yupResolver(programSchema),
    mode: 'onChange',
  });

  const handleCreateTraining = async (data: TrainingFormData) => {
    try {
      const trainingData: CreateGuardTrainingData = {
        guardId: data.guardId,
        programId: data.programId,
        startDate: data.startDate,
        notes: data.notes,
      };

      if (editingTraining) {
        await updateTrainingMutation.mutateAsync({
          id: editingTraining.id,
          data: {
            startDate: data.startDate,
            notes: data.notes,
          }
        });
      } else {
        await createTrainingMutation.mutateAsync(trainingData);
      }

      setShowTrainingModal(false);
      setEditingTraining(null);
      resetTraining();
    } catch (error) {
      console.error('Error handling training:', error);
    }
  };

  const handleCreateProgram = async (data: ProgramFormData) => {
    try {
      const programData: CreateTrainingProgramData = {
        name: data.name,
        description: data.description,
        category: data.category as any,
        duration: data.duration,
        difficulty: data.difficulty as any,
        isRequired: data.isRequired || false,
        validityPeriod: data.validityPeriod,
        instructor: data.instructor,
        maxParticipants: data.maxParticipants,
        cost: data.cost,
        materials: (data.materials || '').split('\n').filter(m => m.trim()),
        prerequisites: (data.prerequisites || '').split('\n').filter(p => p.trim()),
      };

      if (editingProgram) {
        await updateProgramMutation.mutateAsync({
          id: editingProgram.id,
          data: programData
        });
      } else {
        await createProgramMutation.mutateAsync(programData);
      }

      setShowProgramModal(false);
      setEditingProgram(null);
      resetProgram();
    } catch (error) {
      console.error('Error handling program:', error);
    }
  };

  const getStatusBadgeColor = (status: GuardTraining['status'] | GuardCertification['status']) => {
    switch (status) {
      case 'completed':
      case 'valid': return 'success';
      case 'in_progress':
      case 'enrolled': return 'primary';
      case 'expiring_soon': return 'warning';
      case 'failed':
      case 'expired': return 'danger';
      case 'cancelled': return 'dark';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: TrainingProgram['category']) => {
    switch (category) {
      case 'security': return 'primary';
      case 'safety': return 'danger';
      case 'technology': return 'info';
      case 'communication': return 'success';
      case 'emergency': return 'warning';
      default: return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: TrainingProgram['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || program.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Loading states
  if (programsLoading || trainingsLoading || certificationsLoading || guardsLoading) {
    return <FallbackLoading />;
  }

  // Error states
  if (programsError || trainingsError || certificationsError) {
    return (
      <Alert variant="danger">
        <h5>Error Loading Training Data</h5>
        <p>
          {programsError?.message || trainingsError?.message || certificationsError?.message}
        </p>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle 
        title="Training & Certification" 
        subName="Manage training programs, certifications, and skill development"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="guard-training" title="Training & Certification Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'trainings')}
              className="mb-4"
            >
              <Tab eventKey="trainings" title="Guard Training">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingTraining(null);
                        resetTraining();
                        setShowTrainingModal(true);
                      }}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Enroll Guard
                    </Button>
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="ri:download-line" className="me-1" />
                      Export Records
                    </Button>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <InputGroup style={{ width: '300px' }}>
                      <Form.Control
                        type="text"
                        placeholder="Search trainings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary">
                        <IconifyIcon icon="ri:search-line" />
                      </Button>
                    </InputGroup>
                  </div>
                </div>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Guard</th>
                          <th>Training Program</th>
                          <th>Duration & Progress</th>
                          <th>Instructor</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrainings.map((training) => (
                          <tr key={training.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                                  <IconifyIcon icon="ri:graduation-cap-line" className="text-primary" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{training.guardName}</h6>
                                  <small className="text-muted">ID: {training.guardId}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{training.programName}</div>
                                <small className="text-muted">
                                  Enrolled: {training.enrollmentDate}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">
                                  {training.startDate}
                                  {training.completionDate && ` - ${training.completionDate}`}
                                </div>
                                {training.expiryDate && (
                                  <small className="text-muted">Expires: {training.expiryDate}</small>
                                )}
                              </div>
                            </td>
                            <td>{training.instructor}</td>
                            <td>
                              <Badge bg={getStatusBadgeColor(training.status)}>
                                {training.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td>
                              {training.score ? (
                                <div className="d-flex align-items-center">
                                  <span className="fw-medium me-2">{training.score}%</span>
                                  <div className="progress" style={{ width: '50px', height: '6px' }}>
                                    <div 
                                      className={`progress-bar ${training.score >= 80 ? 'bg-success' : training.score >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                      style={{ width: `${training.score}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <IconifyIcon icon="ri:more-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                                    View Details
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      setEditingTraining(training);
                                      resetTraining({
                                        guardId: training.guardId,
                                        programId: training.programId,
                                        startDate: training.startDate,
                                        notes: training.notes || ''
                                      });
                                      setShowTrainingModal(true);
                                    }}
                                  >
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Update Progress
                                  </Dropdown.Item>
                                  {training.certificateUrl && (
                                    <Dropdown.Item>
                                      <IconifyIcon icon="ri:download-line" className="me-1" />
                                      Download Certificate
                                    </Dropdown.Item>
                                  )}
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="text-danger"
                                    onClick={() => deleteTrainingMutation.mutate(training.id)}
                                  >
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Cancel Enrollment
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="programs" title="Training Programs">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingProgram(null);
                        resetProgram();
                        setShowProgramModal(true);
                      }}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      New Program
                    </Button>
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                      Clone Program
                    </Button>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      style={{ width: '200px' }}
                    >
                      <option value="all">All Categories</option>
                      <option value="security">Security</option>
                      <option value="safety">Safety</option>
                      <option value="technology">Technology</option>
                      <option value="communication">Communication</option>
                      <option value="emergency">Emergency</option>
                    </Form.Select>
                  </div>
                </div>

                <Row>
                  {filteredPrograms.map((program) => (
                    <Col lg={6} xl={4} key={program.id} className="mb-4">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="mb-1">{program.name}</h6>
                              <div className="d-flex gap-1 mb-2">
                                <Badge bg={getCategoryColor(program.category)}>
                                  {program.category.toUpperCase()}
                                </Badge>
                                <Badge bg={getDifficultyColor(program.difficulty)}>
                                  {program.difficulty.toUpperCase()}
                                </Badge>
                                {program.isRequired && (
                                  <Badge bg="danger">REQUIRED</Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-success fw-bold">${program.cost}</span>
                          </div>

                          <p className="text-muted small mb-3">{program.description}</p>

                          <Row className="text-center mb-3">
                            <Col xs={6}>
                              <div className="small text-muted">Duration</div>
                              <div className="fw-medium">{program.duration}h</div>
                            </Col>
                            <Col xs={6}>
                              <div className="small text-muted">Max Participants</div>
                              <div className="fw-medium">{program.maxParticipants}</div>
                            </Col>
                          </Row>

                          <div className="mb-3">
                            <div className="small text-muted mb-1">Instructor</div>
                            <div className="fw-medium">{program.instructor}</div>
                          </div>

                          <div className="mb-3">
                            <div className="small text-muted mb-1">Validity Period</div>
                            <div className="fw-medium">{program.validityPeriod} months</div>
                          </div>

                          {program.prerequisites.length > 0 && (
                            <div className="mb-3">
                              <div className="small text-muted mb-1">Prerequisites</div>
                              <div className="small">
                                {program.prerequisites.map((prereq, idx) => (
                                  <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                                    {prereq}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm" className="flex-fill">
                              <IconifyIcon icon="ri:eye-line" className="me-1" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => {
                                setEditingProgram(program);
                                resetProgram({
                                  name: program.name,
                                  description: program.description,
                                  category: program.category,
                                  duration: program.duration,
                                  difficulty: program.difficulty,
                                  isRequired: program.isRequired,
                                  validityPeriod: program.validityPeriod,
                                  instructor: program.instructor,
                                  maxParticipants: program.maxParticipants,
                                  cost: program.cost,
                                  materials: program.materials.join('\n'),
                                  prerequisites: program.prerequisites.join('\n')
                                });
                                setShowProgramModal(true);
                              }}
                            >
                              <IconifyIcon icon="ri:edit-line" />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab>

              <Tab eventKey="certifications" title="Certifications">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <Button variant="primary">
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Add Certification
                    </Button>
                    <Button variant="outline-warning">
                      <IconifyIcon icon="ri:alarm-warning-line" className="me-1" />
                      Send Renewal Reminders
                    </Button>
                  </div>
                </div>

                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Guard</th>
                          <th>Certification</th>
                          <th>Authority</th>
                          <th>Issue/Expiry Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certifications.map((cert) => (
                          <tr key={cert.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-success-subtle d-flex align-items-center justify-content-center me-2">
                                  <IconifyIcon icon="ri:award-line" className="text-success" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{cert.guardName}</h6>
                                  <small className="text-muted">ID: {cert.guardId}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{cert.certificationType}</div>
                                <small className="text-muted">#{cert.certificateNumber}</small>
                              </div>
                            </td>
                            <td>{cert.issuingAuthority}</td>
                            <td>
                              <div>
                                <div className="small">Issued: {cert.issueDate}</div>
                                <div className="small">Expires: {cert.expiryDate}</div>
                              </div>
                            </td>
                            <td>
                              <Badge bg={getStatusBadgeColor(cert.status)}>
                                {cert.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {cert.renewalRequired && (
                                <div className="mt-1">
                                  <Badge bg="warning" className="small">
                                    <IconifyIcon icon="ri:alarm-warning-line" className="me-1" />
                                    Renewal Required
                                  </Badge>
                                </div>
                              )}
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <IconifyIcon icon="ri:more-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                                    View Certificate
                                  </Dropdown.Item>
                                  {cert.documentUrl && (
                                    <Dropdown.Item>
                                      <IconifyIcon icon="ri:download-line" className="me-1" />
                                      Download Document
                                    </Dropdown.Item>
                                  )}
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                                    Mark as Renewed
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item className="text-danger">
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Remove
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="analytics" title="Training Analytics">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Training Completion Rates</h6>
                        {stats && (
                          <>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small">Basic Security Training</span>
                                <span className="small fw-medium">{Math.round(stats.completionRate)}%</span>
                              </div>
                              <ProgressBar now={stats.completionRate} variant="success" className="mb-2" />
                            </div>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small">Average Score</span>
                                <span className="small fw-medium">{Math.round(stats.averageScore)}%</span>
                              </div>
                              <ProgressBar now={stats.averageScore} variant="info" className="mb-2" />
                            </div>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Certification Status</h6>
                        <Row className="text-center">
                          <Col xs={6} className="mb-3">
                            <div className="fs-4 fw-bold text-success">{stats?.validCertifications || 0}</div>
                            <div className="small text-muted">Valid Certificates</div>
                          </Col>
                          <Col xs={6} className="mb-3">
                            <div className="fs-4 fw-bold text-warning">{stats?.expiringSoon || 0}</div>
                            <div className="small text-muted">Expiring Soon</div>
                          </Col>
                          <Col xs={6}>
                            <div className="fs-4 fw-bold text-danger">{stats?.expired || 0}</div>
                            <div className="small text-muted">Expired</div>
                          </Col>
                          <Col xs={6}>
                            <div className="fs-4 fw-bold text-info">{stats?.activePrograms || 0}</div>
                            <div className="small text-muted">Active Programs</div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {!stats && (
                  <Alert variant="info" className="text-center">
                    <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                    Loading training analytics and progress tracking data...
                  </Alert>
                )}
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Training Enrollment Modal */}
      <Modal show={showTrainingModal} onHide={() => setShowTrainingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTraining ? 'Update Training' : 'Enroll Guard in Training'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleTrainingSubmit(handleCreateTraining)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Select Guard</Form.Label>
              <Controller
                name="guardId"
                control={trainingControl}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={!!trainingErrors.guardId}>
                    <option value="">Choose Guard...</option>
                    {guards.map(guard => (
                      <option key={guard.id} value={guard.id}>
                        {guard.full_name || `${guard.first_name} ${guard.last_name}`}
                      </option>
                    ))}
                  </Form.Select>
                )}
              />
              {trainingErrors.guardId && (
                <Form.Control.Feedback type="invalid">
                  {trainingErrors.guardId.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Training Program</Form.Label>
              <Controller
                name="programId"
                control={trainingControl}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={!!trainingErrors.programId}>
                    <option value="">Choose Program...</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name} ({program.duration}h - ${program.cost})
                      </option>
                    ))}
                  </Form.Select>
                )}
              />
              {trainingErrors.programId && (
                <Form.Control.Feedback type="invalid">
                  {trainingErrors.programId.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Controller
                name="startDate"
                control={trainingControl}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    type="date" 
                    isInvalid={!!trainingErrors.startDate}
                  />
                )}
              />
              {trainingErrors.startDate && (
                <Form.Control.Feedback type="invalid">
                  {trainingErrors.startDate.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Controller
                name="notes"
                control={trainingControl}
                render={({ field }) => (
                  <Form.Control 
                    {...field} 
                    as="textarea" 
                    rows={3}
                    placeholder="Additional notes or special requirements"
                    isInvalid={!!trainingErrors.notes}
                  />
                )}
              />
              {trainingErrors.notes && (
                <Form.Control.Feedback type="invalid">
                  {trainingErrors.notes.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTrainingModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={!isTrainingValid || createTrainingMutation.isPending || updateTrainingMutation.isPending}
            >
              {createTrainingMutation.isPending || updateTrainingMutation.isPending ? (
                <>
                  <IconifyIcon icon="ri:loader-4-line" className="me-1 spin" />
                  {editingTraining ? 'Updating...' : 'Enrolling...'}
                </>
              ) : (
                editingTraining ? 'Update Training' : 'Enroll Guard'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Program Creation Modal */}
      <Modal show={showProgramModal} onHide={() => setShowProgramModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProgram ? 'Update Training Program' : 'Create New Training Program'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProgramSubmit(handleCreateProgram)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Controller
                  name="name"
                  control={programControl}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Program Name"
                      placeholder="Training program name"
                      containerClass="mb-3"
                      errors={programErrors}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="instructor"
                  control={programControl}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Instructor"
                      placeholder="Instructor name"
                      containerClass="mb-3"
                      errors={programErrors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Controller
              name="description"
              control={programControl}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Description"
                  placeholder="Detailed program description"
                  rows={3}
                  containerClass="mb-3"
                  errors={programErrors}
                />
              )}
            />

            <Row>
              <Col md={4}>
                <Controller
                  name="category"
                  control={programControl}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Category"
                      containerClass="mb-3"
                      errors={programErrors}
                    >
                      <option value="">Select Category</option>
                      <option value="security">Security</option>
                      <option value="safety">Safety</option>
                      <option value="technology">Technology</option>
                      <option value="communication">Communication</option>
                      <option value="emergency">Emergency</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="difficulty"
                  control={programControl}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Difficulty Level"
                      containerClass="mb-3"
                      errors={programErrors}
                    >
                      <option value="">Select Difficulty</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="duration"
                  control={programControl}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Duration (Hours)"
                      type="number"
                      placeholder="Duration in hours"
                      containerClass="mb-3"
                      errors={programErrors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Controller
                  name="validityPeriod"
                  control={programControl}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Validity Period (Months)"
                      type="number"
                      placeholder="Validity in months"
                      containerClass="mb-3"
                      errors={programErrors}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="maxParticipants"
                  control={programControl}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Max Participants"
                      type="number"
                      placeholder="Maximum participants"
                      containerClass="mb-3"
                      errors={programErrors}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="cost"
                  control={programControl}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Cost ($)"
                      type="number"
                      placeholder="Program cost"
                      containerClass="mb-3"
                      errors={programErrors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              label="This is a required training program"
              className="mb-3"
              onChange={(e) => {
                // This would be handled by the form control
              }}
            />

            <Controller
              name="materials"
              control={programControl}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Training Materials"
                  placeholder="Enter each material on a new line"
                  rows={3}
                  containerClass="mb-3"
                  errors={programErrors}
                />
              )}
            />

            <Controller
              name="prerequisites"
              control={programControl}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Prerequisites (Optional)"
                  placeholder="Enter each prerequisite on a new line"
                  rows={2}
                  containerClass="mb-3"
                  errors={programErrors}
                />
              )}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProgramModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={!isProgramValid || createProgramMutation.isPending || updateProgramMutation.isPending}
            >
              {createProgramMutation.isPending || updateProgramMutation.isPending ? (
                <>
                  <IconifyIcon icon="ri:loader-4-line" className="me-1 spin" />
                  {editingProgram ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingProgram ? 'Update Program' : 'Create Program'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default GuardTrainingPage;
