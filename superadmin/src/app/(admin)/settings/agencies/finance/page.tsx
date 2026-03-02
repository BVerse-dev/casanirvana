'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Nav, Button, Table, Badge, Form, Modal, Pagination, TabContainer, TabContent, TabPane, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDollarSign, FiCreditCard, FiFileText, FiTrendingUp, FiCalendar, FiDownload, FiUpload, FiPieChart, FiBarChart, FiAlertCircle } from 'react-icons/fi';
import { useAgencyBilling, useCreateAgencyBilling, useUpdateAgencyBilling, useDeleteAgencyBilling } from '@/hooks/useAgencyBilling';
import { useAgencyTransactions, useCreateAgencyTransaction } from '@/hooks/useAgencyTransactions';
import { useAgencyProfiles } from '@/hooks/useAgencyProfiles';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Validation schema for billing configuration
const billingSchema = yup.object().shape({
  name: yup.string().required('Configuration name is required'),
  type: yup.string().required('Type is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  frequency: yup.string().required('Frequency is required'),
  dueDate: yup.string().required('Due date is required'),
  paymentMethod: yup.string().required('Payment method is required'),
  status: yup.string().required('Status is required'),
  description: yup.string(),
  autoRenewal: yup.boolean(),
  taxIncluded: yup.boolean(),
  lateFee: yup.number().min(0, 'Late fee cannot be negative'),
  discountRate: yup.number().min(0, 'Discount rate cannot be negative').max(100, 'Discount rate cannot exceed 100%')
});

// Validation schema for transaction
const transactionSchema = yup.object().shape({
  type: yup.string().required('Transaction type is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  paymentMethod: yup.string().required('Payment method is required'),
  status: yup.string().required('Status is required'),
  reference: yup.string(),
  date: yup.string().required('Date is required'),
  notes: yup.string()
});

type BillingFormData = yup.InferType<typeof billingSchema>;
type TransactionFormData = yup.InferType<typeof transactionSchema>;

const typeOptions = ['Subscription', 'Service Fee', 'Commission', 'One-time Payment'];
const frequencyOptions = ['Monthly', 'Quarterly', 'Annually', 'Per Use', 'One-time'];
const paymentMethodOptions = ['Credit / Debit Card', 'Bank Transfer', 'Mobile Money', 'Invoice', 'Cash'];
const statusOptions = ['Active', 'Pending', 'Overdue', 'Suspended', 'Cancelled'];

// Transaction options
const transactionTypeOptions = ['Income', 'Expense'];
const transactionCategoryOptions = ['Commission', 'Service Fee', 'Subscription', 'Platform Fee', 'Marketing', 'Legal', 'Office Supplies', 'Travel', 'Training', 'Other'];
const transactionStatusOptions = ['Completed', 'Pending', 'Failed', 'Cancelled'];

const AgencyFinancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  // Pagination states
  const [billingPage, setBillingPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const itemsPerPage = 10;
  const qc = useQueryClient();

  // Fetch data from Supabase
  const { data: billingData, isLoading: billingLoading, error: billingError } = useAgencyBilling();
  const { data: transactionData, isLoading: transLoading, error: transError } = useAgencyTransactions();
  const { data: agencies = [] } = useAgencyProfiles();

  const billingList = billingData ?? [];
  const transactionList = transactionData ?? [];

  // Mutations
  const createBillingMutation = useCreateAgencyBilling();
  const updateBillingMutation = useUpdateAgencyBilling();
  const deleteBillingMutation = useDeleteAgencyBilling();
  const createTransactionMutation = useCreateAgencyTransaction();

  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingBilling, setEditingBilling] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BillingFormData>({
    resolver: yupResolver(billingSchema)
  });

  const { register: registerTransaction, handleSubmit: handleSubmitTransaction, formState: { errors: transactionErrors }, reset: resetTransaction } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema)
  });

  // Filter billing based on search and filters
  const filteredBilling = billingList.filter(billing => {
    const matchesSearch = billing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (billing.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || billing.type === filterType;
    const matchesStatus = !filterStatus || billing.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculations for billing list
  const billingTotalPages = Math.ceil(filteredBilling.length / itemsPerPage) || 1;
  const paginatedBilling = filteredBilling.slice((billingPage - 1) * itemsPerPage, billingPage * itemsPerPage);

  // Pagination calculations for transactions list
  const transactionTotalPages = Math.ceil(transactionList.length / itemsPerPage) || 1;
  const paginatedTransactions = transactionList.slice((transactionPage - 1) * itemsPerPage, transactionPage * itemsPerPage);

  // Reset billing page when filters change
  useEffect(() => {
    setBillingPage(1);
  }, [searchTerm, filterType, filterStatus]);

  // Ensure current pages stay within range when data updates
  useEffect(() => {
    if (billingPage > billingTotalPages) setBillingPage(billingTotalPages);
  }, [billingTotalPages, billingPage]);

  useEffect(() => {
    if (transactionPage > transactionTotalPages) setTransactionPage(transactionTotalPages);
  }, [transactionTotalPages, transactionPage]);

  const handleAddBilling = () => {
    setEditingBilling(null);
    reset();
    setActionFeedback(null);
    setShowModal(true);
  };

  const handleAddTransaction = () => {
    resetTransaction();
    setActionFeedback(null);
    setShowTransactionModal(true);
  };

  const handleEditBilling = (billing: any) => {
    setEditingBilling(billing);
    // Pre-populate form with billing data
    Object.keys(billing).forEach(key => {
      setValue(key as keyof BillingFormData, billing[key]);
    });
    setShowModal(true);
  };

  const handleDeleteBilling = async (billingId: string) => {
    if (window.confirm('Are you sure you want to delete this billing configuration?')) {
      try {
        await deleteBillingMutation.mutateAsync(billingId);
        setActionFeedback({ variant: 'success', message: 'Billing configuration removed successfully.' });
      } catch (mutationError: any) {
        setActionFeedback({ variant: 'danger', message: mutationError?.message || 'Failed to delete billing configuration.' });
      }
    }
  };

  const onSubmit = async (data: BillingFormData) => {
    const resolvedAgencyId = editingBilling?.agencyId || agencies[0]?.id || '';
    if (!resolvedAgencyId) {
      setActionFeedback({ variant: 'danger', message: 'Create an agency profile before adding billing configurations.' });
      return;
    }

    try {
      if (editingBilling) {
        await updateBillingMutation.mutateAsync({ ...data, id: editingBilling.id, agencyId: resolvedAgencyId });
        setActionFeedback({ variant: 'success', message: 'Billing configuration updated successfully.' });
      } else {
        await createBillingMutation.mutateAsync({
          ...data,
          autoRenewal: !!data.autoRenewal,
          taxIncluded: !!data.taxIncluded,
          agencyId: resolvedAgencyId,
        });
        setActionFeedback({ variant: 'success', message: 'Billing configuration created successfully.' });
      }
      setShowModal(false);
      reset();
    } catch (mutationError: any) {
      setActionFeedback({ variant: 'danger', message: mutationError?.message || 'Failed to save billing configuration.' });
    }
  };

  const onSubmitTransaction = async (data: TransactionFormData) => {
    const resolvedAgencyId = agencies[0]?.id || '';
    if (!resolvedAgencyId) {
      setActionFeedback({ variant: 'danger', message: 'Create an agency profile before adding transactions.' });
      return;
    }

    try {
      const reference = data.reference || `TXN-${Date.now()}`;
      await createTransactionMutation.mutateAsync({
        ...data,
        reference,
        agencyId: resolvedAgencyId,
      });
      setShowTransactionModal(false);
      resetTransaction();
      setActionFeedback({ variant: 'success', message: 'Transaction created successfully.' });
    } catch (mutationError: any) {
      setActionFeedback({ variant: 'danger', message: mutationError?.message || 'Failed to create transaction.' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      'Active': 'success',
      'Pending': 'warning',
      'Overdue': 'danger',
      'Suspended': 'secondary',
      'Cancelled': 'dark'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTransactionBadge = (type: string) => {
    return <Badge bg={type === 'Income' ? 'success' : 'danger'}>{type}</Badge>;
  };

  // Calculate statistics
  const totalRevenue = transactionList.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactionList.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const totalOutstanding = billingList.reduce((sum, b) => sum + (b.outstanding ?? 0), 0);
  const totalActiveBilling = billingList.filter(b => b.status === 'Active').length;
  const overdueBilling = billingList.filter(b => b.status === 'Overdue').length;
  const financeTotal = totalRevenue + totalExpenses;
  const revenueRatio = financeTotal > 0 ? (totalRevenue / financeTotal) * 100 : 0;
  const expenseRatio = financeTotal > 0 ? (totalExpenses / financeTotal) * 100 : 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  // Real-time subscription to keep billing list in sync
  useEffect(() => {
    const channel = supabase
      .channel('public:agency_billing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agency_billing' }, () => {
        qc.invalidateQueries({ queryKey: ['agencyBilling'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  if (billingLoading || transLoading) {
    return <div className="container-fluid"><p>Loading...</p></div>;
  }
  if (billingError || transError) {
    return <div className="container-fluid"><p className="text-danger">Error loading finance data.</p></div>;
  }

  return (
    <div className="container-fluid">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0 text-gray-800">Agency Finance & Billing</h1>
          <p className="text-muted">Manage financial transactions, billing, and payment processing</p>
        </Col>
      </Row>

      {actionFeedback && (
        <Alert variant={actionFeedback.variant} onClose={() => setActionFeedback(null)} dismissible>
          {actionFeedback.message}
        </Alert>
      )}

      <TabContainer activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="text-decoration-none">
                      <FiPieChart className="me-2" />
                      Financial Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="billing" className="text-decoration-none">
                      <FiFileText className="me-2" />
                      Billing Management
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="transactions" className="text-decoration-none">
                      <FiCreditCard className="me-2" />
                      Transaction History
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reports" className="text-decoration-none">
                      <FiBarChart className="me-2" />
                      Financial Reports
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <TabContent>
                  {/* Financial Overview Tab */}
                  <TabPane eventKey="overview">
                    <Row className="mb-4">
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-success text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Total Revenue</h6>
                                <h3 className="mb-0">{formatCurrency(totalRevenue)}</h3>
                              </div>
                              <FiTrendingUp size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-danger text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Total Expenses</h6>
                                <h3 className="mb-0">{formatCurrency(totalExpenses)}</h3>
                              </div>
                              <FiDollarSign size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-warning text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Outstanding</h6>
                                <h3 className="mb-0">{formatCurrency(totalOutstanding)}</h3>
                              </div>
                              <FiAlertCircle size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-primary text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Net Profit</h6>
                                <h3 className="mb-0">{formatCurrency(netProfit)}</h3>
                              </div>
                              <FiPieChart size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={8} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Monthly Financial Breakdown</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-4">
                              <h6 className="text-muted">Revenue Sources</h6>
                              {['Commission', 'Service Fee', 'Subscription'].map(category => {
                                const categoryRevenue = transactionList
                                  .filter(t => t.type === 'Income' && t.category === category)
                                  .reduce((sum, t) => sum + t.amount, 0);
                                const percentage = totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0;
                                return (
                                  <div key={category} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="font-weight-bold">{category}</span>
                                      <span>{formatCurrency(categoryRevenue)} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div 
                                        className="progress-bar bg-success" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div>
                              <h6 className="text-muted">Expense Categories</h6>
                              {['Platform Fee', 'Marketing', 'Legal'].map(category => {
                                const categoryExpense = transactionList
                                  .filter(t => t.type === 'Expense' && t.category === category)
                                  .reduce((sum, t) => sum + t.amount, 0);
                                const percentage = totalExpenses > 0 ? (categoryExpense / totalExpenses) * 100 : 0;
                                return (
                                  <div key={category} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="font-weight-bold">{category}</span>
                                      <span>{formatCurrency(categoryExpense)} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div 
                                        className="progress-bar bg-danger" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Billing Status</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Active Billing</span>
                                <Badge bg="success">{totalActiveBilling}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Overdue Items</span>
                                <Badge bg="danger">{overdueBilling}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Total Configurations</span>
                                <Badge bg="primary">{billingList.length}</Badge>
                              </div>
                            </div>
                            <div className="d-grid gap-2">
                              <Button variant="outline-primary" size="sm">
                                <FiDownload className="me-2" />
                                Export Financial Data
                              </Button>
                              <Button variant="outline-success" size="sm">
                                <FiUpload className="me-2" />
                                Import Transactions
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>

                        <Card className="shadow-sm mt-3">
                          <Card.Header>
                            <h6 className="mb-0">Upcoming Payments</h6>
                          </Card.Header>
                          <Card.Body>
                            {billingList
                              .filter(b => !!b.nextPayment)
                              .sort((a, b) => {
                                const aTime = a.nextPayment ? new Date(a.nextPayment as string).getTime() : Infinity;
                                const bTime = b.nextPayment ? new Date(b.nextPayment as string).getTime() : Infinity;
                                return aTime - bTime;
                              })
                              .slice(0, 5)
                              .map(billing => (
                                <div key={billing.id} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                  <div>
                                    <div className="font-weight-bold">{billing.name}</div>
                                    <small className="text-muted">{billing.nextPayment ?? ''}</small>
                                  </div>
                                  <div className="text-end">
                                    <div className="font-weight-bold">{formatCurrency(billing.amount)}</div>
                                    {getStatusBadge(billing.status)}
                                  </div>
                                </div>
                              ))}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>

                  {/* Billing Management Tab */}
                  <TabPane eventKey="billing">
                    <Row className="mb-3">
                      <Col md={8}>
                        <div className="d-flex gap-2">
                          <div className="position-relative flex-grow-1">
                            <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            <Form.Control
                              type="text"
                              placeholder="Search billing configurations..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="ps-5"
                            />
                          </div>
                          <Form.Select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Types</option>
                            {typeOptions.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Form.Select>
                          <Form.Select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Status</option>
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </Form.Select>
                        </div>
                      </Col>
                      <Col md={4} className="text-end">
                        <Button variant="primary" onClick={handleAddBilling}>
                          <FiPlus className="me-2" />
                          Add Billing Config
                        </Button>
                      </Col>
                    </Row>

                    <Card className="shadow-sm">
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th>Configuration</th>
                              <th>Type & Amount</th>
                              <th>Payment Details</th>
                              <th>Status</th>
                              <th>Outstanding</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedBilling.map(billing => (
                              <tr key={billing.id}>
                                <td>
                                  <div>
                                    <div className="font-weight-bold">{billing.name}</div>
                                    <small className="text-muted">{billing.description ?? ''}</small>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <Badge bg="info" className="me-2">{billing.type}</Badge>
                                    <div className="font-weight-bold">{formatCurrency(billing.amount)}</div>
                                    <small className="text-muted">{billing.frequency}</small>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div>{billing.paymentMethod}</div>
                                    <small className="text-muted">
                                      Due: {billing.dueDate}
                                      {billing.autoRenewal && <span className="text-success ms-2">Auto-renew</span>}
                                    </small>
                                  </div>
                                </td>
                                <td>{getStatusBadge(billing.status)}</td>
                                <td>
                                  <div className="font-weight-bold text-danger">
                                    {formatCurrency(billing.outstanding ?? 0)}
                                  </div>
                                  <small className="text-muted">
                                    Paid: {formatCurrency(billing.totalPaid ?? 0)}
                                  </small>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleEditBilling(billing)}
                                    >
                                      <FiEdit2 />
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeleteBilling(billing.id)}
                                    >
                                      <FiTrash2 />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      {/* Pagination Controls */}
                      <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
                        <small className="text-muted">
                          Showing {(billingPage - 1) * itemsPerPage + 1} to {Math.min(billingPage * itemsPerPage, filteredBilling.length)} of {filteredBilling.length} billing items (Page {billingPage} of {billingTotalPages})
                        </small>
                        <Pagination className="mb-0">
                          <Pagination.First disabled={billingPage === 1} onClick={() => setBillingPage(1)} />
                          <Pagination.Prev disabled={billingPage === 1} onClick={() => setBillingPage(billingPage - 1)} />
                          {Array.from({ length: Math.min(5, billingTotalPages) }, (_, idx) => {
                            const pageNum = Math.max(1, Math.min(billingTotalPages - 4, billingPage - 2)) + idx;
                            if (pageNum <= billingTotalPages) {
                              return (
                                <Pagination.Item key={pageNum} active={pageNum === billingPage} onClick={() => setBillingPage(pageNum)}>
                                  {pageNum}
                                </Pagination.Item>
                              );
                            }
                            return null;
                          })}
                          <Pagination.Next disabled={billingPage === billingTotalPages} onClick={() => setBillingPage(billingPage + 1)} />
                          <Pagination.Last disabled={billingPage === billingTotalPages} onClick={() => setBillingPage(billingTotalPages)} />
                        </Pagination>
                      </div>
                    </Card>
                  </TabPane>

                  {/* Transaction History Tab */}
                  <TabPane eventKey="transactions">
                    <Row className="mb-3">
                      <Col md={6}>
                        <div className="d-flex gap-2">
                          <div className="position-relative flex-grow-1">
                            <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            <Form.Control
                              type="text"
                              placeholder="Search transactions..."
                              className="ps-5"
                            />
                          </div>
                          <Form.Select style={{ width: 'auto' }}>
                            <option value="">All Types</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                          </Form.Select>
                        </div>
                      </Col>
                      <Col md={6} className="text-end">
                        <Button variant="outline-primary" className="me-2">
                          <FiDownload className="me-2" />
                          Export
                        </Button>
                        <Button variant="primary" onClick={handleAddTransaction}>
                          <FiPlus className="me-2" />
                          Add Transaction
                        </Button>
                      </Col>
                    </Row>

                    <Card className="shadow-sm">
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Description</th>
                              <th>Category</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Reference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTransactions.map(transaction => (
                              <tr key={transaction.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FiCalendar className="text-muted me-2" size={14} />
                                    {transaction.date}
                                  </div>
                                </td>
                                <td>{getTransactionBadge(transaction.type)}</td>
                                <td>
                                  <div>
                                    <div className="font-weight-bold">{transaction.description}</div>
                                    <small className="text-muted">{transaction.paymentMethod}</small>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="secondary">{transaction.category}</Badge>
                                </td>
                                <td>
                                  <div className={`font-weight-bold ${transaction.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                                    {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                  </div>
                                </td>
                                <td>
                                  <Badge bg={transaction.status === 'Completed' ? 'success' : 'warning'}>
                                    {transaction.status}
                                  </Badge>
                                </td>
                                <td>
                                  <code>{transaction.reference}</code>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      {/* Pagination Controls */}
                      <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
                        <small className="text-muted">
                          Showing {(transactionPage - 1) * itemsPerPage + 1} to {Math.min(transactionPage * itemsPerPage, transactionList.length)} of {transactionList.length} transactions (Page {transactionPage} of {transactionTotalPages})
                        </small>
                        <Pagination className="mb-0">
                          <Pagination.First disabled={transactionPage === 1} onClick={() => setTransactionPage(1)} />
                          <Pagination.Prev disabled={transactionPage === 1} onClick={() => setTransactionPage(transactionPage - 1)} />
                          {Array.from({ length: Math.min(5, transactionTotalPages) }, (_, idx) => {
                            const pageNum = Math.max(1, Math.min(transactionTotalPages - 4, transactionPage - 2)) + idx;
                            if (pageNum <= transactionTotalPages) {
                              return (
                                <Pagination.Item key={pageNum} active={pageNum === transactionPage} onClick={() => setTransactionPage(pageNum)}>
                                  {pageNum}
                                </Pagination.Item>
                              );
                            }
                            return null;
                          })}
                          <Pagination.Next disabled={transactionPage === transactionTotalPages} onClick={() => setTransactionPage(transactionPage + 1)} />
                          <Pagination.Last disabled={transactionPage === transactionTotalPages} onClick={() => setTransactionPage(transactionTotalPages)} />
                        </Pagination>
                      </div>
                    </Card>
                  </TabPane>

                  {/* Financial Reports Tab */}
                  <TabPane eventKey="reports">
                    <Row>
                      <Col md={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Revenue vs Expenses Trend</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-success font-weight-bold">Revenue</span>
                                <span className="text-success font-weight-bold">{formatCurrency(totalRevenue)}</span>
                              </div>
                              <div className="progress mb-3" style={{ height: '20px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${revenueRatio}%` }}
                                ></div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-danger font-weight-bold">Expenses</span>
                                <span className="text-danger font-weight-bold">{formatCurrency(totalExpenses)}</span>
                              </div>
                              <div className="progress" style={{ height: '20px' }}>
                                <div 
                                  className="progress-bar bg-danger" 
                                  style={{ width: `${expenseRatio}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-center">
                              <h4 className="text-primary">Net Profit: {formatCurrency(netProfit)}</h4>
                              <small className="text-muted">
                                Profit Margin: {profitMargin.toFixed(1)}%
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Payment Method Distribution</h6>
                          </Card.Header>
                          <Card.Body>
                            {paymentMethodOptions.map(method => {
                              const methodCount = billingList.filter(b => b.paymentMethod === method).length;
                              const methodRevenue = billingList.filter(b => b.paymentMethod === method).reduce((sum, b) => sum + (b.totalPaid ?? 0), 0);
                              const percentage = billingList.length > 0 ? (methodCount / billingList.length) * 100 : 0;
                              
                              return (
                                <div key={method} className="mb-3">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="font-weight-bold">{method}</span>
                                    <span>{methodCount} configs • {formatCurrency(methodRevenue)}</span>
                                  </div>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div 
                                      className="progress-bar bg-info" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12}>
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Financial Summary</h6>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={3} className="text-center mb-3">
                                <h4 className="text-success">{formatCurrency(totalRevenue)}</h4>
                                <p className="text-muted mb-0">Total Revenue</p>
                              </Col>
                              <Col md={3} className="text-center mb-3">
                                <h4 className="text-danger">{formatCurrency(totalExpenses)}</h4>
                                <p className="text-muted mb-0">Total Expenses</p>
                              </Col>
                              <Col md={3} className="text-center mb-3">
                                <h4 className="text-warning">{formatCurrency(totalOutstanding)}</h4>
                                <p className="text-muted mb-0">Outstanding Amount</p>
                              </Col>
                              <Col md={3} className="text-center mb-3">
                                <h4 className="text-primary">{formatCurrency(netProfit)}</h4>
                                <p className="text-muted mb-0">Net Profit</p>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>
                </TabContent>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </TabContainer>

      {/* Add/Edit Billing Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingBilling ? 'Edit Billing Configuration' : 'Add Billing Configuration'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Configuration Name *</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('name')}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select {...register('type')} isInvalid={!!errors.type}>
                    <option value="">Select Type</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                {...register('description')}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (GH₵) *</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('amount')}
                    isInvalid={!!errors.amount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.amount?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequency *</Form.Label>
                  <Form.Select {...register('frequency')} isInvalid={!!errors.frequency}>
                    <option value="">Select Frequency</option>
                    {frequencyOptions.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.frequency?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('dueDate')}
                    isInvalid={!!errors.dueDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dueDate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method *</Form.Label>
                  <Form.Select {...register('paymentMethod')} isInvalid={!!errors.paymentMethod}>
                    <option value="">Select Payment Method</option>
                    {paymentMethodOptions.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.paymentMethod?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...register('status')} isInvalid={!!errors.status}>
                    <option value="">Select Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Late Fee (GH₵)</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('lateFee')}
                    isInvalid={!!errors.lateFee}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lateFee?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Auto Renewal"
                  {...register('autoRenewal')}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Tax Included"
                  {...register('taxIncluded')}
                  className="mb-3"
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingBilling ? 'Update Configuration' : 'Add Configuration'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal show={showTransactionModal} onHide={() => setShowTransactionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitTransaction(onSubmitTransaction)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Type *</Form.Label>
                  <Form.Select {...registerTransaction('type')} isInvalid={!!transactionErrors.type}>
                    <option value="">Select Type</option>
                    {transactionTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select {...registerTransaction('category')} isInvalid={!!transactionErrors.category}>
                    <option value="">Select Category</option>
                    {transactionCategoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.category?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter transaction description"
                {...registerTransaction('description')}
                isInvalid={!!transactionErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {transactionErrors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (GH₵) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...registerTransaction('amount')}
                    isInvalid={!!transactionErrors.amount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.amount?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    {...registerTransaction('date')}
                    isInvalid={!!transactionErrors.date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.date?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method *</Form.Label>
                  <Form.Select {...registerTransaction('paymentMethod')} isInvalid={!!transactionErrors.paymentMethod}>
                    <option value="">Select Payment Method</option>
                    {paymentMethodOptions.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.paymentMethod?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...registerTransaction('status')} isInvalid={!!transactionErrors.status}>
                    <option value="">Select Status</option>
                    {transactionStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.status?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reference Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Auto-generated if left empty"
                    {...registerTransaction('reference')}
                    isInvalid={!!transactionErrors.reference}
                  />
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.reference?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Additional notes or comments"
                    {...registerTransaction('notes')}
                    isInvalid={!!transactionErrors.notes}
                  />
                  <Form.Control.Feedback type="invalid">
                    {transactionErrors.notes?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowTransactionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <FiPlus className="me-2" />
                Add Transaction
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AgencyFinancePage;
