"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListPayments, useDeletePayment } from "@/hooks/usePayments";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, Button, Dropdown } from "react-bootstrap";
import { Database } from "@/lib/database.types";
import { useState } from "react";

interface PaymentHistoryProps {
  paymentId: string;
}

const PaymentHistory = ({ paymentId }: PaymentHistoryProps) => {
  // Fetch all payments
  const { data: allPayments = [], isLoading } = useListPayments();
  const deletePayment = useDeletePayment();
  
  // State for table functionality
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'overdue'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'maintenance' | 'service' | 'amenity' | 'hoa' | 'utilities' | 'other'>('all');
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      case "overdue":
        return "danger";
      default:
        return "info";
    }
  };

  // Get payment category icon and details
  const getPaymentCategoryInfo = (paymentType: string, description?: string) => {
    const type = paymentType?.toLowerCase() || '';
    const desc = description?.toLowerCase() || '';
    
    if (type.includes('maintenance') || desc.includes('maintenance') || desc.includes('repair')) {
      return {
        icon: "solar:hammer-broken",
        category: "Maintenance",
        color: "warning",
        bgColor: "warning-subtle"
      };
    } else if (type.includes('service') || type.includes('charges') || desc.includes('service') || desc.includes('charges')) {
      return {
        icon: "solar:settings-broken",
        category: "Service Charges",
        color: "primary",
        bgColor: "primary-subtle"
      };
    } else if (type.includes('amenity') || type.includes('booking') || desc.includes('amenity') || desc.includes('booking') || desc.includes('facility')) {
      return {
        icon: "solar:swimming-broken",
        category: "Amenity Booking",
        color: "success",
        bgColor: "success-subtle"
      };
    } else if (type.includes('hoa') || type.includes('association') || desc.includes('hoa') || desc.includes('association') || desc.includes('monthly payment')) {
      return {
        icon: "solar:buildings-2-broken",
        category: "HOA Dues",
        color: "primary",
        bgColor: "primary-subtle"
      };
    } else if (type.includes('electricity') || type.includes('electric') || desc.includes('electricity') || desc.includes('electric') || desc.includes('power')) {
      return {
        icon: "solar:bolt-broken",
        category: "Electricity",
        color: "warning",
        bgColor: "warning-subtle"
      };
    } else if (type.includes('water') || desc.includes('water') || desc.includes('plumbing')) {
      return {
        icon: "solar:water-drop-broken",
        category: "Water Bill",
        color: "info",
        bgColor: "info-subtle"
      };
    } else if (type.includes('gas') || desc.includes('gas') || desc.includes('heating')) {
      return {
        icon: "solar:flame-broken",
        category: "Gas Bill",
        color: "danger",
        bgColor: "danger-subtle"
      };
    } else if (type.includes('internet') || type.includes('wifi') || type.includes('broadband') || desc.includes('internet') || desc.includes('wifi') || desc.includes('broadband')) {
      return {
        icon: "solar:wifi-router-broken",
        category: "Internet",
        color: "info",
        bgColor: "info-subtle"
      };
    } else if (type.includes('parking') || desc.includes('parking') || desc.includes('garage')) {
      return {
        icon: "solar:car-broken",
        category: "Parking",
        color: "secondary",
        bgColor: "secondary-subtle"
      };
    } else if (type.includes('security') || desc.includes('security') || desc.includes('guard')) {
      return {
        icon: "solar:shield-check-broken",
        category: "Security",
        color: "success",
        bgColor: "success-subtle"
      };
    } else if (type.includes('cleaning') || type.includes('housekeeping') || desc.includes('cleaning') || desc.includes('housekeeping')) {
      return {
        icon: "solar:washing-machine-broken",
        category: "Cleaning",
        color: "info",
        bgColor: "info-subtle"
      };
    } else if (type.includes('rent') || desc.includes('rent') || desc.includes('lease')) {
      return {
        icon: "solar:home-2-broken",
        category: "Rent",
        color: "primary",
        bgColor: "primary-subtle"
      };
    } else if (type.includes('fine') || type.includes('penalty') || desc.includes('fine') || desc.includes('penalty') || desc.includes('violation')) {
      return {
        icon: "solar:danger-triangle-broken",
        category: "Fine/Penalty",
        color: "danger",
        bgColor: "danger-subtle"
      };
    } else if (type.includes('deposit') || desc.includes('deposit') || desc.includes('refund')) {
      return {
        icon: "solar:wallet-money-broken",
        category: "Deposit",
        color: "success",
        bgColor: "success-subtle"
      };
    } else if (type.includes('insurance') || desc.includes('insurance')) {
      return {
        icon: "solar:shield-minimalistic-broken",
        category: "Insurance",
        color: "info",
        bgColor: "info-subtle"
      };
    } else {
      return {
        icon: "solar:bill-list-broken",
        category: "Other",
        color: "secondary",
        bgColor: "secondary-subtle"
      };
    }
  };

  // Format date with more detail
  const formatDetailedDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Get time ago
  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Get payment method icon and formatted text
  const getPaymentMethodInfo = (paymentMethod: string | null) => {
    if (!paymentMethod) return { icon: 'solar:dollar-minimalistic-broken', text: 'Unknown' };
    
    const method = paymentMethod.toLowerCase();
    
    if (method.includes('credit') || method.includes('card')) {
      return { 
        icon: 'solar:card-broken', 
        text: 'Credit Card' 
      };
    } else if (method.includes('bank') || method.includes('transfer')) {
      return { 
        icon: 'solar:bank-broken', 
        text: 'Bank Transfer' 
      };
    } else if (method.includes('cash')) {
      return { 
        icon: 'solar:wallet-money-broken', 
        text: 'Cash' 
      };
    } else if (method.includes('debit')) {
      return { 
        icon: 'solar:card-broken', 
        text: 'Debit Card' 
      };
    } else if (method.includes('paypal')) {
      return { 
        icon: 'solar:dollar-minimalistic-broken', 
        text: 'PayPal' 
      };
    } else if (method.includes('momo') || method.includes('mobile money') || method.includes('mobilemoney')) {
      return { 
        icon: 'solar:smartphone-broken', 
        text: 'MoMo' 
      };
    } else if (method.includes('check') || method.includes('cheque')) {
      return { 
        icon: 'solar:document-text-broken', 
        text: 'Check' 
      };
    } else {
      // Format the original text by replacing underscores with spaces and capitalizing
      const formattedText = paymentMethod
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      return { 
        icon: 'solar:dollar-minimalistic-broken', 
        text: formattedText 
      };
    }
  };

  // Split description text for better display
  const splitDescription = (description: string | null | undefined) => {
    if (!description) return { main: 'No description', detail: null };
    
    // Split on common separators like dash, colon, or pipe
    const separators = [' - ', ': ', ' | ', ' / '];
    
    for (const separator of separators) {
      if (description.includes(separator)) {
        const parts = description.split(separator);
        return {
          main: parts[0].trim(),
          detail: parts.slice(1).join(separator).trim()
        };
      }
    }
    
    // If no separator found, check if it's too long and split at a reasonable point
    if (description.length > 20) {
      const words = description.split(' ');
      if (words.length > 2) {
        const midPoint = Math.ceil(words.length / 2);
        return {
          main: words.slice(0, midPoint).join(' '),
          detail: words.slice(midPoint).join(' ')
        };
      }
    }
    
    return { main: description, detail: null };
  };

  // Filter payments (exclude current payment)
  const filteredPayments = allPayments
    .filter(payment => payment.id !== paymentId) // Exclude current payment
    .filter(payment => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        payment.payment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount.toString().includes(searchTerm) ||
        payment.payer_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      // Apply category filter
      const categoryInfo = getPaymentCategoryInfo(payment.payment_type || '', payment.description || undefined);
      const matchesCategory = categoryFilter === 'all' || 
        (categoryFilter === 'maintenance' && categoryInfo.category === 'Maintenance') ||
        (categoryFilter === 'service' && categoryInfo.category === 'Service Charges') ||
        (categoryFilter === 'amenity' && categoryInfo.category === 'Amenity Booking') ||
        (categoryFilter === 'hoa' && categoryInfo.category === 'HOA Dues') ||
        (categoryFilter === 'utilities' && ['Electricity', 'Water Bill', 'Gas Bill', 'Internet'].includes(categoryInfo.category)) ||
        (categoryFilter === 'other' && !['Maintenance', 'Service Charges', 'Amenity Booking', 'HOA Dues', 'Electricity', 'Water Bill', 'Gas Bill', 'Internet'].includes(categoryInfo.category));

      return matchesSearch && matchesStatus && matchesCategory;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment.mutateAsync(paymentId);
      } catch (error) {
        console.error('Failed to delete payment:', error);
      }
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom">
        <div>
          <CardTitle as={"h4"}>Payment History</CardTitle>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <div className="app-search" style={{ minWidth: '200px' }}>
            <div className="position-relative">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
            </div>
          </div>

          <Dropdown>
            <Dropdown.Toggle
              as={'button'}
              className="btn btn-sm btn-outline-primary rounded">
              Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }} active={statusFilter === 'all'}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setStatusFilter('pending');
                setCurrentPage(1);
              }} active={statusFilter === 'pending'}>Pending</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setStatusFilter('completed');
                setCurrentPage(1);
              }} active={statusFilter === 'completed'}>Completed</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setStatusFilter('failed');
                setCurrentPage(1);
              }} active={statusFilter === 'failed'}>Failed</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setStatusFilter('overdue');
                setCurrentPage(1);
              }} active={statusFilter === 'overdue'}>Overdue</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle
              as={'button'}
              className="btn btn-sm btn-outline-primary rounded">
              Category: {categoryFilter === 'all' ? 'All' : categoryFilter === 'service' ? 'Service' : categoryFilter === 'amenity' ? 'Amenity' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('all');
                setCurrentPage(1);
              }} active={categoryFilter === 'all'}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('maintenance');
                setCurrentPage(1);
              }} active={categoryFilter === 'maintenance'}>Maintenance</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('service');
                setCurrentPage(1);
              }} active={categoryFilter === 'service'}>Service Charges</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('amenity');
                setCurrentPage(1);
              }} active={categoryFilter === 'amenity'}>Amenity Booking</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('hoa');
                setCurrentPage(1);
              }} active={categoryFilter === 'hoa'}>HOA Dues</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('utilities');
                setCurrentPage(1);
              }} active={categoryFilter === 'utilities'}>Utilities</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setCategoryFilter('other');
                setCurrentPage(1);
              }} active={categoryFilter === 'other'}>Other</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle
              as={'a'}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              Export <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-end">
              <Dropdown.Item>Download CSV</Dropdown.Item>
              <Dropdown.Item>Export PDF</Dropdown.Item>
              <Dropdown.Item>Print</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading payment history...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle text-nowrap table-hover table-centered mb-0">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Category & Type</th>
                  <th>Amount & Status</th>
                  <th>Payer Information</th>
                  <th>Payment Date</th>
                  <th>Due Date</th>
                  <th>Payment Method</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <IconifyIcon icon="solar:wallet-money-broken" className="fs-48 text-muted mb-2" />
                        <h5 className="text-muted">No payments found</h5>
                        <p className="text-muted mb-0">
                          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? 
                            'No payments match your current filters' : 
                            'This user has no other payment records'
                          }
                        </p>
                        {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                          <Button variant="outline-primary" className="mt-3" onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setCategoryFilter('all');
                            setCurrentPage(1);
                          }}>
                            <IconifyIcon icon="solar:restart-bold-duotone" className="me-1" /> Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment: any) => {
                    const categoryInfo = getPaymentCategoryInfo(payment.payment_type || '', payment.description || undefined);
                    const timeAgo = getTimeAgo(payment.payment_date);
                    
                    return (
                      <tr key={payment.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className={`bg-${categoryInfo.bgColor} p-2 rounded-circle`}>
                              <IconifyIcon
                                icon={categoryInfo.icon}
                                className={`fs-20 text-${categoryInfo.color}`}
                              />
                            </div>
                            <div>
                              <Link href={`/payments/details?id=${payment.id}`} className="text-dark fw-medium fs-15 text-decoration-none">
                                {categoryInfo.category}
                              </Link>
                              <p className="text-muted mb-0 small">
                                <span className={`badge bg-${categoryInfo.bgColor} text-${categoryInfo.color} fs-12`}>
                                  {payment.payment_type || 'Payment'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-1 fs-16 fw-bold text-dark">
                              ${payment.amount.toFixed(2)}
                            </h6>
                            <span
                              className={`badge bg-${getStatusVariant(
                                payment.status || ""
                              )}-subtle text-${getStatusVariant(payment.status || "")} fs-12`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="mb-1 fw-medium">{payment.payer_profile?.full_name || 'Unknown'}</p>
                            <p className="text-muted mb-0 small">
                              {payment.unit?.unit_number ? `Unit ${payment.unit.unit_number}` : 'No unit'}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="fw-medium">
                              {formatDetailedDate(payment.payment_date)}
                            </span>
                            {timeAgo && (
                              <p className="text-muted mb-0 small">({timeAgo})</p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">
                            {payment.due_date ? formatDetailedDate(payment.due_date) : 'No due date'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {(() => {
                              const methodInfo = getPaymentMethodInfo(payment.payment_method);
                              return (
                                <>
                                  <IconifyIcon 
                                    icon={methodInfo.icon} 
                                    className="me-2 text-muted fs-16" 
                                  />
                                  <span className="fw-medium">{methodInfo.text}</span>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td>
                          <div>
                            {(() => {
                              const descInfo = splitDescription(payment.description);
                              return (
                                <>
                                  <span className="fw-medium">
                                    {descInfo.main}
                                  </span>
                                  {descInfo.detail && (
                                    <p className="text-muted mb-0 small">
                                      {descInfo.detail}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/payments/details?id=${payment.id}`}>
                              <Button variant="light" size="sm" title="View Details">
                                <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                              </Button>
                            </Link>
                            <Link href={`/payments/edit?id=${payment.id}`}>
                              <Button variant="soft-primary" size="sm" title="Edit Payment">
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Button>
                            </Link>
                            <Button 
                              variant="soft-danger" 
                              size="sm" 
                              title="Delete Payment"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
      
      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <Card.Footer>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="text-muted text-nowrap">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} payments
              </div>
              <select 
                className="form-select form-select-sm" 
                style={{ minWidth: '120px' }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
            {totalPages > 1 && (
              <nav aria-label="Payment pagination">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNumber > totalPages) return null;
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default PaymentHistory;
