import { Metadata } from "next";
import WorkspaceRelocationNotice from "@/components/WorkspaceRelocationNotice";

export const metadata: Metadata = {
  title: "Push Notifications",
  description: "Push operations now run from the shared notification campaigns workspace",
};

const PushNotifications = () => {
  return (
    <WorkspaceRelocationNotice
      title="Push Notifications"
      subName="Notifications Workspace"
      badgeLabel="Shared Campaigns"
      reason="Push is no longer managed as a separate admin module. Use the unified campaigns workspace for operational sending and history, then use Notification Setup for Firebase and delivery configuration."
      primaryLabel="Open Notification Campaigns"
      primaryUrl="/notifications/campaigns"
      secondaryLabel="Open Push Setup"
      secondaryUrl="/settings/notifications/push"
      tertiaryLabel="Open Reports"
      tertiaryUrl="/notifications/analytics"
    />
  );
};

export default PushNotifications;
