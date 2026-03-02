import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Units Management"
    subName="Unit operations now live in the Units module."
    scopeLabel="Community Operations"
    reason="Unit lists and workflows belong in the Units module. Settings keeps only tenant-level policies and defaults."
    destinationLabel="Open Units Module"
    destinationUrl="/units/list"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
