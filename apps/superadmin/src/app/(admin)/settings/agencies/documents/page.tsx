import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Documents & Records"
    subName="Agency document operations now live in the Agency module."
    scopeLabel="Agency Operations"
    reason="Agency document libraries are operational records. Settings keeps only retention, approval, and compliance defaults."
    destinationLabel="Open Manage Agencies"
    destinationUrl="/agency/manage?tab=documents"
    secondaryLabel="Open Agency Configuration"
    secondaryUrl="/settings/agencies/configuration"
  />
);

export default Page;
