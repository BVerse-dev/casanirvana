'use client';

import { useState, useMemo } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, Pagination } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { useActivityLogs, useActivityStats, useExportActivityLogs } from '@/hooks/useActivityLogs';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string;
  user_role: string;
  action: string;
  action_type: string;
  resource: string;
  resource_id?: string | null;
  details: string;
  ip_address: string;
  user_agent: string;
  location?: string | null;
  timestamp: string;
  status: string;
  severity: string;
  metadata?: Record<string, any> | null;
}

interface ActivityFilter {
  dateRange: string;
  actionType: string;
  status: string;
  severity: string;
  userId: string;
  searchTerm: string;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

const actionTypeOptions = [
  { value: 'all', label: 'All Actions', icon: 'material-symbols:list' },
  { value: 'login', label: 'Login/Logout', icon: 'material-symbols:login' },
  { value: 'create', label: 'Create', icon: 'material-symbols:add' },
  { value: 'update', label: 'Update', icon: 'material-symbols:edit' },
  { value: 'delete', label: 'Delete', icon: 'material-symbols:delete' },
  { value: 'view', label: 'View', icon: 'material-symbols:visibility' },
  { value: 'export', label: 'Export', icon: 'material-symbols:download' },
  { value: 'security', label: 'Security', icon: 'material-symbols:security' },
  { value: 'system', label: 'System', icon: 'material-symbols:settings' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'warning', label: 'Warning' }
];

const severityOptions = [
  { value: 'all', label: 'All Severity' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom Range' }
];

export default function UserActivityPage() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  // Initialize with 'all' dateRange to show all logs regardless of timestamp
  const [filters, setFilters] = useState<ActivityFilter>({
    dateRange: 'all',
    actionType: 'all',
    status: 'all',
    severity: 'all',
    userId: 'all',
    searchTerm: ''
  });
  const [activeTab, setActiveTab] = useState('timeline');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 5
  });
  // Debug mode state
  const [debugMode, setDebugMode] = useState(false);

  const { handleSubmit } = useForm();

  // Use Supabase hooks
  const { 
    data: activityLogs = [], 
    isLoading: isLoadingLogs, 
    error: logsError 
  } = useActivityLogs({
    ...filters,
    limit: pagination.itemsPerPage,
    offset: (pagination.currentPage - 1) * pagination.itemsPerPage
  });

    // Enhanced debug activity logs data
  console.log('%c ACTIVITY LOGS COMPONENT DEBUG INFO:', 'background: #3498db; color: white; font-weight: bold;');
  console.log('Activity logs data:', activityLogs);
  console.log('Number of logs:', activityLogs?.length || 0);
  console.log('Loading state:', isLoadingLogs);
  console.log('Error state:', logsError);
  console.log('Current filters:', filters);
  console.log('Pagination:', pagination);

  const { 
    data: activityStats, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useActivityStats();
  
  // Debug activity stats
  console.log('Activity stats in component:', activityStats);
  console.log('Loading stats:', isLoadingStats);
  console.log('Stats error:', statsError);

  const exportMutation = useExportActivityLogs();

  // Use the fetched data for filtering display
  const filteredLogs = activityLogs;

  const updateFilter = (key: keyof ActivityFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const openDetailsModal = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'danger';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'dark';
      default: return 'secondary';
    }
  };

  const getActionIcon = (actionType: string) => {
    const action = actionTypeOptions.find(a => a.value === actionType);
    return action ? action.icon : 'material-symbols:history';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Handle export with real data
  const handleExport = async () => {
    try {
      const data = await exportMutation.mutateAsync(filters);
      
      const csvData = data.map(log => ({
        Timestamp: formatTimestamp(log.timestamp),
        User: log.user_name,
        Role: log.user_role,
        Action: log.action,
        Type: log.action_type,
        Resource: log.resource,
        Status: log.status,
        Severity: log.severity,
        Details: log.details,
        IP: log.ip_address,
        Location: log.location || 'Unknown'
      }));
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Pagination logic - now handled at API level
  const paginatedLogs = filteredLogs; // Data is already paginated from API

  // Calculate total pages based on total count from stats
  const totalCount = activityStats?.total || 0;
  const totalPages = Math.ceil(totalCount / pagination.itemsPerPage);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination({ currentPage: 1, itemsPerPage });
  };

  // Pagination component
  const PaginationControls = ({ className = "" }: { className?: string }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      
      for (let i = Math.max(2, pagination.currentPage - delta); 
           i <= Math.min(totalPages - 1, pagination.currentPage + delta); 
           i++) {
        range.push(i);
      }
      
      if (pagination.currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }
      
      rangeWithDots.push(...range);
      
      if (pagination.currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }
      
      return rangeWithDots;
    };

    return (
      <div className={`d-flex justify-content-between align-items-center ${className}`}>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Items per page:</small>
          <Form.Select 
            size="sm" 
            style={{ width: 'auto' }}
            value={pagination.itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Form.Select>
          <small className="text-muted">
            {filteredLogs.length === 0 ? (
              "No entries to show"
            ) : (
              <>
                Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, filteredLogs.length)} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredLogs.length)} of{' '}
                {filteredLogs.length} entries
              </>
            )}
          </small>
        </div>
        
        <Pagination size="sm" className="mb-0">
          <Pagination.Prev 
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          />
          
          {getVisiblePages().map((page, index) => (
            <span key={index}>
              {page === '...' ? (
                <Pagination.Ellipsis disabled />
              ) : (
                <Pagination.Item
                  active={page === pagination.currentPage}
                  onClick={() => handlePageChange(page as number)}
                >
                  {page}
                </Pagination.Item>
              )}
            </span>
          ))}
          
          <Pagination.Next 
            disabled={pagination.currentPage === totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          />
        </Pagination>
      </div>
    );
  };

  // Empty state component
  const EmptyStateDisplay = () => {
    return (
      <div className="text-center p-5 bg-light rounded">
        <IconifyIcon icon="material-symbols:search-off" className="fs-1 text-muted mb-3" />
        <h5>No Activity Logs Found</h5>
        <p className="text-muted mb-4">
          {logsError ? (
            <>
              Error loading activity logs. Please try refreshing the page.
              {debugMode && <div className="text-danger small mt-2">{String(logsError)}</div>}
            </>
          ) : (
            <>
              No activity logs match your current filter criteria. Try adjusting your filters or time range.
            </>
          )}
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setFilters({
                dateRange: 'all',
                actionType: 'all',
                status: 'all',
                severity: 'all',
                userId: 'all',
                searchTerm: ''
              });
            }}
          >
            <IconifyIcon icon="material-symbols:filter-alt-off" className="me-1" />
            Reset Filters
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <IconifyIcon icon="material-symbols:refresh" className="me-1" />
            Refresh Page
          </Button>
        </div>
        {debugMode && (
          <div className="mt-4">
            <Alert variant="info" className="text-start">
              <h6>Debugging Information</h6>
              <p className="mb-1 small">Check the following:</p>
              <ul className="small mb-0">
                <li>RLS policies on the activity_logs table</li>
                <li>User role in auth.users (should be 'super_admin')</li>
                <li>The RPC function 'get_all_activity_logs' exists</li>
                <li>Actual data exists in the activity_logs table</li>
              </ul>
            </Alert>
          </div>
        )}
      </div>
    );
  };

  // Toggle debug mode
  const toggleDebugMode = () => setDebugMode(!debugMode);

  return (
    <>
      <PageTitle title="User Activity Logs" subName="Settings" />
      
      <ComponentContainerCard 
        id="user-activity"
        title="Activity Monitoring"
        description="Track user activities, security events, and system operations across your community management platform"
      >
        {/* Debug Panel */}
        {debugMode && (
          <Alert variant="warning" className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Debug Mode Active</h5>
              <Button variant="outline-dark" size="sm" onClick={toggleDebugMode}>Close</Button>
            </div>
            
            <div className="row g-3">
              <div className="col-md-6">
                <h6>Activity Stats</h6>
                <pre className="bg-light p-2 rounded" style={{fontSize: '0.8rem'}}>
                  {JSON.stringify(activityStats || {}, null, 2)}
                </pre>
              </div>
              <div className="col-md-6">
                <h6>Current Filters</h6>
                <pre className="bg-light p-2 rounded" style={{fontSize: '0.8rem'}}>
                  {JSON.stringify({
                    filters,
                    pagination,
                    totalCount: activityStats?.total || 0,
                    logsLoaded: activityLogs?.length || 0
                  }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => {
                  setFilters({
                    dateRange: 'all',
                    actionType: 'all',
                    status: 'all',
                    severity: 'all',
                    userId: 'all',
                    searchTerm: ''
                  });
                }}
              >
                Reset All Filters
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading State */}
        {(isLoadingLogs || isLoadingStats) && (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading activity data...</p>
          </div>
        )}

        {/* Error State */}
        {(logsError || statsError) && (
          <Alert variant="danger">
            <IconifyIcon icon="material-symbols:error" className="me-2" />
            Error loading activity data. Please try again.
          </Alert>
        )}

        {/* Show main content only when not loading */}
        {!isLoadingLogs && !isLoadingStats && !logsError && !statsError && (
          <>
            {/* Statistics Cards */}
            {activityStats && (
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="border-0 bg-primary bg-opacity-10">
                    <Card.Body className="text-center">
                      <IconifyIcon icon="material-symbols:timeline" className="fs-1 text-primary mb-2" />
                      <h4 className="mb-1">{activityStats.total || 0}</h4>
                      <p className="text-muted mb-0">Total Activities</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 bg-info bg-opacity-10">
                    <Card.Body className="text-center">
                      <IconifyIcon icon="material-symbols:today" className="fs-1 text-info mb-2" />
                      <h4 className="mb-1">{activityStats.today || 0}</h4>
                      <p className="text-muted mb-0">Today&apos;s Activities</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 bg-danger bg-opacity-10">
                    <Card.Body className="text-center">
                      <IconifyIcon icon="material-symbols:error" className="fs-1 text-danger mb-2" />
                      <h4 className="mb-1">{activityStats.failed || 0}</h4>
                      <p className="text-muted mb-0">Failed Actions</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 bg-warning bg-opacity-10">
                    <Card.Body className="text-center">
                      <IconifyIcon icon="material-symbols:priority-high" className="fs-1 text-warning mb-2" />
                      <h4 className="mb-1">{activityStats.critical || 0}</h4>
                      <p className="text-muted mb-0">Critical Events</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
            
            {/* Debug Panel */}
            {debugMode && (
              <Alert variant="warning" className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Debug Mode Active</h5>
                  <Button variant="outline-dark" size="sm" onClick={toggleDebugMode}>Close</Button>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6>Activity Stats</h6>
                    <pre className="bg-light p-2 rounded" style={{fontSize: '0.8rem'}}>
                      {JSON.stringify(activityStats || {}, null, 2)}
                    </pre>
                  </div>
                  <div className="col-md-6">
                    <h6>Current Filters</h6>
                    <pre className="bg-light p-2 rounded" style={{fontSize: '0.8rem'}}>
                      {JSON.stringify({
                        filters,
                        pagination,
                        totalCount: activityStats?.total || 0,
                        logsLoaded: activityLogs?.length || 0
                      }, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      setFilters({
                        dateRange: 'all',
                        actionType: 'all',
                        status: 'all',
                        severity: 'all',
                        userId: 'all',
                        searchTerm: ''
                      });
                    }}
                  >
                    Reset All Filters
                  </Button>
                </div>
              </Alert>
            )}

        {/* Filters */}
        <Card className="mb-4 border-0 bg-light">
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label className="small fw-semibold text-muted">DATE RANGE</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-semibold text-muted">ACTION TYPE</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.actionType}
                  onChange={(e) => updateFilter('actionType', e.target.value)}
                >
                  {actionTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-semibold text-muted">STATUS</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-semibold text-muted">SEVERITY</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.severity}
                  onChange={(e) => updateFilter('severity', e.target.value)}
                >
                  {severityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-semibold text-muted">SEARCH</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <IconifyIcon icon="material-symbols:search" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search activities..."
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Activity Results */}
        {!isLoadingLogs && !logsError && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">
                Found {activityLogs.length} activities
              </span>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                >
                  <IconifyIcon icon="material-symbols:download" className="me-1" />
                  {exportMutation.isPending ? 'Exporting...' : 'Export'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <IconifyIcon icon="material-symbols:refresh" className="me-1" />
                  Refresh
                </Button>
                <Button 
                  variant={debugMode ? "warning" : "outline-dark"}
                  size="sm"
                  onClick={toggleDebugMode}
                >
                  <IconifyIcon icon="material-symbols:bug-report" className="me-1" />
                  Debug {debugMode ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'timeline')} className="mb-4">
              <Tab eventKey="timeline" title="Timeline View">
                <div className="activity-timeline position-relative" style={{ marginLeft: '20px' }}>
                  {isLoadingLogs ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading activity logs...</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <EmptyStateDisplay />
                  ) : (
                    paginatedLogs.map((log, index) => (
                      <div key={log.id} className="timeline-item position-relative mb-4" style={{ paddingLeft: '50px' }}>
                        {/* Timeline line - continuous vertical line on the left */}
                        {index < paginatedLogs.length - 1 && (
                          <div 
                            className="position-absolute"
                            style={{ 
                              width: '2px', 
                              height: 'calc(100% + 1rem)', 
                              left: '19px', 
                              top: '20px',
                              backgroundColor: '#dee2e6'
                            }}
                          ></div>
                        )}
                        
                        {/* Timeline marker - colored circle positioned on the line */}
                        <div 
                          className={`position-absolute rounded-circle d-flex align-items-center justify-content-center shadow-sm ${
                            log.status === 'failed' ? 'bg-danger' : 
                            log.severity === 'critical' ? 'bg-warning' : 'bg-primary'
                          }`}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            left: '0', 
                            top: '0',
                            color: 'white',
                            border: '3px solid #fff',
                            zIndex: 2
                          }}
                        >
                          <IconifyIcon icon={getActionIcon(log.action_type)} />
                        </div>
                        
                        {/* Content card */}
                        <div className="ms-3">
                          <Card className="border-0 shadow-sm">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1 me-2" style={{ minWidth: 0 }}>
                                  <h6 className="mb-1 text-truncate">{log.action}</h6>
                                  <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                    <Badge bg="light" text="dark">{log.user_name}</Badge>
                                    <Badge bg="light" text="dark">{log.user_role}</Badge>
                                    <Badge bg={getStatusColor(log.status)}>{log.status}</Badge>
                                    <Badge bg={getSeverityColor(log.severity)}>{log.severity}</Badge>
                                  </div>
                                </div>
                                <div className="text-end flex-shrink-0">
                                  <small className="text-muted d-block mb-1">{getRelativeTime(log.timestamp)}</small>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => openDetailsModal(log)}
                                  >
                                    Details
                                  </Button>
                                </div>
                              </div>
                              <p className="text-muted mb-2" style={{ wordBreak: 'break-word' }}>{log.details}</p>
                              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div className="d-flex flex-wrap gap-3">
                                  <small className="text-muted text-nowrap">
                                    <IconifyIcon icon="material-symbols:computer" className="me-1" />
                                    {log.ip_address}
                                  </small>
                                  {log.location && (
                                    <small className="text-muted text-nowrap">
                                      <IconifyIcon icon="material-symbols:location-on" className="me-1" />
                                      {log.location}
                                    </small>
                                  )}
                                </div>
                                <small className="text-muted text-nowrap">{formatTimestamp(log.timestamp)}</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Timeline Pagination */}
                <PaginationControls className="mt-4" />
              </Tab>

          <Tab eventKey="table" title="Table View">
            {paginatedLogs.length === 0 ? (
              <EmptyStateDisplay />
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>IP Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>
                        <div className="fw-semibold small">{formatTimestamp(log.timestamp)}</div>
                        <small className="text-muted">{getRelativeTime(log.timestamp)}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{log.user_name}</div>
                        <small className="text-muted">{log.user_role}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon={getActionIcon(log.action_type)} className="me-2" />
                        <div>
                          <div className="fw-semibold">{log.action}</div>
                          <small className="text-muted">{log.action_type}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{log.resource}</div>
                        {log.resource_id && (
                          <small className="text-muted">{log.resource_id}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="text-muted small">{log.ip_address}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => openDetailsModal(log)}
                      >
                        <IconifyIcon icon="material-symbols:visibility" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            )}
            
            {/* Table Pagination */}
            <PaginationControls className="mt-4" />
          </Tab>

          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Activity Types</h6>
                  </Card.Header>
                  <Card.Body>
                    {activityStats && Object.entries(activityStats.byActionType).map(([type, count]) => (
                      <div key={type} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon={getActionIcon(type)} className="me-2" />
                          <span className="text-capitalize">{type.replace('_', ' ')}</span>
                        </div>
                        <Badge bg="light" text="dark">{String(count)}</Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Status Distribution</h6>
                  </Card.Header>
                  <Card.Body>
                    {activityStats && Object.entries(activityStats.byStatus).map(([status, count]) => (
                      <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <Badge bg={getStatusColor(status)} className="me-2">{status}</Badge>
                        </div>
                        <span>{String(count)} activities</span>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
          </>
        )}
        </>
        )}
      </ComponentContainerCard>

      {/* Activity Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Activity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Basic Information</h6>
                      <div className="mb-2">
                        <strong>Action:</strong> {selectedLog.action}
                      </div>
                      <div className="mb-2">
                        <strong>Type:</strong> 
                        <Badge bg="light" text="dark" className="ms-2">
                          {selectedLog.action_type}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <strong>Resource:</strong> {selectedLog.resource}
                        {selectedLog.resource_id && (
                          <code className="ms-2 small">{selectedLog.resource_id}</code>
                        )}
                      </div>
                      <div className="mb-2">
                        <strong>Status:</strong> 
                        <Badge bg={getStatusColor(selectedLog.status)} className="ms-2">
                          {selectedLog.status}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <strong>Severity:</strong> 
                        <Badge bg={getSeverityColor(selectedLog.severity)} className="ms-2">
                          {selectedLog.severity}
                        </Badge>
                      </div>
                      <div>
                        <strong>Timestamp:</strong> {formatTimestamp(selectedLog.timestamp)}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-3">User Information</h6>
                      <div className="mb-2">
                        <strong>User:</strong> {selectedLog.user_name}
                      </div>
                      <div className="mb-2">
                        <strong>Role:</strong> {selectedLog.user_role}
                      </div>
                      <div className="mb-2">
                        <strong>IP Address:</strong> 
                        <code className="ms-2">{selectedLog.ip_address}</code>
                      </div>
                      {selectedLog.location && (
                        <div className="mb-2">
                          <strong>Location:</strong> {selectedLog.location}
                        </div>
                      )}
                      <div>
                        <strong>User Agent:</strong>
                        <small className="d-block text-muted mt-1">
                          {selectedLog.user_agent}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h6 className="text-muted mb-3">Activity Details</h6>
                  <p>{selectedLog.details}</p>
                  
                  {selectedLog.metadata && (
                    <div>
                      <h6 className="text-muted mb-2">Additional Metadata</h6>
                      <pre className="bg-white p-3 rounded border">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
