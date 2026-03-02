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
import { useListCommunities } from '@/hooks/useCommunities';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Finance & Billing Types are imported from hooks

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
  const { data: communitiesData } = useListCommunities();
  const communities = useMemo(() => communitiesData?.data || [], [communitiesData]);
  
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
  
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
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

  const communityOptions = useMemo(
    () =>
      communities.map((community) => ({
        value: community.id,
        label: community.name,
      })),
    [communities]
  );

  const totalTransactions = financialData.length;
  const paidTransactions = financialData.filter((record) => record.status === 'paid').length;
  const pendingTransactionCount = financialData.filter((record) => record.status === 'pending').length;
  const overdueTransactionCount = financialData.filter((record) => record.status === 'overdue').length;
  const cancelledTransactionCount = financialData.filter((record) => record.status === 'cancelled').length;
  const failedTransactionCount = financialData.filter((record) => record.status === ('failed' as FinancialRecord['status'])).length;
  const failedLikeTransactionCount = overdueTransactionCount + cancelledTransactionCount + failedTransactionCount;

  const recentMonthTrends = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-GH', { month: 'short' });
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      date.setHours(0, 0, 0, 0);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: formatter.format(date),
        income: 0,
        expense: 0,
      };
    });

    const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));

    financialData.forEach((record) => {
      const recordDate = new Date(record.transaction_date);
      if (Number.isNaN(recordDate.getTime())) {
        return;
      }

      const key = `${recordDate.getFullYear()}-${recordDate.getMonth()}`;
      const targetIndex = bucketIndex.get(key);
      if (targetIndex === undefined) {
        return;
      }

      if (record.type === 'expense') {
        buckets[targetIndex].expense += record.amount;
        return;
      }

      buckets[targetIndex].income += record.amount;
    });

    return {
      categories: buckets.map((bucket) => bucket.label),
      incomeSeries: buckets.map((bucket) => Number(bucket.income.toFixed(2))),
      expenseSeries: buckets.map((bucket) => Number(bucket.expense.toFixed(2))),
    };
  }, [financialData]);

  const expenseBreakdown = useMemo(() => {
    const fromBudget = budgetData
      .filter((budget) => budget.spent_amount > 0)
      .sort((a, b) => b.spent_amount - a.spent_amount)
      .slice(0, 4)
      .map((budget) => ({
        label: budget.category,
        value: Number(budget.spent_amount.toFixed(2)),
      }));

    if (fromBudget.length > 0) {
      return fromBudget;
    }

    const expenseTotals = new Map<string, number>();
    financialData
      .filter((record) => record.type === 'expense')
      .forEach((record) => {
        expenseTotals.set(record.category, (expenseTotals.get(record.category) || 0) + record.amount);
      });

    const fallback = Array.from(expenseTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }));

    return fallback.length > 0 ? fallback : [{ label: 'No Expense Data', value: 1 }];
  }, [budgetData, financialData]);

  const reminderSummary = useMemo(() => {
    const actionableRecords = financialData.filter((record) =>
      ['pending', 'overdue', 'partial'].includes(record.status)
    );
    const uniqueRecipients = new Set(
      actionableRecords
        .map((record) => record.unit_number?.trim())
        .filter((unit): unit is string => Boolean(unit))
    );

    return {
      pendingAmount: actionableRecords
        .filter((record) => record.status === 'pending' || record.status === 'partial')
        .reduce((sum, record) => sum + record.amount, 0),
      overdueAmount: actionableRecords
        .filter((record) => record.status === 'overdue')
        .reduce((sum, record) => sum + record.amount, 0),
      recipientCount: uniqueRecipients.size,
      totalItems: actionableRecords.length,
    };
  }, [financialData]);

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

  const openCreateTransaction = (type?: FinancialRecord['type']) => {
    setEditingRecord(null);
    setActionError(null);
    reset({
      type,
      status: type === 'income' ? 'pending' : 'paid',
      transaction_date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
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
      categories: recentMonthTrends.categories,
    },
    colors: ['#10b981', '#ef4444'],
    stroke: { curve: 'smooth' as const },
  };

  const expenseChartOptions = {
    chart: { type: 'donut' as const },
    labels: expenseBreakdown.map((item) => item.label.replace('_', ' ')),
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
    setActionError(null);
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
          community_name: communityOptions.find((community) => community.value === data.community_id)?.label || 'Unknown Community',
        });
      }
      
      setShowModal(false);
      setEditingRecord(null);
      reset();
      setActionSuccess(`Transaction ${editingRecord ? 'updated' : 'created'} successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving financial record:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to save financial record.');
    }
  };

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record);
    reset(record);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (recordToDelete) {
      setActionError(null);
      try {
        await deleteFinancialRecord.mutateAsync(recordToDelete);
        setRecordToDelete(null);
        setShowDeleteModal(false);
        setActionSuccess('Transaction deleted successfully.');
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (error) {
        console.error('Error deleting financial record:', error);
        setActionError(error instanceof Error ? error.message : 'Failed to delete financial record.');
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
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
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
        {actionSuccess && (
          <Alert variant="success" dismissible onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}
        {actionError && (
          <Alert variant="danger" dismissible onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}
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
                        {statistics.netIncome >= 0 ? "+" : ""}
                        {statistics.totalIncome > 0 ? ((statistics.netIncome / statistics.totalIncome) * 100).toFixed(1) : '0.0'}% margin
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
                      now={totalTransactions > 0 ? (statistics.overdueCount / totalTransactions) * 100 : 0} 
                      variant="danger" 
                      className="mt-2"
                    />
                    <div className="mt-2">
                      <small className="text-muted">
                        {totalTransactions > 0 ? ((statistics.overdueCount / totalTransactions) * 100).toFixed(1) : '0.0'}% of total transactions
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
                      now={totalTransactions > 0 ? (statistics.paidCount / totalTransactions) * 100 : 0} 
                      variant="success" 
                      className="mt-2"
                    />
                    <div className="mt-2">
                      <small className="text-muted">
                        {totalTransactions > 0 ? ((statistics.paidCount / totalTransactions) * 100).toFixed(1) : '0.0'}% of total transactions
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
                        now={totalTransactions > 0 ? (paidTransactions / totalTransactions) * 100 : 0}
                        variant="success"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Pending</span>
                        <span className="text-warning fw-medium">{pendingTransactionCount}</span>
                      </div>
                      <ProgressBar 
                        now={totalTransactions > 0 ? (pendingTransactionCount / totalTransactions) * 100 : 0}
                        variant="warning"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Overdue</span>
                        <span className="text-danger fw-medium">{overdueTransactionCount}</span>
                      </div>
                      <ProgressBar 
                        now={totalTransactions > 0 ? (overdueTransactionCount / totalTransactions) * 100 : 0}
                        variant="danger"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Failed</span>
                        <span className="text-danger fw-medium">{failedTransactionCount}</span>
                      </div>
                      <ProgressBar 
                        now={totalTransactions > 0 ? (failedTransactionCount / totalTransactions) * 100 : 0}
                        variant="danger"
                        className="mb-2"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">Cancelled</span>
                        <span className="text-secondary fw-medium">{cancelledTransactionCount}</span>
                      </div>
                      <ProgressBar 
                        now={totalTransactions > 0 ? (cancelledTransactionCount / totalTransactions) * 100 : 0}
                        variant="secondary"
                        className="mb-2"
                      />
                    </div>
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between">
                        <span className="fw-medium">Total Transactions</span>
                        <span className="text-primary fw-medium">{totalTransactions}</span>
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
                          onClick={() => openCreateTransaction('income')}
                        >
                          <IconifyIcon icon="ri:add-line" className="me-2" />
                          Add Income
                        </Button>
                      </Col>
                      <Col md={3}>
                        <Button 
                          variant="outline-danger" 
                          className="w-100 mb-2"
                          onClick={() => openCreateTransaction('expense')}
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
                  {communityOptions.map((community) => (
                    <option key={community.value} value={community.value}>
                      {community.label}
                    </option>
                  ))}
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
                    openCreateTransaction();
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
                          <td className="text-capitalize">
                            {record.payment_method === 'upi'
                              ? 'Mobile Money'
                              : record.payment_method?.replace('_', ' ') || '-'}
                          </td>
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
                          pendingTransactionCount,
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
                        { name: 'Income', data: recentMonthTrends.incomeSeries },
                        { name: 'Expenses', data: recentMonthTrends.expenseSeries }
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
                      series={expenseBreakdown.map((item) => item.value)}
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
                    {communityOptions.map((community) => (
                      <option key={community.value} value={community.value}>
                        {community.label}
                      </option>
                    ))}
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
                    <option value="upi">Mobile Money</option>
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
                  <option value="all">All Communities</option>
                  {communityOptions.map((community) => (
                    <option key={community.value} value={community.value}>
                      {community.label}
                    </option>
                  ))}
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
                  <option value="in_app">In-App</option>
                  <option value="all">All Available Channels</option>
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
            <p className="mb-1"><strong>Recipients:</strong> {reminderSummary.recipientCount} unit contacts</p>
            <p className="mb-1"><strong>Pending Amount:</strong> {formatCurrency(reminderSummary.pendingAmount)}</p>
            <p className="mb-1"><strong>Overdue Amount:</strong> {formatCurrency(reminderSummary.overdueAmount)}</p>
            <p className="mb-0"><strong>Total Items:</strong> {reminderSummary.totalItems} outstanding transactions</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemindersModal(false)}>Close</Button>
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
                  {communityOptions.map((community) => (
                    <option key={community.value} value={community.value}>
                      {community.label}
                    </option>
                  ))}
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
              <li>Financial Summary ({new Intl.DateTimeFormat('en-GH', { month: 'short', year: 'numeric' }).format(new Date())})</li>
              <li>Income: {formatCurrency(statistics.totalIncome)} | Expenses: {formatCurrency(statistics.totalExpense)}</li>
              <li>Net Income: {formatCurrency(statistics.netIncome)}</li>
              <li>Collection Rate: {statistics.collectionRate.toFixed(1)}%</li>
              <li>Attention Items: {failedLikeTransactionCount} overdue or cancelled transactions</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FinanceBilling;
