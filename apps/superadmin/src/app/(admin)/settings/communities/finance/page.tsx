import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Finance & Billing"
    subName="Operational finance now lives in Payments and community workflows."
    scopeLabel="Community Operations"
    reason="Community finance reporting and collections are operational surfaces. Settings keeps only finance defaults, billing rules, and policy values."
    destinationLabel="Open Payments Workspace"
    destinationUrl="/payments"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
