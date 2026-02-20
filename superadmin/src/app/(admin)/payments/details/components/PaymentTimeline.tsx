"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Database } from "@/lib/database.types";
import { Card, CardBody } from "react-bootstrap";

type Payment = Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
  id: string;
  amount: number;
  user_profile?: {
    full_name: string;
    avatar_url: string;
    email: string;
    phone: string;
  };
  payer_profile?: {
    full_name: string;
    avatar_url: string;
    email: string;
    phone: string;
  };
  society?: {
    id: string;
    name: string;
    address: string;
  };
};

interface PaymentTimelineProps {
  payment: Payment;
}

// Generate timeline events from real payment data
const generateTimelineEvents = (payment: Payment) => {
  const events = [];
  
  // 1. Invoice Generated (from created_at or due_date - 7 days)
  const invoiceDate = payment.invoice_generated_at || payment.created_at || 
    (payment.due_date ? new Date(new Date(payment.due_date).getTime() - 7 * 24 * 60 * 60 * 1000) : new Date());
  
  events.push({
    id: 1,
    title: "Invoice Generated",
    description: `Invoice #${payment.reference_number || `INV-${payment.id?.substring(0, 6).toUpperCase()}`} was generated for ${payment.payment_type || 'payment'}`,
    date: new Date(invoiceDate),
    icon: "solar:file-text-broken",
    iconBg: "bg-info-subtle",
    iconColor: "text-info",
    status: "completed"
  });

  // 2. Payment Reminder Sent (if reminder_sent_at exists or default to due_date - 1 day)
  if (payment.reminder_sent_at || payment.due_date) {
    const reminderDate = payment.reminder_sent_at || 
      new Date(new Date(payment.due_date!).getTime() - 24 * 60 * 60 * 1000);
    
    events.push({
      id: 2,
      title: "Payment Reminder Sent",
      description: `Email reminder sent to ${payment.payer_profile?.full_name || payment.user_profile?.full_name || 'user'}`,
      date: new Date(reminderDate),
      icon: "solar:bell-bing-broken",
      iconBg: "bg-warning-subtle",
      iconColor: "text-warning",
      status: "completed"
    });
  }

  // 3. Payment Initiated (if initiated_at exists or payment_date - 5 minutes)
  if (payment.initiated_at || payment.payment_date) {
    const initiatedDate = payment.initiated_at || 
      (payment.payment_date ? new Date(new Date(payment.payment_date).getTime() - 5 * 60 * 1000) : null);
    
    if (initiatedDate) {
      events.push({
        id: 3,
        title: "Payment Initiated",
        description: `Payment of $${payment.amount} initiated via ${payment.payment_method || 'Unknown method'}`,
        date: new Date(initiatedDate),
        icon: "solar:card-broken",
        iconBg: "bg-primary-subtle",
        iconColor: "text-primary",
        status: payment.status === 'completed' || payment.status === 'failed' ? "completed" : "pending"
      });
    }
  }

  // 4. Payment Status Events
  if (payment.status === 'completed' && (payment.completed_at || payment.paid_at || payment.payment_date)) {
    const completedDate = payment.completed_at || payment.paid_at || payment.payment_date;
    events.push({
      id: 4,
      title: "Payment Completed",
      description: `Payment of $${payment.amount} was successfully processed`,
      date: new Date(completedDate!),
      icon: "solar:check-circle-broken",
      iconBg: "bg-success-subtle",
      iconColor: "text-success",
      status: "completed"
    });

    // Receipt Generated (after payment completion)
    events.push({
      id: 5,
      title: "Receipt Generated",
      description: `Receipt #REC-${payment.reference_number || payment.id?.substring(0, 6).toUpperCase()} was generated and sent to user`,
      date: new Date(new Date(completedDate!).getTime() + 5 * 60 * 1000), // 5 minutes after completion
      icon: "solar:document-text-broken",
      iconBg: "bg-success-subtle",
      iconColor: "text-success",
      status: "completed"
    });
  } else if (payment.status === 'failed' && payment.failed_at) {
    events.push({
      id: 4,
      title: "Payment Failed",
      description: `Payment of $${payment.amount} failed to process`,
      date: new Date(payment.failed_at),
      icon: "solar:close-circle-broken",
      iconBg: "bg-danger-subtle",
      iconColor: "text-danger",
      status: "failed"
    });
  } else if (payment.status === 'pending' && payment.due_date) {
    events.push({
      id: 4,
      title: "Payment Due",
      description: `Payment of $${payment.amount} is due for processing`,
      date: new Date(payment.due_date),
      icon: "solar:hourglass-broken",
      iconBg: "bg-warning-subtle",
      iconColor: "text-warning",
      status: "pending"
    });
  } else if (payment.status === 'overdue' && payment.due_date) {
    events.push({
      id: 4,
      title: "Payment Overdue",
      description: `Payment of $${payment.amount} is now overdue`,
      date: new Date(payment.due_date),
      icon: "solar:alarm-broken",
      iconBg: "bg-danger-subtle",
      iconColor: "text-danger",
      status: "overdue"
    });
  }

  // Sort events by date (most recent first)
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const PaymentTimeline = ({ payment }: PaymentTimelineProps) => {
  const timelineEvents = generateTimelineEvents(payment);

  return (
    <Card className="mb-4 h-100">
      <CardBody>
        <h4 className="mb-4">Payment Timeline</h4>
        
        <div className="timeline-scroll-container">
          <div className="position-relative timeline-wrapper">
            <div className="timeline-line"></div>
            
            {timelineEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div key={event.id} className="timeline-item-row mb-4">
                  <div className="timeline-item-container">
                    {isLeft ? (
                      // Left side item
                      <>
                        <div className="timeline-content-left">
                          <div className="timeline-item-card">
                            <div className="d-flex align-items-start">
                              <div className="timeline-content-text">
                                <h5 className="mb-1 fs-16">{event.title}</h5>
                                <p className="text-muted mb-1">{event.description}</p>
                                <p className="fs-13 mb-0">
                                  <IconifyIcon icon="solar:calendar-broken" className="me-1 text-muted" />
                                  {event.date.toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="timeline-content-right"></div>
                      </>
                    ) : (
                      // Right side item
                      <>
                        <div className="timeline-content-left"></div>
                        <div className="timeline-content-right">
                          <div className="timeline-item-card">
                            <div className="d-flex align-items-start">
                              <div className="timeline-content-text">
                                <h5 className="mb-1 fs-16">{event.title}</h5>
                                <p className="text-muted mb-1">{event.description}</p>
                                <p className="fs-13 mb-0">
                                  <IconifyIcon icon="solar:calendar-broken" className="me-1 text-muted" />
                                  {event.date.toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Center timeline icon - positioned absolutely to align with line */}
                    <div className="timeline-icon-center">
                      <div className={`timeline-icon ${event.iconBg} rounded-circle flex-centered`}>
                        <IconifyIcon icon={event.icon} className={`fs-20 ${event.iconColor}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx global>{`
          .timeline-scroll-container {
            max-height: 500px;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 5px;
          }
          
          .timeline-scroll-container::-webkit-scrollbar {
            width: 4px;
          }
          
          .timeline-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .timeline-scroll-container::-webkit-scrollbar-thumb {
            background: #d6e1ff;
            border-radius: 4px;
          }
          
          .timeline-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #b3d1ff;
          }
          
          .timeline-wrapper {
            padding: 0 15px;
          }
          
          .timeline-line {
            position: absolute;
            left: 50%;
            top: 0;
            height: 100%;
            border-left: 2px solid #d6e1ff;
            transform: translateX(-50%);
            z-index: 1;
          }
          
          .timeline-item-row {
            position: relative;
            width: 100%;
          }
          
          .timeline-item-container {
            display: flex;
            width: 100%;
            align-items: center;
            position: relative;
            min-height: 80px;
          }
          
          .timeline-content-left,
          .timeline-content-right {
            flex: 1;
            max-width: calc(50% - 30px);
          }
          
          .timeline-content-left {
            text-align: left;
            padding-right: 30px;
          }
          
          .timeline-content-right {
            text-align: left;
            padding-left: 80px; 
          }
          
          .timeline-item-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease;
          }
          
          .timeline-item-card:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transform: translateY(-1px);
          }
          
          .timeline-content-text {
            width: 100%;
          }
          
          .timeline-icon-center {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 3;
          }
          
          .timeline-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </CardBody>
    </Card>
  );
};

export default PaymentTimeline;
