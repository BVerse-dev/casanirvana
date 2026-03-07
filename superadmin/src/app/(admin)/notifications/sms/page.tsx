import { Metadata } from "next";
import WorkspaceRelocationNotice from "@/components/WorkspaceRelocationNotice";

export const metadata: Metadata = {
  title: "SMS Notifications",
  description: "SMS operations now run from the shared notification campaigns workspace",
};

const SmsNotifications = () => {
  return (
    <WorkspaceRelocationNotice
      title="SMS Notifications"
      subName="Notifications Workspace"
      badgeLabel="Shared Campaigns"
      reason="SMS sending, scheduling, and delivery review are now managed from the unified campaigns workspace. Keep SMS provider credentials and delivery limits in Notification Setup."
      primaryLabel="Open Notification Campaigns"
      primaryUrl="/notifications/campaigns"
      secondaryLabel="Open SMS Setup"
      secondaryUrl="/settings/notifications/sms"
      tertiaryLabel="Open Reports"
      tertiaryUrl="/notifications/analytics"
    />
  );
};

export default SmsNotifications;
