import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Agency Overview"
    subName="Agency operations now live in the Agency module."
    scopeLabel="Agency Operations"
    reason="Agency dashboards and operational views belong in the Agency module. Settings keeps only agency-level defaults and policies."
    destinationLabel="Open Agency Module"
    destinationUrl="/agency/list-view"
    secondaryLabel="Open Agency Configuration"
    secondaryUrl="/settings/agencies/configuration"
  />
);

export default Page;
