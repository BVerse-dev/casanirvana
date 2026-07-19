import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Notification Settings"
    subName="Configuration now lives under Settings > Notification Setup."
    scopeLabel="Configuration Workspace"
    reason="To keep a single source of truth, notification configuration is managed in Settings. This prevents duplicate forms and conflicting save paths."
    destinationLabel="Open Notification Rules"
    destinationUrl="/settings/notifications/rules"
    secondaryLabel="Open Push Setup"
    secondaryUrl="/settings/notifications/push"
  />
);

export default Page;
