"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";

const NotificationItem = ({ 
  id, 
  notification_type, 
  title, 
  body, 
  reference_id, 
  action_url, 
  created_at, 
  is_read,
  onMarkAsRead 
}: {
  id: string;
  notification_type?: string;
  title?: string;
  body?: string;
  reference_id?: string;
  action_url?: string;
  created_at: string;
  is_read: boolean;
  onMarkAsRead: (id: string) => void;
}) => {
  const handleClick = () => {
    if (!is_read) {
      onMarkAsRead(id);
    }
  };

  const getNotificationContent = () => {
    if (notification_type === 'join_request') {
      return {
        title: 'New Join Request',
        body: 'A new community join request has been submitted',
        icon: '👥',
        link: '/societies/join-requests'
      };
    }
    return {
      title: title || 'Notification',
      body: body || 'You have a new notification',
      icon: '🔔',
      link: action_url || '#'
    };
  };

  const content = getNotificationContent();
  const timeAgo = new Date(created_at).toLocaleDateString();

  return (
    <DropdownItem 
      className={`py-3 border-bottom text-wrap ${!is_read ? 'bg-light' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex">
        <div className="flex-shrink-0">
          <div className="avatar-sm me-2">
            <span className="avatar-title bg-soft-info text-info fs-20 rounded-circle">
              {content.icon}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between">
            <p className="mb-0 fw-semibold">{content.title}</p>
            {!is_read && (
              <span className="badge bg-primary rounded-pill">New</span>
            )}
          </div>
          <p className="mb-1 text-wrap text-muted small">{content.body}</p>
          <p className="mb-0 text-muted small">{timeAgo}</p>
        </div>
      </div>
    </DropdownItem>
  );
};

const LiveNotifications = () => {
  const { data: session } = useSession();
  
  // For now, use the actual admin user ID that receives notifications
  // This is Emmanuel Broni (superadmin) who gets the join request notifications
  const userId = "75af3e6b-8bfe-4cf4-b70b-adad3d4edaad"; // Emmanuel Broni superadmin
  
  const { data: notifications = [], isLoading } = useNotifications(userId);
  const { data: unreadCount = 0 } = useUnreadNotificationCount(userId);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (userId) {
      markAllAsReadMutation.mutate(userId);
    }
  };

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={"a"}
        type="button"
        className="topbar-button position-relative content-none"
        id="page-header-notifications-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <IconifyIcon
          icon="ri:notification-3-line"
          className="fs-24 align-middle"
        />
        {unreadCount > 0 && (
          <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </DropdownToggle>
      <DropdownMenu
        className="py-0 dropdown-lg dropdown-menu-end"
        aria-labelledby="page-header-notifications-dropdown"
      >
        <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0 fs-16 fw-semibold">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h6>
            </Col>
            <Col xs={"auto"}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="btn btn-link text-dark text-decoration-underline p-0"
                  disabled={markAllAsReadMutation.isPending}
                >
                  <small>Mark All Read</small>
                </button>
              )}
            </Col>
          </Row>
        </div>
        <SimplebarReactClient style={{ maxHeight: 320 }}>
          {isLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <IconifyIcon icon="ri:notification-off-line" className="fs-48 mb-2" />
              <p className="mb-0">No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <NotificationItem 
                key={notification.id} 
                id={notification.id}
                notification_type={notification.notification_type || undefined}
                title={notification.title || undefined}
                body={notification.body || undefined}
                reference_id={notification.reference_id || undefined}
                action_url={notification.action_url || undefined}
                created_at={notification.created_at || new Date().toISOString()}
                is_read={notification.is_read || false}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </SimplebarReactClient>
        <div className="text-center py-3">
          <Link href="/notifications/in-app" className="btn btn-primary btn-sm">
            View All Notifications{" "}
            <IconifyIcon icon="bx:right-arrow-alt" className="ms-1" />
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default LiveNotifications;
