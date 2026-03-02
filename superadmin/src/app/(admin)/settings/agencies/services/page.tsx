import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Services Management"
    subName="Agency services now live in the Agency module."
    scopeLabel="Agency Operations"
    reason="Agency service delivery is operational. Settings keeps only default service rules and policy values."
    destinationLabel="Open Agency Module"
    destinationUrl="/agency/list-view"
    secondaryLabel="Open Agency Configuration"
    secondaryUrl="/settings/agencies/configuration"
  />
);

export default Page;
