import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Community Overview"
    subName="Community operations now live in the Communities module."
    scopeLabel="Community Operations"
    reason="Community dashboards and operational views belong in the Communities module. Settings keeps only behavior-changing community configuration."
    destinationLabel="Open Communities Module"
    destinationUrl="/communities/list"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
