"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListPayments } from "@/hooks/usePayments";
import { Database } from "@/lib/database.types";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "react-bootstrap";

interface UpcomingPaymentsProps {
  paymentId: string;
}

type Payment = Database["public"]["Tables"]["payments"]["Row"] & {
  user_profile?: Database["public"]["Tables"]["profiles"]["Row"];
  society?: Database["public"]["Tables"]["societies"]["Row"];
  unit?: Database["public"]["Tables"]["units"]["Row"];
};

const UpcomingPayments = ({ paymentId }: UpcomingPaymentsProps) => {
  const { data: allPayments = [], isLoading } = useListPayments();

  // Filter for pending, upcoming, and overdue payments
  const upcomingPayments = allPayments.filter(payment => {
    if (payment.id === paymentId) return false; // Exclude current payment
    
    const status = payment.status?.toLowerCase();
    return status === 'pending' || status === 'overdue' || status === 'due';
  });

  // Sort by due date (most urgent first)
  const sortedPayments = upcomingPayments.sort((a, b) => {
    const dateA = new Date(a.due_date || a.payment_date || 0);
    const dateB = new Date(b.due_date || b.payment_date || 0);
    return dateA.getTime() - dateB.getTime();
  });

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "overdue":
        return "danger";
      case "due":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "solar:hourglass-broken";
      case "overdue":
        return "solar:danger-circle-broken";
      case "due":
        return "solar:calendar-broken";
      default:
        return "solar:document-broken";
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No due date";
    
    const due = new Date(dueDate);
    return due.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="mb-4 h-100">
      <CardHeader className="border-bottom">
        <CardTitle as={"h5"}>Upcoming & Pending Payments</CardTitle>
      </CardHeader>
      <CardBody className="p-0 d-flex flex-column h-100">
        <div 
          className="flex-fill upcoming-payments-scroll"
          style={{ 
            maxHeight: '500px', 
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {isLoading ? (
            <div className="text-center py-5 px-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 mb-0 text-muted fs-14">Loading upcoming payments...</p>
            </div>
          ) : sortedPayments.length === 0 ? (
            <div className="text-center py-5 px-4">
              <IconifyIcon icon="solar:check-circle-broken" className="fs-40 text-success mb-3" />
              <h6 className="text-muted fw-medium">All Caught Up!</h6>
              <p className="text-muted mb-0 fs-14">No pending or upcoming payments found</p>
            </div>
          ) : (
            <div className="p-4">
              {sortedPayments.map((payment, idx) => {
                const daysUntilDue = getDaysUntilDue(payment.due_date);
                const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                const isDueToday = daysUntilDue === 0;
                const isDueSoon = daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7;

                return (
                  <div
                    key={payment.id}
                    className={`d-flex align-items-start p-3 rounded-3 mb-3 border shadow-sm ${
                      isOverdue ? 'border-danger bg-danger-subtle' :
                      isDueToday ? 'border-warning bg-warning-subtle' :
                      isDueSoon ? 'border-info bg-info-subtle' :
                      'border-light bg-white'
                    }`}
                    style={{ 
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                    }}
                  >
                    <div className="flex-shrink-0 me-3">
                      <div className={`p-2 rounded-circle bg-${getStatusVariant(payment.status || '')}-subtle`}>
                        <IconifyIcon
                          icon={getStatusIcon(payment.status || '')}
                          className={`fs-18 text-${getStatusVariant(payment.status || '')}`}
                        />
                      </div>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 fs-15 fw-medium">
                          {payment.payment_type || 'Payment'}
                        </h6>
                        <Badge 
                          bg={getStatusVariant(payment.status || '')} 
                          className="fs-12 fw-medium text-uppercase"
                          style={{ letterSpacing: '0.5px' }}
                        >
                          {payment.status || 'Unknown'}
                        </Badge>
                      </div>

                      <div className="mb-2">
                        <p className="mb-1 fs-14 text-dark fw-medium">
                          {payment.payer_profile?.full_name || 'Unknown User'}
                        </p>
                        <p className="mb-0 fs-13 text-muted">
                          Unit: {payment.unit?.unit_number || 'N/A'}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <span className="fs-16 fw-bold text-dark">
                            ${payment.amount?.toFixed(2) || '0.00'}
                          </span>
                          <span className="fs-13 text-muted">
                            Due: {formatDueDate(payment.due_date)}
                          </span>
                        </div>
                        
                        {daysUntilDue !== null && (
                          <div className="text-end">
                            <span className={`fs-13 fw-medium ${
                              isOverdue ? 'text-danger' :
                              isDueToday ? 'text-warning' :
                              isDueSoon ? 'text-info' :
                              'text-muted'
                            }`}>
                              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                               isDueToday ? 'Due today' :
                               `${daysUntilDue} days left`}
                            </span>
                          </div>
                        )}
                      </div>

                      {payment.description && (
                        <p className="mb-0 fs-13 text-muted mt-2">
                          {payment.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardBody>
      
      <style jsx global>{`
        .upcoming-payments-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .upcoming-payments-scroll::-webkit-scrollbar-track {
          background: #f1f3f4;
          border-radius: 10px;
        }
        
        .upcoming-payments-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .upcoming-payments-scroll::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </Card>
  );
};

export default UpcomingPayments; 