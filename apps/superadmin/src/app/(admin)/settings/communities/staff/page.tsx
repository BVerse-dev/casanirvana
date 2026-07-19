import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Staff Management"
    subName="Community staffing now lives in the Communities module."
    scopeLabel="Community Operations"
    reason="Community staffing is operational data and should be managed from the community workflow, not from Settings."
    destinationLabel="Open Communities Module"
    destinationUrl="/communities/list"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
