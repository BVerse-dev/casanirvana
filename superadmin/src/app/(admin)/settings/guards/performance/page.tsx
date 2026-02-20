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
  useGuardPerformances,
  usePerformanceReviews,
  usePerformanceStats,
  useCreatePerformanceReview,
  useUpdatePerformanceReview,
  useDeletePerformanceReview,
  useUpdateReviewStatus,
  useGuardPerformanceRealtime,
  type GuardPerformance,
  type PerformanceReview,
  type CreateReviewData,
} from '@/hooks/useGuardPerformance';
import { useListProfiles } from '@/hooks/useProfiles';

// Use types from hooks
type ReviewFormData = CreateReviewData;

const reviewSchema = yup.object().shape({
  guardId: yup.string().required('Guard is required'),
  overallRating: yup.number().min(1).max(5).required('Overall rating is required'),
  punctualityRating: yup.number().min(1).max(5).required('Punctuality rating is required'),
  professionalismRating: yup.number().min(1).max(5).required('Professionalism rating is required'),
  reliabilityRating: yup.number().min(1).max(5).required('Reliability rating is required'),
  communicationRating: yup.number().min(1).max(5).required('Communication rating is required'),
  strengths: yup.string().required('Strengths are required'),
  areasForImprovement: yup.string().required('Areas for improvement are required'),
  followUpDate: yup.string().required('Follow-up date is required'),
});

const GuardPerformancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [selectedGuard, setSelectedGuard] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  // Supabase hooks
  const { data: performances = [], isLoading: performancesLoading, error: performancesError } = useGuardPerformances();
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = usePerformanceReviews();
  const { data: stats, isLoading: statsLoading } = usePerformanceStats();
  const { data: guards = [], isLoading: guardsLoading } = useListProfiles({ role: 'guard' });
  
  // Mutations
  const createReviewMutation = useCreatePerformanceReview();
  const updateReviewMutation = useUpdatePerformanceReview();
  const deleteReviewMutation = useDeletePerformanceReview();
  const updateStatusMutation = useUpdateReviewStatus();

  // Real-time subscription
  useGuardPerformanceRealtime();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<ReviewFormData>({
    resolver: yupResolver(reviewSchema),
    mode: 'onChange',
  });

  // Loading and error states
  if (performancesLoading || reviewsLoading || guardsLoading) {
    return <FallbackLoading />;
  }

  if (performancesError || reviewsError) {
    return (
      <Alert variant="danger" className="m-4">
        <IconifyIcon icon="ri:error-warning-line" className="me-2" />
        Failed to load performance data. Please try again.
      </Alert>
    );
  }

  const handleCreateReview = (data: ReviewFormData) => {
    if (editingReview) {
      updateReviewMutation.mutate(
        { id: editingReview.id, reviewData: data },
        {
          onSuccess: () => {
            setShowReviewModal(false);
            setEditingReview(null);
            reset();
          },
        }
      );
    } else {
      createReviewMutation.mutate(data, {
        onSuccess: () => {
          setShowReviewModal(false);
          setEditingReview(null);
          reset();
        },
      });
    }
  };

  const getStatusBadgeColor = (status: GuardPerformance['status']) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'satisfactory': return 'info';
      case 'needs_improvement': return 'warning';
      case 'poor': return 'danger';
      default: return 'secondary';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'primary';
    if (rating >= 3.5) return 'info';
    if (rating >= 3.0) return 'warning';
    return 'danger';
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="d-flex align-items-center">
        {[...Array(fullStars)].map((_, i) => (
          <IconifyIcon key={i} icon="ri:star-fill" className={`text-warning ${size === 'md' ? 'fs-5' : ''}`} />
        ))}
        {hasHalfStar && (
          <IconifyIcon icon="ri:star-half-line" className={`text-warning ${size === 'md' ? 'fs-5' : ''}`} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <IconifyIcon key={i} icon="ri:star-line" className={`text-muted ${size === 'md' ? 'fs-5' : ''}`} />
        ))}
        <span className="ms-2 fw-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const filteredPerformances = performances.filter(performance => {
    const matchesSearch = performance.guardName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || performance.status === filterStatus;
    const matchesRating = filterRating === 'all' || 
      (filterRating === '4-5' && performance.overallRating >= 4) ||
      (filterRating === '3-4' && performance.overallRating >= 3 && performance.overallRating < 4) ||
      (filterRating === '2-3' && performance.overallRating >= 2 && performance.overallRating < 3) ||
      (filterRating === '1-2' && performance.overallRating >= 1 && performance.overallRating < 2);
    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <>
      <PageTitle 
        title="Guard Performance" 
        subName="Track performance metrics, ratings, and feedback"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="guard-performance" title="Guard Performance Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'overview')}
              className="mb-4"
            >
              <Tab eventKey="overview" title="Performance Overview">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingReview(null);
                        reset();
                        setShowReviewModal(true);
                      }}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      New Review
                    </Button>
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="ri:download-line" className="me-1" />
                      Export Report
                    </Button>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <InputGroup style={{ width: '300px' }}>
                      <Form.Control
                        type="text"
                        placeholder="Search guards..."
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
                      <option value="all">All Performance Levels</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="satisfactory">Satisfactory</option>
                      <option value="needs_improvement">Needs Improvement</option>
                      <option value="poor">Poor</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                    >
                      <option value="all">All Ratings</option>
                      <option value="4-5">4.0 - 5.0</option>
                      <option value="3-4">3.0 - 3.9</option>
                      <option value="2-3">2.0 - 2.9</option>
                      <option value="1-2">1.0 - 1.9</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row>
                  {filteredPerformances.map((performance) => (
                    <Col lg={6} xl={4} key={performance.id} className="mb-4">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div className="avatar-md rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-3">
                              <IconifyIcon icon="ri:user-line" className="fs-24 text-primary" />
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-0">{performance.guardName}</h6>
                              <Badge bg={getStatusBadgeColor(performance.status)} className="small">
                                {performance.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small text-muted">Overall Rating</span>
                              <span className="fw-medium">{performance.overallRating.toFixed(1)}/5.0</span>
                            </div>
                            <ProgressBar 
                              now={(performance.overallRating / 5) * 100} 
                              variant={getRatingColor(performance.overallRating)}
                              className="mb-2"
                            />
                            {renderStarRating(performance.overallRating)}
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small text-muted">Attendance</span>
                              <span className="fw-medium">{performance.attendancePercentage}%</span>
                            </div>
                            <ProgressBar 
                              now={performance.attendancePercentage} 
                              variant={performance.attendancePercentage >= 90 ? 'success' : performance.attendancePercentage >= 80 ? 'warning' : 'danger'}
                            />
                          </div>

                          <Row className="text-center mb-3">
                            <Col xs={6}>
                              <div className="small text-muted">Completed Shifts</div>
                              <div className="fw-medium">{performance.completedShifts}/{performance.totalShifts}</div>
                            </Col>
                            <Col xs={6}>
                              <div className="small text-muted">Late Arrivals</div>
                              <div className="fw-medium text-warning">{performance.lateArrivals}</div>
                            </Col>
                          </Row>

                          <Row className="text-center mb-3">
                            <Col xs={4}>
                              <div className="small text-success">
                                <IconifyIcon icon="ri:thumb-up-line" className="me-1" />
                                {performance.compliments}
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="small text-danger">
                                <IconifyIcon icon="ri:thumb-down-line" className="me-1" />
                                {performance.complaints}
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="small text-warning">
                                <IconifyIcon icon="ri:alert-line" className="me-1" />
                                {performance.incidentReports}
                              </div>
                            </Col>
                          </Row>

                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm" className="flex-fill">
                              <IconifyIcon icon="ri:eye-line" className="me-1" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => {
                                setEditingReview(null);
                                reset({ guardId: performance.guardId });
                                setShowReviewModal(true);
                              }}
                            >
                              <IconifyIcon icon="ri:add-line" />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab>

              <Tab eventKey="reviews" title="Performance Reviews">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Performance Reviews</h5>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingReview(null);
                      reset();
                      setShowReviewModal(true);
                    }}
                  >
                    <IconifyIcon icon="ri:add-line" className="me-1" />
                    New Review
                  </Button>
                </div>

                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Guard</th>
                          <th>Review Date</th>
                          <th>Reviewer</th>
                          <th>Overall Rating</th>
                          <th>Status</th>
                          <th>Follow-up</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((review) => (
                          <tr key={review.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                                  <IconifyIcon icon="ri:user-line" className="text-primary" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{review.guardName}</h6>
                                  <small className="text-muted">ID: {review.guardId}</small>
                                </div>
                              </div>
                            </td>
                            <td>{review.reviewDate}</td>
                            <td>{review.reviewerName}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {renderStarRating(review.overallRating)}
                              </div>
                            </td>
                            <td>
                              <Badge bg={review.status === 'completed' ? 'success' : review.status === 'acknowledged' ? 'info' : 'warning'}>
                                {review.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td>{review.followUpDate}</td>
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
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:download-line" className="me-1" />
                                    Download PDF
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

              <Tab eventKey="analytics" title="Analytics">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Performance Distribution</h6>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">Excellent (4.5-5.0)</span>
                            <span className="small fw-medium">
                              {stats?.totalGuards ? Math.round((stats.performanceDistribution.excellent / stats.totalGuards) * 100) : 0}%
                            </span>
                          </div>
                          <ProgressBar 
                            now={stats?.totalGuards ? (stats.performanceDistribution.excellent / stats.totalGuards) * 100 : 0} 
                            variant="success" 
                            className="mb-2" 
                          />
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">Good (4.0-4.4)</span>
                            <span className="small fw-medium">
                              {stats?.totalGuards ? Math.round((stats.performanceDistribution.good / stats.totalGuards) * 100) : 0}%
                            </span>
                          </div>
                          <ProgressBar 
                            now={stats?.totalGuards ? (stats.performanceDistribution.good / stats.totalGuards) * 100 : 0} 
                            variant="primary" 
                            className="mb-2" 
                          />
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">Needs Improvement (3.0-3.9)</span>
                            <span className="small fw-medium">
                              {stats?.totalGuards ? Math.round((stats.performanceDistribution.needsImprovement / stats.totalGuards) * 100) : 0}%
                            </span>
                          </div>
                          <ProgressBar 
                            now={stats?.totalGuards ? (stats.performanceDistribution.needsImprovement / stats.totalGuards) * 100 : 0} 
                            variant="warning" 
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Key Metrics</h6>
                        <Row className="text-center">
                          <Col xs={6} className="mb-3">
                            <div className="fs-4 fw-bold text-primary">{stats?.averageRating || 0}</div>
                            <div className="small text-muted">Average Rating</div>
                          </Col>
                          <Col xs={6} className="mb-3">
                            <div className="fs-4 fw-bold text-success">{stats?.averageAttendance || 0}%</div>
                            <div className="small text-muted">Average Attendance</div>
                          </Col>
                          <Col xs={6}>
                            <div className="fs-4 fw-bold text-info">{stats?.totalCompliments || 0}</div>
                            <div className="small text-muted">Total Compliments</div>
                          </Col>
                          <Col xs={6}>
                            <div className="fs-4 fw-bold text-warning">{stats?.totalComplaints || 0}</div>
                            <div className="small text-muted">Total Complaints</div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Alert variant="info" className="text-center">
                  <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                  Detailed analytics charts and trends would be implemented here
                </Alert>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingReview ? 'Edit Performance Review' : 'Create Performance Review'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateReview)}>
          <Modal.Body>
            <Controller
              name="guardId"
              control={control}
              render={({ field }) => (
                <Form.Group className="mb-3">
                  <Form.Label>Select Guard</Form.Label>
                  <Form.Select {...field}>
                    <option value="">Choose Guard...</option>
                    {guards.map((guard) => (
                      <option key={guard.id} value={guard.id}>
                        {guard.first_name} {guard.last_name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.guardId && (
                    <Form.Text className="text-danger">{errors.guardId.message}</Form.Text>
                  )}
                </Form.Group>
              )}
            />

            <Row>
              <Col md={6}>
                <Controller
                  name="overallRating"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Overall Rating</Form.Label>
                      <Form.Select 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Select Rating...</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Satisfactory</option>
                        <option value="2">2 - Needs Improvement</option>
                        <option value="1">1 - Poor</option>
                      </Form.Select>
                      {errors.overallRating && (
                        <Form.Text className="text-danger">{errors.overallRating.message}</Form.Text>
                      )}
                    </Form.Group>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="punctualityRating"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Punctuality Rating</Form.Label>
                      <Form.Select 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Select Rating...</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Satisfactory</option>
                        <option value="2">2 - Needs Improvement</option>
                        <option value="1">1 - Poor</option>
                      </Form.Select>
                      {errors.punctualityRating && (
                        <Form.Text className="text-danger">{errors.punctualityRating.message}</Form.Text>
                      )}
                    </Form.Group>
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="professionalismRating"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Professionalism Rating</Form.Label>
                      <Form.Select 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Select Rating...</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Satisfactory</option>
                        <option value="2">2 - Needs Improvement</option>
                        <option value="1">1 - Poor</option>
                      </Form.Select>
                      {errors.professionalismRating && (
                        <Form.Text className="text-danger">{errors.professionalismRating.message}</Form.Text>
                      )}
                    </Form.Group>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="reliabilityRating"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Reliability Rating</Form.Label>
                      <Form.Select 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Select Rating...</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Satisfactory</option>
                        <option value="2">2 - Needs Improvement</option>
                        <option value="1">1 - Poor</option>
                      </Form.Select>
                      {errors.reliabilityRating && (
                        <Form.Text className="text-danger">{errors.reliabilityRating.message}</Form.Text>
                      )}
                    </Form.Group>
                  )}
                />
              </Col>
            </Row>

            <Controller
              name="communicationRating"
              control={control}
              render={({ field }) => (
                <Form.Group className="mb-3">
                  <Form.Label>Communication Rating</Form.Label>
                  <Form.Select 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <option value="">Select Rating...</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Satisfactory</option>
                    <option value="2">2 - Needs Improvement</option>
                    <option value="1">1 - Poor</option>
                  </Form.Select>
                  {errors.communicationRating && (
                    <Form.Text className="text-danger">{errors.communicationRating.message}</Form.Text>
                  )}
                </Form.Group>
              )}
            />

            <Controller
              name="strengths"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Strengths"
                  placeholder="List the guard's key strengths and positive attributes"
                  rows={3}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />

            <Controller
              name="areasForImprovement"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Areas for Improvement"
                  placeholder="Identify areas where the guard can improve"
                  rows={3}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />

            <Controller
              name="goals"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Goals (Optional)"
                  placeholder="Set specific goals for the next review period"
                  rows={2}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />

            <Controller
              name="actionPlan"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Action Plan (Optional)"
                  placeholder="Specific actions to help guard improve performance"
                  rows={2}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />

            <Row>
              <Col md={6}>
                <Controller
                  name="followUpDate"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Follow-up Date"
                      type="date"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Additional Comments (Optional)"
                  placeholder="Any additional comments or observations"
                  rows={3}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!isValid}>
              {editingReview ? 'Update Review' : 'Create Review'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default GuardPerformancePage;
