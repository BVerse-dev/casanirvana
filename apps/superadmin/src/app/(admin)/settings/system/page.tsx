import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="System Configuration"
    subName="Use the dedicated system pages for monitoring and controls."
    scopeLabel="System Configuration"
    reason="System operations and controls are split into dedicated overview and settings pages to keep monitoring and configuration paths explicit."
    destinationLabel="Open System Overview"
    destinationUrl="/settings/system/overview"
    secondaryLabel="Open System Settings"
    secondaryUrl="/settings/system/settings"
  />
);

export default Page;
