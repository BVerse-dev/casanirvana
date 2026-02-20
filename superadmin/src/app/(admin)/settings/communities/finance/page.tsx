'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Badge, Dropdown, Tab, Tabs, ProgressBar, Alert, Spinner, Pagination } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactApexChart from 'react-apexcharts';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { useFinancialRecords, type FinancialRecord } from '@/hooks/useFinancialRecords';
import { useBudgetItems, type BudgetItem } from '@/hooks/useBudgetItems';
import { useCreateFinancialRecord } from '@/hooks/useCreateFinancialRecord';
import { useUpdateFinancialRecord } from '@/hooks/useUpdateFinancialRecord';
import { useDeleteFinancialRecord } from '@/hooks/useDeleteFinancialRecord';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Finance & Billing Types are imported from hooks

// Mock data
const mockFinancialData: FinancialRecord[] = [
  {
    id: '1',
    community_id: 'com-001',
    community_name: 'Green Valley Apartments',
    type: 'income',
    category: 'maintenance_fee',
    description: 'Monthly Maintenance Fee - Unit A-101',
    amount: 3500,
    unit_id: 'unit-001',
    unit_number: 'A-101',
    transaction_date: '2024-01-01',
    due_date: '2024-01-05',
    payment_date: '2024-01-03',
    payment_method: 'upi',
    status: 'paid',
    invoice_number: 'INV-2024-001',
    tax_amount: 630,
    created_by: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '2',
    community_id: 'com-001',
    community_name: 'Green Valley Apartments',
    type: 'expense',
    category: 'electricity_bill',
    description: 'Common Area Electricity Bill - December 2023',
    amount: 15000,
    transaction_date: '2024-01-02',
    payment_date: '2024-01-02',
    payment_method: 'bank_transfer',
    status: 'paid',
    invoice_number: 'EXP-2024-001',
    created_by: 'admin',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    community_id: 'com-002',
    community_name: 'Sunset Heights',
    type: 'income',
    category: 'maintenance_fee',
    description: 'Monthly Maintenance Fee - Unit B-201',
    amount: 4200,
    unit_id: 'unit-002',
    unit_number: 'B-201',
    transaction_date: '2024-01-01',
    due_date: '2024-01-05',
    status: 'overdue',
    invoice_number: 'INV-2024-002',
    tax_amount: 756,
    created_by: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockBudgetData: BudgetItem[] = [
  {
    id: '1',
    community_id: 'com-001',
    category: 'Maintenance',
    allocated_amount: 50000,
    spent_amount: 35000,
    budget_period: 'monthly',
    budget_year: 2024,
    budget_month: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '2',
    community_id: 'com-001',
    category: 'Utilities',
    allocated_amount: 25000,
    spent_amount: 22000,
    budget_period: 'monthly',
    budget_year: 2024,
    budget_month: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    community_id: 'com-001',
    category: 'Security',
    allocated_amount: 30000,
    spent_amount: 30000,
    budget_period: 'monthly',
    budget_year: 2024,
    budget_month: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
];

// Form validation schema
const financialSchema = yup.object().shape({
  community_id: yup.string().required('Community is required'),
  community_name: yup.string().optional(),
  type: yup.string().required('Type is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().required('Description is required'),
  amount: yup.number().min(0, 'Amount must be positive').required('Amount is required'),
  unit_id: yup.string().optional(),
  unit_number: yup.string().optional(),
  transaction_date: yup.string().required('Transaction date is required'),
  due_date: yup.string().optional(),
  payment_date: yup.string().optional(),
  payment_method: yup.string().optional(),
  status: yup.string().required('Status is required'),
  invoice_number: yup.string().optional(),
  tax_amount: yup.number().optional(),
  discount_amount: yup.number().optional(),
  remarks: yup.string().optional(),
});

const FinanceBilling = () => {
  // Real-time data hooks
  const { data: financialData = [], isLoading: financialLoading, error: financialError } = useFinancialRecords();
  const { data: budgetData = [], isLoading: budgetLoading, error: budgetError } = useBudgetItems();
  
  // Mutation hooks
  const createFinancialRecord = useCreateFinancialRecord();
  const updateFinancialRecord = useUpdateFinancialRecord();
  const deleteFinancialRecord = useDeleteFinancialRecord();
  const queryClient = useQueryClient();

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Quick Actions Modal States
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(financialSchema),
  });

  // Add real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('community_finance_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_financial_records' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_budget_items' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['community_budget_items'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filter financial data
  const filteredData = useMemo(() => {
    return financialData.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.unit_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCommunity = selectedCommunity === 'all' || record.community_id === selectedCommunity;
      const matchesType = selectedType === 'all' || record.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      
      const matchesDateRange = (!dateRange.from || record.transaction_date >= dateRange.from) &&
                              (!dateRange.to || record.transaction_date <= dateRange.to);
      
      return matchesSearch && matchesCommunity && matchesType && matchesStatus && matchesDateRange;
    });
  }, [financialData, searchTerm, selectedCommunity, selectedType, selectedStatus, dateRange]);

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCommunity, selectedType, selectedStatus, dateRange]);

  // Helper function to reset pagination when itemsPerPage changes
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalIncome = financialData.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = financialData.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const pendingPayments = financialData.filter(r => r.status === 'pending' || r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);
    const overdueCount = financialData.filter(r => r.status === 'overdue').length;
    const paidCount = financialData.filter(r => r.status === 'paid').length;
    
    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      pendingPayments,
      overdueCount,
      paidCount,
      collectionRate: financialData.length > 0 ? (paidCount / financialData.length) * 100 : 0,
    };
  }, [financialData]);

  // Chart configurations
  const revenueChartOptions = {
    chart: { type: 'area' as const },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    colors: ['#10b981', '#ef4444'],
    stroke: { curve: 'smooth' as const },
  };

  const expenseChartOptions = {
    chart: { type: 'donut' as const },
    labels: ['Maintenance', 'Utilities', 'Security', 'Miscellaneous'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    legend: { position: 'bottom' as const },
  };

  const paymentStatusChartOptions = {
    chart: { type: 'bar' as const },
    xaxis: {
      categories: ['Paid', 'Pending', 'Overdue', 'Partial'],
    },
    colors: ['#10b981'],
  };

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingRecord) {
        // Update existing record
        await updateFinancialRecord.mutateAsync({
          id: editingRecord.id,
          ...data,
        });
      } else {
        // Create new record
        await createFinancialRecord.mutateAsync({
          ...data,
          community_name: data.community_id === 'e1d40ef7-f1d5-4756-88a2-054fe30cb06a' ? 'Green Valley Apartments' : 'Sunset Heights',
        });
      }
      
      setShowModal(false);
      setEditingRecord(null);
      reset();
    } catch (error) {
      console.error('Error saving financial record:', error);
    }
  };

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record);
    reset(record);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (recordToDelete) {
      try {
        await deleteFinancialRecord.mutateAsync(recordToDelete);
        setRecordToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting financial record:', error);
      }
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      income: 'success',
      expense: 'danger',
      maintenance: 'primary',
      utility: 'warning',
      penalty: 'danger',
      refund: 'info',
    };
    return colors[type] || 'secondary';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      partial: 'info',
      cancelled: 'secondary',
    };
    return colors[status] || 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Show loading state
  if (financialLoading || budgetLoading) {
    return (
      <>
        <PageTitle
          title="Finance & Billing"
          subName="Manage community finances and billing"
        />
        <ComponentContainerCard title="Finance & Billing Management" id="finance-billing">
          <div className="text-center py-5">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Loading financial data...</span>
          </div>
        </ComponentContainerCard>
      </>
    );
  }

  // Show error state
  if (financialError || budgetError) {
    return (
      <>
        <PageTitle
          title="Finance & Billing"
          subName="Manage community finances and billing"
        />
        <ComponentContainerCard title="Finance & Billing Management" id="finance-billing">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Data</Alert.Heading>
            <p>Failed to load financial data: {financialError?.message || budgetError?.message}</p>
            <Button variant="outline-danger" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
              queryClient.invalidateQueries({ queryKey: ['community_budget_items'] });
            }}>
              Try Again
            </Button>
          </Alert>
        </ComponentContainerCard>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Finance & Billing"
        subName="Manage community finances and billing"
      />

      <ComponentContainerCard title="Finance & Billing Management" id="finance-billing">
        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Financial Overview">
            <Row className="mb-4">
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:arrow-up-circle-line" className="display-6 text-success mb-2" />
                    <h3 className="mb-1">{formatCurrency(statistics.totalIncome)}</h3>
                    <p className="text-muted mb-0">Total Income</p>
                    <div className="mt-2">
                      <small className="text-success">
                        <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                        +12.5% from last month
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:arrow-down-circle-line" className="display-6 text-danger mb-2" />
                    <h3 className="mb-1">{formatCurrency(statistics.totalExpense)}</h3>
                    <p className="text-muted mb-0">Total Expenses</p>
                    <div className="mt-2">
                      <small className="text-danger">
                        <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                        +8.3% from last month
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:wallet-line" className="display-6 text-primary mb-2" />
                    <h3 className="mb-1">{formatCurrency(statistics.netIncome)}</h3>
                    <p className="text-muted mb-0">Net Income</p>
                    <div className="mt-2">
                      <small className={statistics.netIncome >= 0 ? "text-success" : "text-danger"}>
                        <IconifyIcon icon={statistics.netIncome >= 0 ? "ri:arrow-up-line" : "ri:arrow-down-line"} className="me-1" />
                        {statistics.netIncome >= 0 ? "+" : ""}{((statistics.netIncome / statistics.totalIncome) * 100).toFixed(1)}% margin
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:time-line" className="display-6 text-warning mb-2" />
                    <h3 className="mb-1">{formatCurrency(statistics.pendingPayments)}</h3>
                    <p className="text-muted mb-0">Pending Payments</p>
                    <div className="mt-2">
                      <small className="text-warning">
                        <IconifyIcon icon="ri:clock-line" className="me-1" />
                        {statistics.overdueCount} overdue
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col lg={4}>
                <Card>
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:percent-line" className="display-6 text-info mb-2" />
                    <h3 className="mb-1">{statistics.collectionRate.toFixed(1)}%</h3>
                    <p className="text-muted mb-0">Collection Rate</p>
                    <ProgressBar 
                      now={statistics.collectionRate} 
                      variant="info" 
                      className="mt-2"
                    />
                    <div className="mt-2">
                      <small className="text-muted">
                        Target: 95% | Current: {statistics.collectionRate.toFixed(1)}%
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:alarm-warning-line" className="display-6 text-danger mb-2" />
                    <h3 className="mb-1">{statistics.overdueCount}</h3>
                    <p className="text-muted mb-0">Overdue Payments</p>
                    <ProgressBar 
                      now={(statistics.overdueCount / financialData.length) * 100} 
                      variant="danger" 
                      className="mt-2"
                    />
                    <div className="mt-2">
                      <small className="text-muted">
                        {((statistics.overdueCount / financialData.length) * 100).toFixed(1)}% of total transactions
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:check-line" className="display-6 text-success mb-2" />
                    <h3 className="mb-1">{statistics.paidCount}</h3>
                    <p className="text-muted mb-0">Completed Payments</p>
                    <ProgressBar 
                      now={(statistics.paidCount / financialData.length) * 100} 
                      variant="success" 
                      className="mt-2"
                    />
                    <div className="mt-2">
                      <small className="text-muted">
                        {((statistics.paidCount / financialData.length) * 100).toFixed(1)}% of total transactions
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Financial Performance Metrics */}
            <Row className="mb-4">
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Monthly Budget Performance</h5>
                  </Card.Header>
                  <Card.Body>
                    {budgetData.map((budget) => (
                      <div key={budget.id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">{budget.category}</span>
                          <span className="text-muted small">
                            {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.allocated_amount)}
                          </span>
                        </div>
                        <ProgressBar 
                          now={(budget.spent_amount / budget.allocated_amount) * 100}
                          variant={budget.spent_amount > budget.allocated_amount ? 'danger' : 'success'}
                          className="mb-1"
                        />
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">
                            {((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1)}% used
                          </small>
                          <small className={budget.spent_amount > budget.allocated_amount ? "text-danger" : "text-success"}>
                            {budget.spent_amount > budget.allocated_amount ? "Over budget" : "On track"}
                          </small>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Payment Status Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Paid</span>
                        <span className="text-success fw-medium">{statistics.paidCount}</span>
                      </div>
                      <ProgressBar 
                        now={(statistics.paidCount / financialData.length) * 100}
                        variant="success"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Pending</span>
                        <span className="text-warning fw-medium">
                          {financialData.filter(r => r.status === 'pending').length}
                        </span>
                      </div>
                      <ProgressBar 
                        now={(financialData.filter(r => r.status === 'pending').length / financialData.length) * 100}
                        variant="warning"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Overdue</span>
                        <span className="text-danger fw-medium">{statistics.overdueCount}</span>
                      </div>
                      <ProgressBar 
                        now={(statistics.overdueCount / financialData.length) * 100}
                        variant="danger"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Failed</span>
                        <span className="text-danger fw-medium">
                          {financialData.filter(r => r.status === 'failed').length}
                        </span>
                      </div>
                      <ProgressBar 
                        now={(financialData.filter(r => r.status === 'failed').length / financialData.length) * 100}
                        variant="danger"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Cancelled</span>
                        <span className="text-secondary fw-medium">
                          {financialData.filter(r => r.status === 'cancelled').length}
                        </span>
                      </div>
                      <ProgressBar 
                        now={(financialData.filter(r => r.status === 'cancelled').length / financialData.length) * 100}
                        variant="secondary"
                        className="mb-2"
                      />
                    </div>
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between">
                        <span className="fw-medium">Total Transactions</span>
                        <span className="text-primary fw-medium">{financialData.length}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Quick Financial Actions */}
            <Row>
              <Col lg={12}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Quick Financial Actions</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <Button 
                          variant="outline-primary" 
                          className="w-100 mb-2"
                          onClick={() => setShowAddIncomeModal(true)}
                        >
                          <IconifyIcon icon="ri:add-line" className="me-2" />
                          Add Income
                        </Button>
                      </Col>
                      <Col md={3}>
                        <Button 
                          variant="outline-danger" 
                          className="w-100 mb-2"
                          onClick={() => setShowAddExpenseModal(true)}
                        >
                          <IconifyIcon icon="ri:subtract-line" className="me-2" />
                          Add Expense
                        </Button>
                      </Col>
                      <Col md={3}>
                        <Button 
                          variant="outline-warning" 
                          className="w-100 mb-2"
                          onClick={() => setShowRemindersModal(true)}
                        >
                          <IconifyIcon icon="ri:alarm-warning-line" className="me-2" />
                          Send Reminders
                        </Button>
                      </Col>
                      <Col md={3}>
                        <Button 
                          variant="outline-info" 
                          className="w-100 mb-2"
                          onClick={() => setShowReportModal(true)}
                        >
                          <IconifyIcon icon="ri:file-chart-line" className="me-2" />
                          Generate Report
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="transactions" title="Transactions">
            <Row className="mb-3">
              <Col lg={2}>
                <Form.Control
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)}>
                  <option value="all">All Communities</option>
                  <option value="com-001">Green Valley Apartments</option>
                  <option value="com-002">Sunset Heights</option>
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utility">Utility</option>
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Control
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="From Date"
                />
              </Col>
              <Col lg={2} className="text-end">
                <Button 
                  variant="primary"
                  onClick={() => {
                    setEditingRecord(null);
                    reset();
                    setShowModal(true);
                  }}
                >
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Transaction
                </Button>
              </Col>
            </Row>



            <Card>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Date</th>
                        <th>Invoice #</th>
                        <th>Community</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Unit</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((record) => (
                        <tr key={record.id}>
                          <td>{new Date(record.transaction_date).toLocaleDateString()}</td>
                          <td>{record.invoice_number || '-'}</td>
                          <td>{record.community_name}</td>
                          <td>
                            <Badge bg={getTypeBadge(record.type)}>
                              {record.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-capitalize">{record.category.replace('_', ' ')}</td>
                          <td>{record.description}</td>
                          <td>{record.unit_number || '-'}</td>
                          <td className={record.type === 'income' ? 'text-success' : 'text-danger'}>
                            {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                          </td>
                          <td>
                            <Badge bg={getStatusBadge(record.status)}>
                              {record.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-capitalize">{record.payment_method?.replace('_', ' ') || '-'}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="light" size="sm">
                                <IconifyIcon icon="ri:more-2-line" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(record)}>
                                  <IconifyIcon icon="ri:edit-line" className="me-1" />
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <IconifyIcon icon="ri:download-line" className="me-1" />
                                  Download Invoice
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => {
                                    setRecordToDelete(record.id);
                                    setShowDeleteModal(true);
                                  }}
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
                  </table>
                </div>
              </Card.Body>
            </Card>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <Row className="mt-3">
                <Col lg={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                      Showing {startIndex + 1}-{endIndex} of {totalItems} transactions
                    </span>
                    <Pagination className="mb-0">
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const showPage = page === 1 || 
                                       page === totalPages || 
                                       Math.abs(page - currentPage) <= 1;
                        
                        if (!showPage) {
                          if (page === 2 && currentPage > 4) {
                            return <Pagination.Ellipsis key={page} />;
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 3) {
                            return <Pagination.Ellipsis key={page} />;
                          }
                          return null;
                        }
                        
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      })}
                      <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                </Col>
              </Row>
            )}
          </Tab>

          <Tab eventKey="budget" title="Budget Management">
            <Row className="mb-3">
              <Col className="text-end">
                <Button variant="primary">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Budget Item
                </Button>
              </Col>
            </Row>

            <Row>
              {budgetData.map((budget) => (
                <Col lg={4} md={6} key={budget.id} className="mb-3">
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="mb-0">{budget.category}</h6>
                        <Badge bg={budget.spent_amount > budget.allocated_amount ? 'danger' : 'success'}>
                          {budget.budget_period.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <small>Allocated: {formatCurrency(budget.allocated_amount)}</small>
                          <small>Spent: {formatCurrency(budget.spent_amount)}</small>
                        </div>
                      </div>
                      
                      <ProgressBar 
                        now={(budget.spent_amount / budget.allocated_amount) * 100}
                        variant={budget.spent_amount > budget.allocated_amount ? 'danger' : 'success'}
                        className="mb-2"
                      />
                      
                      <div className="text-center">
                        <small className="text-muted">
                          Remaining: {formatCurrency(budget.allocated_amount - budget.spent_amount)}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="reports" title="Financial Reports">
            <Row>
              <Col lg={12}>
                <Card>
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5>Payment Status Distribution</h5>
                      <div>
                        <Button variant="outline-primary" size="sm" className="me-2">
                          <IconifyIcon icon="ri:download-line" className="me-1" />
                          Export Report
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <IconifyIcon icon="ri:printer-line" className="me-1" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <ReactApexChart
                      options={paymentStatusChartOptions}
                      series={[{ 
                        name: 'Count', 
                        data: [
                          statistics.paidCount,
                          financialData.filter(r => r.status === 'pending').length,
                          statistics.overdueCount,
                          financialData.filter(r => r.status === 'partial').length
                        ] 
                      }]}
                      type="bar"
                      height={300}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5>Revenue vs Expenses</h5>
                  </Card.Header>
                  <Card.Body>
                    <ReactApexChart
                      options={revenueChartOptions}
                      series={[
                        { name: 'Income', data: [45000, 52000, 48000, 61000, 55000, 67000] },
                        { name: 'Expenses', data: [35000, 41000, 36000, 46000, 45000, 50000] }
                      ]}
                      type="area"
                      height={300}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5>Expense Breakdown</h5>
                  </Card.Header>
                  <Card.Body>
                    <ReactApexChart
                      options={expenseChartOptions}
                      series={[35000, 22000, 30000, 8000]}
                      type="donut"
                      height={300}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </ComponentContainerCard>

      {/* Add/Edit Transaction Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRecord ? 'Edit Transaction' : 'Add New Transaction'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateOrUpdate)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Community *</Form.Label>
                  <Form.Select {...register('community_id')} isInvalid={!!errors.community_id}>
                    <option value="">Select Community</option>
                    <option value="com-001">Green Valley Apartments</option>
                    <option value="com-002">Sunset Heights</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.community_id?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select {...register('type')} isInvalid={!!errors.type}>
                    <option value="">Select Type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="utility">Utility</option>
                    <option value="penalty">Penalty</option>
                    <option value="refund">Refund</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.type?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select {...register('category')} isInvalid={!!errors.category}>
                    <option value="">Select Category</option>
                    <option value="maintenance_fee">Maintenance Fee</option>
                    <option value="amenity_booking">Amenity Booking</option>
                    <option value="penalty">Penalty</option>
                    <option value="water_bill">Water Bill</option>
                    <option value="electricity_bill">Electricity Bill</option>
                    <option value="security">Security</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="gardening">Gardening</option>
                    <option value="repairs">Repairs</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.category?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...register('status')} isInvalid={!!errors.status}>
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="partial">Partial</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control {...register('description')} isInvalid={!!errors.description} />
              <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount *</Form.Label>
                  <Form.Control type="number" step="0.01" {...register('amount')} isInvalid={!!errors.amount} />
                  <Form.Control.Feedback type="invalid">{errors.amount?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date *</Form.Label>
                  <Form.Control type="date" {...register('transaction_date')} isInvalid={!!errors.transaction_date} />
                  <Form.Control.Feedback type="invalid">{errors.transaction_date?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit Number</Form.Label>
                  <Form.Control {...register('unit_number')} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select {...register('payment_method')}>
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Number</Form.Label>
                  <Form.Control {...register('invoice_number')} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tax Amount</Form.Label>
                  <Form.Control type="number" step="0.01" {...register('tax_amount')} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Amount</Form.Label>
                  <Form.Control type="number" step="0.01" {...register('discount_amount')} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control as="textarea" rows={3} {...register('remarks')} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingRecord ? 'Update' : 'Create'} Transaction
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Income Modal */}
      <Modal show={showAddIncomeModal} onHide={() => setShowAddIncomeModal(false)} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:add-circle-line" className="me-2" />
            Add New Income
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Community *</Form.Label>
                <Form.Select>
                  <option value="">Select Community</option>
                  <option value="com-001">Green Valley Apartments</option>
                  <option value="com-002">Sunset Heights</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Income Category *</Form.Label>
                <Form.Select>
                  <option value="">Select Category</option>
                  <option value="maintenance_fee">Maintenance Fee</option>
                  <option value="amenity_booking">Amenity Booking</option>
                  <option value="parking_fee">Parking Fee</option>
                  <option value="late_fee">Late Fee</option>
                  <option value="penalty">Penalty</option>
                  <option value="other">Other Income</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control type="number" step="0.01" placeholder="Enter amount" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Transaction Date *</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter income description" />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unit Number</Form.Label>
                <Form.Control placeholder="e.g., A-101" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select>
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddIncomeModal(false)}>Cancel</Button>
          <Button variant="success">
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Add Income
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Expense Modal */}
      <Modal show={showAddExpenseModal} onHide={() => setShowAddExpenseModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:subtract-line" className="me-2" />
            Add New Expense
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Community *</Form.Label>
                <Form.Select>
                  <option value="">Select Community</option>
                  <option value="com-001">Green Valley Apartments</option>
                  <option value="com-002">Sunset Heights</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expense Category *</Form.Label>
                <Form.Select>
                  <option value="">Select Category</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="security">Security</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="gardening">Gardening</option>
                  <option value="repairs">Repairs</option>
                  <option value="supplies">Supplies</option>
                  <option value="other">Other Expense</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control type="number" step="0.01" placeholder="Enter amount" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expense Date *</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter expense description" />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vendor/Supplier</Form.Label>
                <Form.Control placeholder="Enter vendor name" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select>
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control placeholder="Enter invoice number" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Receipt Attached</Form.Label>
                <Form.Select>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddExpenseModal(false)}>Cancel</Button>
          <Button variant="danger">
            <IconifyIcon icon="ri:subtract-line" className="me-1" />
            Add Expense
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Send Reminders Modal */}
      <Modal show={showRemindersModal} onHide={() => setShowRemindersModal(false)} size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <IconifyIcon icon="ri:alarm-warning-line" className="me-2" />
            Send Payment Reminders
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            Send automated reminders to community members with pending or overdue payments.
          </Alert>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Community *</Form.Label>
                <Form.Select>
                  <option value="">Select Community</option>
                  <option value="com-001">Green Valley Apartments</option>
                  <option value="com-002">Sunset Heights</option>
                  <option value="all">All Communities</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Reminder Type *</Form.Label>
                <Form.Select>
                  <option value="">Select Type</option>
                  <option value="pending">Pending Payments</option>
                  <option value="overdue">Overdue Payments</option>
                  <option value="both">Both Pending & Overdue</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Communication Method *</Form.Label>
                <Form.Select>
                  <option value="">Select Method</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="all">All Methods</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Reminder Template</Form.Label>
                <Form.Select>
                  <option value="gentle">Gentle Reminder</option>
                  <option value="firm">Firm Reminder</option>
                  <option value="urgent">Urgent Notice</option>
                  <option value="custom">Custom Message</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Custom Message (Optional)</Form.Label>
            <Form.Control as="textarea" rows={4} placeholder="Enter custom reminder message..." />
          </Form.Group>
          
          <div className="bg-light p-3 rounded">
            <h6 className="mb-2">Preview:</h6>
            <p className="mb-1"><strong>Recipients:</strong> 15 community members</p>
            <p className="mb-1"><strong>Pending Amount:</strong> ₹45,000</p>
            <p className="mb-1"><strong>Overdue Amount:</strong> ₹12,500</p>
            <p className="mb-0"><strong>Total Recipients:</strong> 23 members</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemindersModal(false)}>Cancel</Button>
          <Button variant="warning">
            <IconifyIcon icon="ri:send-plane-line" className="me-1" />
            Send Reminders
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Generate Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg">
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:file-chart-line" className="me-2" />
            Generate Financial Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            Generate comprehensive financial reports for analysis and record keeping.
          </Alert>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Report Type *</Form.Label>
                <Form.Select>
                  <option value="">Select Report Type</option>
                  <option value="monthly">Monthly Financial Summary</option>
                  <option value="quarterly">Quarterly Report</option>
                  <option value="yearly">Annual Report</option>
                  <option value="custom">Custom Period</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Community</Form.Label>
                <Form.Select>
                  <option value="all">All Communities</option>
                  <option value="com-001">Green Valley Apartments</option>
                  <option value="com-002">Sunset Heights</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>From Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>To Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Include Sections</Form.Label>
            <div className="row">
              <Col md={6}>
                <Form.Check type="checkbox" label="Income Summary" defaultChecked />
                <Form.Check type="checkbox" label="Expense Breakdown" defaultChecked />
                <Form.Check type="checkbox" label="Payment Status" defaultChecked />
              </Col>
              <Col md={6}>
                <Form.Check type="checkbox" label="Budget Analysis" defaultChecked />
                <Form.Check type="checkbox" label="Trend Analysis" />
                <Form.Check type="checkbox" label="Charts & Graphs" defaultChecked />
              </Col>
            </div>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Export Format</Form.Label>
                <Form.Select>
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV Data</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Report To</Form.Label>
                <Form.Control type="email" placeholder="Enter email address" />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="bg-light p-3 rounded">
            <h6 className="mb-2">Report Preview:</h6>
            <ul className="mb-0">
              <li>Financial Summary (Jan 2024)</li>
              <li>Income: ₹2,45,000 | Expenses: ₹1,89,500</li>
              <li>Net Income: ₹55,500</li>
              <li>Collection Rate: 87.5%</li>
              <li>Overdue Payments: 3 transactions</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button variant="info">
            <IconifyIcon icon="ri:download-line" className="me-1" />
            Generate Report
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FinanceBilling;
