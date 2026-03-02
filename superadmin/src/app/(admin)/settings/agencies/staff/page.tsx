import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Staff Management"
    subName="Agency staffing now lives in the Agency module."
    scopeLabel="Agency Operations"
    reason="Agency staffing is an operational workflow. Settings keeps only policy defaults and administrative rules."
    destinationLabel="Open Agency Module"
    destinationUrl="/agency/list-view"
    secondaryLabel="Open Agency Configuration"
    secondaryUrl="/settings/agencies/configuration"
  />
);

export default Page;
