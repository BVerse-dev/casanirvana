import { Metadata } from "next";
import WorkspaceRelocationNotice from "@/components/WorkspaceRelocationNotice";

export const metadata: Metadata = {
  title: "In-App Notifications",
  description: "In-app notification operations now run from the shared notification campaigns workspace",
};

const InAppNotifications = () => {
  return (
    <WorkspaceRelocationNotice
      title="In-App Notifications"
      subName="Notifications Workspace"
      badgeLabel="Shared Campaigns"
      reason="In-app messaging is now managed from the unified campaigns workspace so user, guard, and admin app notifications stay aligned. Keep inbox delivery behavior and display preferences in Notification Setup."
      primaryLabel="Open Notification Campaigns"
      primaryUrl="/notifications/campaigns"
      secondaryLabel="Open In-App Setup"
      secondaryUrl="/settings/notifications/in-app"
      tertiaryLabel="Open Reports"
      tertiaryUrl="/notifications/analytics"
    />
  );
};

export default InAppNotifications;
