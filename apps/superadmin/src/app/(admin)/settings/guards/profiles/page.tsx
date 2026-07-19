import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Guard Profiles"
    subName="Guard profile management now lives in the Guards module."
    scopeLabel="Guard Operations"
    reason="Guard profile records are operational data. Settings only keeps policy and default configuration."
    destinationLabel="Open Manage Guards"
    destinationUrl="/guards/manage?tab=profiles"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
