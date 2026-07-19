import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Agency Profiles"
    subName="Agency profile operations now live in the Agency module."
    scopeLabel="Agency Operations"
    reason="Agency profile records are operational entities. Settings keeps only behavior-changing configuration."
    destinationLabel="Open Manage Agencies"
    destinationUrl="/agency/manage?tab=profiles"
    secondaryLabel="Open Agency Configuration"
    secondaryUrl="/settings/agencies/configuration"
  />
);

export default Page;
