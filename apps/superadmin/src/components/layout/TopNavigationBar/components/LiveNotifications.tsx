"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from "react-bootstrap";
import {
  type PersonalNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  usePersonalNotifications,
} from "@/hooks/useNotifications";

const notificationHref = (notification: PersonalNotification) => {
  const raw = notification.action_url?.trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/notifications/in-app";
  if (raw.startsWith("/societies/join-requests")) return raw.replace("/societies", "/communities");
  return raw;
};

const formatTime = (value: string | null) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const LiveNotifications = () => {
  const notificationsQuery = usePersonalNotifications();
  const markRead = useMarkNotificationAsRead();
  const markAllRead = useMarkAllNotificationsAsRead();
  const notifications = notificationsQuery.data?.data || [];
  const unreadCount = notificationsQuery.data?.unreadCount || 0;

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle as="button" className="topbar-link drop-arrow-none border-0" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}>
        <Icon icon="solar:bell-bing-bold-duotone" className="fs-22" />
        {unreadCount > 0 && <span className="noti-icon-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </DropdownToggle>
      <DropdownMenu align="end" className="dropdown-menu-end dropdown-lg py-0">
        <DropdownHeader className="d-flex align-items-center justify-content-between px-3 py-2">
          <h6 className="m-0">Notifications</h6>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-link p-0"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </button>
          )}
        </DropdownHeader>

        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {notificationsQuery.isLoading && (
            <div className="p-4 text-center text-muted" role="status">
              <Spinner size="sm" className="me-2" /> Loading notifications
            </div>
          )}
          {notificationsQuery.isError && (
            <div className="p-4 text-center text-danger">Notifications are temporarily unavailable.</div>
          )}
          {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 && (
            <div className="p-4 text-center text-muted">You have no notifications.</div>
          )}
          {notifications.map((notification) => (
            <DropdownItem
              as={Link}
              href={notificationHref(notification)}
              key={notification.id}
              className={`py-3 border-bottom ${notification.is_read ? "" : "bg-light-subtle"}`}
              onClick={() => {
                if (!notification.is_read) markRead.mutate(notification.id);
              }}
            >
              <div className="d-flex gap-2">
                <span className="avatar-sm rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0">
                  <Icon icon="solar:bell-bing-broken" className="fs-20" />
                </span>
                <span className="min-w-0">
                  <span className="fw-semibold d-block text-truncate">{notification.title || "Notification"}</span>
                  {notification.body && <small className="text-muted d-block text-wrap">{notification.body}</small>}
                  <small className="text-muted">{formatTime(notification.created_at)}</small>
                </span>
              </div>
            </DropdownItem>
          ))}
        </div>

        <div className="text-center py-2 border-top">
          <Link href="/notifications/in-app" className="btn btn-sm btn-light w-100">
            View all notifications
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default LiveNotifications;
