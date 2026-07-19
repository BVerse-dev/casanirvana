import { Metadata } from "next";
import WorkspaceRelocationNotice from "@/components/WorkspaceRelocationNotice";

export const metadata: Metadata = {
  title: "Email Notifications",
  description: "Email operations now run from the shared notification campaigns workspace",
};

const EmailNotifications = () => {
  return (
    <WorkspaceRelocationNotice
      title="Email Notifications"
      subName="Notifications Workspace"
      badgeLabel="Shared Campaigns"
      reason="Email campaigns, drafts, and delivery review are now managed from the shared campaigns workspace. Keep SMTP, sender identity, and routing rules in Notification Setup."
      primaryLabel="Open Notification Campaigns"
      primaryUrl="/notifications/campaigns"
      secondaryLabel="Open Email Setup"
      secondaryUrl="/settings/notifications/email"
      tertiaryLabel="Open Templates"
      tertiaryUrl="/notifications/templates"
    />
  );
};

export default EmailNotifications;
