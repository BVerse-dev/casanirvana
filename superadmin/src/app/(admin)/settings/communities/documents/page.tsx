import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Documents & Records"
    subName="Community document operations now live in the Communities module."
    scopeLabel="Community Operations"
    reason="Document libraries are operational records. Settings keeps only retention, approval, and policy defaults."
    destinationLabel="Open Communities Module"
    destinationUrl="/communities/list"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
