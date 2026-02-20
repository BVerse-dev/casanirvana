'use client';

import React, { useState } from 'react';
import { useListCommunities } from "@/hooks/useCommunities";
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, Calendar } from 'react-bootstrap';
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

// Hooks
import {
  useGuardSchedules,
  useShiftPatterns,
  useSchedulesByDate,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCreateShiftPattern,
  useGuardSchedulesRealtime,
  type GuardSchedule,
  type ShiftPattern,
  type CreateScheduleData,
} from '@/hooks/useGuardSchedules';
import { useListGuards } from '@/hooks/useGuards';

interface ScheduleFormData {
  guardId: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  assignedDate: string;
  endDate: string;
  communityId: string;
  postLocation: string;
  notes: string;
}

const scheduleSchema = yup.object().shape({
  guardId: yup.string().required('Guard is required'),
  shiftType: yup.string().required('Shift type is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  assignedDate: yup.string().required('Assignment date is required'),
  communityId: yup.string().required('Community is required'),
  postLocation: yup.string().required('Post location is required'),
});

const GuardSchedulesPage = () => {
  const [activeTab, setActiveTab] = useState('schedules');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<GuardSchedule | null>(null);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShiftType, setFilterShiftType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarView, setCalendarView] = useState<'today' | 'week' | 'month'>('month');

  // Real data hooks
  const { data: schedules = [], isLoading: schedulesLoading, error: schedulesError } = useGuardSchedules();
  const { data: shiftPatterns = [], isLoading: patternsLoading, error: patternsError } = useShiftPatterns();
  const { data: todaySchedules = [] } = useSchedulesByDate(selectedDate);
  const { data: guards = [], isLoading: guardsLoading } = useListGuards();
  const { data: communitiesResponse, isLoading: communitiesLoading } = useListCommunities();

  // Extract communities data from the response
  const communities = communitiesResponse?.data || [];

  // Mutations
  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const createPatternMutation = useCreateShiftPattern();

  // Setup real-time subscriptions
  useGuardSchedulesRealtime();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ScheduleFormData>({
    resolver: yupResolver(scheduleSchema),
    mode: 'onChange',
  });

  // Event handlers
  const handleCreateSchedule = async (data: ScheduleFormData) => {
    const scheduleData: CreateScheduleData = {
      guardId: data.guardId,
      shiftType: data.shiftType as any,
      startTime: data.startTime,
      endTime: data.endTime,
      assignedDate: data.assignedDate,
      endDate: data.endDate || undefined,
      communityId: data.communityId,
      postLocation: data.postLocation,
      notes: data.notes || undefined,
    };

    try {
      if (editingSchedule) {
        await updateScheduleMutation.mutateAsync({
          id: editingSchedule.id,
          scheduleData,
        });
      } else {
        await createScheduleMutation.mutateAsync(scheduleData);
      }

      setShowScheduleModal(false);
      setEditingSchedule(null);
      reset();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: GuardSchedule) => {
    setEditingSchedule(schedule);
    reset({
      guardId: schedule.guardId,
      shiftType: schedule.shiftType,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      assignedDate: schedule.assignedDate,
      endDate: schedule.endDate || '',
      communityId: schedule.communityId,
      postLocation: schedule.postLocation,
      notes: schedule.notes || '',
    });
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteScheduleMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  // Loading and error states
  if (schedulesLoading || patternsLoading || guardsLoading || communitiesLoading) {
    return (
      <>
        <PageTitle 
          title="Guard Schedules & Shifts" 
          subName="Manage work schedules, shift patterns, and duty assignments"
        />
        <Row>
          <Col xs={12}>
            <ComponentContainerCard id="guard-schedules" title="Guard Schedules & Shifts Management">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading schedules data...</p>
              </div>
            </ComponentContainerCard>
          </Col>
        </Row>
      </>
    );
  }

  if (schedulesError || patternsError) {
    return (
      <>
        <PageTitle 
          title="Guard Schedules & Shifts" 
          subName="Manage work schedules, shift patterns, and duty assignments"
        />
        <Row>
          <Col xs={12}>
            <ComponentContainerCard id="guard-schedules" title="Guard Schedules & Shifts Management">
              <Alert variant="danger">
                <h6>Error Loading Data</h6>
                <p className="mb-0">
                  {schedulesError?.message || patternsError?.message || 'Failed to load schedules data. Please try again.'}
                </p>
              </Alert>
            </ComponentContainerCard>
          </Col>
        </Row>
      </>
    );
  }

  // Utility functions
  const getStatusBadgeColor = (status: GuardSchedule['status']) => {
    switch (status) {
      case 'scheduled': return 'warning';
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      case 'no_show': return 'dark';
      default: return 'secondary';
    }
  };

  const getShiftTypeColor = (shiftType: GuardSchedule['shiftType']) => {
    switch (shiftType) {
      case 'day': return 'primary';
      case 'night': return 'dark';
      case 'rotating': return 'info';
      case 'split': return 'warning';
      default: return 'secondary';
    }
  };

  // Calendar helper functions
  const generateCalendarDays = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Fallback to current date if invalid
        const fallbackDate = new Date();
        const year = fallbackDate.getFullYear();
        const month = fallbackDate.getMonth();
        return generateCalendarDaysForMonth(year, month);
      }
      
      const year = date.getFullYear();
      const month = date.getMonth();
      return generateCalendarDaysForMonth(year, month);
    } catch (error) {
      console.error('Error generating calendar days:', error);
      // Return current month as fallback
      const now = new Date();
      return generateCalendarDaysForMonth(now.getFullYear(), now.getMonth());
    }
  };

  const generateCalendarDaysForMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push({
        date: currentDate.toISOString().split('T')[0],
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const generateWeekDays = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Fallback to current date if invalid
        const fallbackDate = new Date();
        return generateWeekDaysFromDate(fallbackDate);
      }
      
      return generateWeekDaysFromDate(date);
    } catch (error) {
      console.error('Error generating week days:', error);
      // Return current week as fallback
      return generateWeekDaysFromDate(new Date());
    }
  };

  const generateWeekDaysFromDate = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push({
        date: currentDay.toISOString().split('T')[0],
        day: currentDay.getDate(),
        dayName: currentDay.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const getSchedulesForDate = (dateString: string) => {
    if (!schedules || !Array.isArray(schedules)) {
      return [];
    }
    
    try {
      return schedules.filter(schedule => {
        if (!schedule || !schedule.date) {
          return false;
        }
        
        try {
          const scheduleDate = new Date(schedule.date);
          if (isNaN(scheduleDate.getTime())) {
            return false;
          }
          
          const scheduleDateString = scheduleDate.toISOString().split('T')[0];
          return scheduleDateString === dateString;
        } catch (error) {
          console.error('Error parsing schedule date:', schedule.date, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error filtering schedules for date:', dateString, error);
      return [];
    }
  };

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.communityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.postLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    const matchesShiftType = filterShiftType === 'all' || schedule.shiftType === filterShiftType;
    return matchesSearch && matchesStatus && matchesShiftType;
  });

  return (
    <>
      <PageTitle 
        title="Guard Schedules & Shifts" 
        subName="Manage work schedules, shift patterns, and duty assignments"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="guard-schedules" title="Guard Schedules & Shifts Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'schedules')}
              className="mb-4"
            >
              <Tab eventKey="schedules" title="Schedule Management">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingSchedule(null);
                        reset();
                        setShowScheduleModal(true);
                      }}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      New Schedule
                    </Button>
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="ri:download-line" className="me-1" />
                      Export
                    </Button>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <InputGroup style={{ width: '300px' }}>
                      <Form.Control
                        type="text"
                        placeholder="Search guards, communities, or locations..."
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
                  <Col md={3}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterShiftType}
                      onChange={(e) => setFilterShiftType(e.target.value)}
                    >
                      <option value="all">All Shift Types</option>
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="rotating">Rotating</option>
                      <option value="split">Split Shift</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Guard</th>
                          <th>Shift Details</th>
                          <th>Assignment</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSchedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                                  <IconifyIcon icon="ri:user-line" className="text-primary" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{schedule.guardName}</h6>
                                  <small className="text-muted">ID: {schedule.guardId}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <Badge bg={getShiftTypeColor(schedule.shiftType)} className="mb-1">
                                  {schedule.shiftType.charAt(0).toUpperCase() + schedule.shiftType.slice(1)} Shift
                                </Badge>
                                <div className="small text-muted">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{schedule.communityName}</div>
                                <small className="text-muted">{schedule.postLocation}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{schedule.assignedDate}</div>
                                {schedule.endDate && (
                                  <small className="text-muted">to {schedule.endDate}</small>
                                )}
                              </div>
                            </td>
                            <td>
                              <Badge bg={getStatusBadgeColor(schedule.status)}>
                                {schedule.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <IconifyIcon icon="ri:more-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEditSchedule(schedule)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                                    Duplicate
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="text-danger"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                  >
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Delete
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

              <Tab eventKey="patterns" title="Shift Patterns">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Shift Patterns</h5>
                  <Button
                    variant="primary"
                    onClick={() => setShowPatternModal(true)}
                  >
                    <IconifyIcon icon="ri:add-line" className="me-1" />
                    New Pattern
                  </Button>
                </div>

                <Row>
                  {shiftPatterns.map((pattern) => (
                    <Col md={6} lg={4} key={pattern.id} className="mb-3">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">{pattern.name}</h6>
                            {pattern.isDefault && (
                              <Badge bg="success" className="small">Default</Badge>
                            )}
                          </div>
                          <p className="text-muted small mb-2">{pattern.description}</p>
                          <div className="mb-2">
                            <small className="text-muted">Time:</small>
                            <div className="fw-medium">{pattern.startTime} - {pattern.endTime}</div>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Duration:</small>
                            <div className="fw-medium">{pattern.duration} hours</div>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted">Break Time:</small>
                            <div className="fw-medium">{pattern.breakTime} minutes</div>
                          </div>
                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm">
                              <IconifyIcon icon="ri:edit-line" />
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              <IconifyIcon icon="ri:delete-bin-line" />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab>

              <Tab eventKey="calendar" title="Calendar View">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Schedule Calendar</h5>
                      <div className="d-flex gap-2">
                        <Button 
                          variant={calendarView === 'today' ? 'primary' : 'outline-secondary'} 
                          size="sm"
                          onClick={() => setCalendarView('today')}
                        >
                          Today
                        </Button>
                        <Button 
                          variant={calendarView === 'week' ? 'primary' : 'outline-secondary'} 
                          size="sm"
                          onClick={() => setCalendarView('week')}
                        >
                          Week
                        </Button>
                        <Button 
                          variant={calendarView === 'month' ? 'primary' : 'outline-secondary'} 
                          size="sm"
                          onClick={() => setCalendarView('month')}
                        >
                          Month
                        </Button>
                      </div>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="schedule-calendar">
                      {calendarView === 'month' && (
                        <div className="calendar-month-view">
                          {/* Month Header */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => {
                                try {
                                  const currentDateObj = new Date(currentDate);
                                  if (isNaN(currentDateObj.getTime())) {
                                    setCurrentDate(new Date().toISOString().split('T')[0]);
                                    return;
                                  }
                                  const newDate = new Date(currentDateObj);
                                  newDate.setMonth(newDate.getMonth() - 1);
                                  setCurrentDate(newDate.toISOString().split('T')[0]);
                                } catch (error) {
                                  console.error('Error navigating to previous month:', error);
                                  setCurrentDate(new Date().toISOString().split('T')[0]);
                                }
                              }}
                            >
                              <IconifyIcon icon="ri:arrow-left-line" />
                            </Button>
                            <h6 className="mb-0">
                              {(() => {
                                try {
                                  const date = new Date(currentDate);
                                  return isNaN(date.getTime()) ? 
                                    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                                    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                } catch (error) {
                                  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                }
                              })()}
                            </h6>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => {
                                try {
                                  const currentDateObj = new Date(currentDate);
                                  if (isNaN(currentDateObj.getTime())) {
                                    setCurrentDate(new Date().toISOString().split('T')[0]);
                                    return;
                                  }
                                  const newDate = new Date(currentDateObj);
                                  newDate.setMonth(newDate.getMonth() + 1);
                                  setCurrentDate(newDate.toISOString().split('T')[0]);
                                } catch (error) {
                                  console.error('Error navigating to next month:', error);
                                  setCurrentDate(new Date().toISOString().split('T')[0]);
                                }
                              }}
                            >
                              <IconifyIcon icon="ri:arrow-right-line" />
                            </Button>
                          </div>
                          
                          {/* Days of Week Header */}
                          <div className="row g-0 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="col">
                                <div className="text-center text-muted fw-medium py-2 border-bottom">
                                  {day}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar Days */}
                          <div className="calendar-grid">
                            {generateCalendarDays(currentDate).map((day, index) => {
                              const daySchedules = getSchedulesForDate(day.date);
                              const isToday = day.date === new Date().toISOString().split('T')[0];
                              const isCurrentMonth = day.isCurrentMonth;
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                                  style={{
                                    minHeight: '80px',
                                    border: '1px solid #e9ecef',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: isToday ? '#f8f9fa' : isCurrentMonth ? '#fff' : '#fafafa'
                                  }}
                                  onClick={() => setSelectedDate(day.date)}
                                >
                                  <div className={`day-number ${!isCurrentMonth ? 'text-muted' : ''} ${isToday ? 'fw-bold text-primary' : ''}`}>
                                    {day.day}
                                  </div>
                                  {daySchedules.length > 0 && (
                                    <div className="schedule-indicators mt-1">
                                      {daySchedules.slice(0, 2).map((schedule, idx) => (
                                        <div 
                                          key={idx}
                                          className="schedule-indicator mb-1"
                                          style={{
                                            fontSize: '10px',
                                            padding: '1px 4px',
                                            borderRadius: '2px',
                                            backgroundColor: schedule.guardName ? '#e3f2fd' : '#fff3e0',
                                            color: schedule.guardName ? '#1976d2' : '#f57c00',
                                            border: '1px solid',
                                            borderColor: schedule.guardName ? '#bbdefb' : '#ffcc02',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                          title={`${schedule.guardName} - ${schedule.startTime}-${schedule.endTime}`}
                                        >
                                          {schedule.guardName || 'Unassigned'}
                                        </div>
                                      ))}
                                      {daySchedules.length > 2 && (
                                        <div 
                                          style={{
                                            fontSize: '9px',
                                            color: '#666',
                                            textAlign: 'center'
                                          }}
                                        >
                                          +{daySchedules.length - 2} more
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {calendarView === 'week' && (
                        <div className="calendar-week-view">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => {
                                try {
                                  const currentDateObj = new Date(currentDate);
                                  if (isNaN(currentDateObj.getTime())) {
                                    setCurrentDate(new Date().toISOString().split('T')[0]);
                                    return;
                                  }
                                  const newDate = new Date(currentDateObj);
                                  newDate.setDate(newDate.getDate() - 7);
                                  setCurrentDate(newDate.toISOString().split('T')[0]);
                                } catch (error) {
                                  console.error('Error navigating to previous week:', error);
                                  setCurrentDate(new Date().toISOString().split('T')[0]);
                                }
                              }}
                            >
                              <IconifyIcon icon="ri:arrow-left-line" />
                            </Button>
                            <h6 className="mb-0">
                              Week of {(() => {
                                try {
                                  const date = new Date(currentDate);
                                  return isNaN(date.getTime()) ? 
                                    new Date().toLocaleDateString() :
                                    date.toLocaleDateString();
                                } catch (error) {
                                  return new Date().toLocaleDateString();
                                }
                              })()}
                            </h6>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => {
                                try {
                                  const currentDateObj = new Date(currentDate);
                                  if (isNaN(currentDateObj.getTime())) {
                                    setCurrentDate(new Date().toISOString().split('T')[0]);
                                    return;
                                  }
                                  const newDate = new Date(currentDateObj);
                                  newDate.setDate(newDate.getDate() + 7);
                                  setCurrentDate(newDate.toISOString().split('T')[0]);
                                } catch (error) {
                                  console.error('Error navigating to next week:', error);
                                  setCurrentDate(new Date().toISOString().split('T')[0]);
                                }
                              }}
                            >
                              <IconifyIcon icon="ri:arrow-right-line" />
                            </Button>
                          </div>
                          
                          <div className="row g-2">
                            {generateWeekDays(currentDate).map((day, index) => {
                              const daySchedules = getSchedulesForDate(day.date);
                              const isToday = day.date === new Date().toISOString().split('T')[0];
                              
                              return (
                                <div key={index} className="col">
                                  <Card className={`h-100 ${isToday ? 'border-primary' : ''}`}>
                                    <Card.Header className={`text-center py-2 ${isToday ? 'bg-primary text-white' : 'bg-light'}`}>
                                      <div className="fw-medium">{day.dayName}</div>
                                      <div className="small">{day.day}</div>
                                    </Card.Header>
                                    <Card.Body className="p-2">
                                      {daySchedules.length === 0 ? (
                                        <div className="text-muted small text-center">No schedules</div>
                                      ) : (
                                        daySchedules.map((schedule, idx) => (
                                          <div 
                                            key={idx}
                                            className="schedule-item mb-2 p-2 rounded"
                                            style={{
                                              backgroundColor: schedule.guardName ? '#e8f5e8' : '#fff3cd',
                                              border: '1px solid',
                                              borderColor: schedule.guardName ? '#c3e6cb' : '#ffeaa7'
                                            }}
                                          >
                                            <div className="fw-medium small">{schedule.guardName || 'Unassigned'}</div>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>
                                              {schedule.startTime} - {schedule.endTime}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>
                                              {schedule.communityName}
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </Card.Body>
                                  </Card>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {calendarView === 'today' && (
                        <div className="calendar-today-view">
                          <div className="text-center mb-4">
                            <h6>Today's Schedule - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
                          </div>
                          
                          {todaySchedules.length === 0 ? (
                            <Alert variant="light" className="text-center">
                              <IconifyIcon icon="ri:calendar-line" className="me-2" />
                              No schedules for today
                            </Alert>
                          ) : (
                            <Row>
                              {todaySchedules.map((schedule) => (
                                <Col key={schedule.id} md={6} lg={4} className="mb-3">
                                  <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Badge bg={schedule.guardName ? 'success' : 'warning'}>
                                          {schedule.guardName ? 'Assigned' : 'Unassigned'}
                                        </Badge>
                                        <small className="text-muted">{schedule.shiftType}</small>
                                      </div>
                                      <h6 className="mb-2">{schedule.guardName || 'No Guard Assigned'}</h6>
                                      <div className="small text-muted mb-2">
                                        <IconifyIcon icon="ri:time-line" className="me-1" />
                                        {schedule.startTime} - {schedule.endTime}
                                      </div>
                                      <div className="small text-muted">
                                        <IconifyIcon icon="ri:building-line" className="me-1" />
                                        {schedule.communityName}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <style jsx>{`
                      .calendar-grid {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 1px;
                        background-color: #e9ecef;
                        border: 1px solid #e9ecef;
                      }
                      .calendar-day {
                        background-color: white;
                      }
                      .calendar-day.today {
                        background-color: #f8f9fa !important;
                        border-color: #007bff !important;
                      }
                      .calendar-day.other-month {
                        background-color: #fafafa !important;
                      }
                      .day-number {
                        font-size: 14px;
                        font-weight: 500;
                      }
                      .schedule-indicator {
                        font-size: 10px;
                        line-height: 1.2;
                      }
                    `}</style>

                    <div className="mt-4">
                      <h6>Today's Schedules ({selectedDate})</h6>
                      {todaySchedules.length === 0 ? (
                        <Alert variant="light" className="text-center">
                          No schedules for the selected date
                        </Alert>
                      ) : (
                        <Row>
                          {todaySchedules.map((schedule) => (
                            <Col md={6} key={schedule.id} className="mb-2">
                              <Card className="border-start border-primary border-3">
                                <Card.Body className="py-2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <h6 className="mb-0">{schedule.guardName}</h6>
                                      <small className="text-muted">
                                        {schedule.startTime} - {schedule.endTime} | {schedule.communityName}
                                      </small>
                                    </div>
                                    <Badge bg={getStatusBadgeColor(schedule.status)}>
                                      {schedule.status}
                                    </Badge>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Schedule Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateSchedule)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Controller
                  name="guardId"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Select Guard"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Guard...</option>
                      {guards.map((guard) => (
                        <option key={guard.id} value={guard.id}>
                          {guard.full_name || `${guard.first_name} ${guard.last_name}`}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="shiftType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Shift Type"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Shift Type...</option>
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="rotating">Rotating Shift</option>
                      <option value="split">Split Shift</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Start Time"
                      type="time"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="End Time"
                      type="time"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="assignedDate"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Start Date"
                      type="date"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="End Date (Optional)"
                      type="date"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="communityId"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Community"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Community...</option>
                      {communities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="postLocation"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Post Location"
                      placeholder="e.g., Main Gate, Tower A Entrance"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Notes (Optional)"
                  placeholder="Additional notes or instructions"
                  rows={3}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!isValid}>
              {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default GuardSchedulesPage;
