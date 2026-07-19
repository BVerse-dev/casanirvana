import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Community Profiles"
    subName="Community profile management now lives in the Communities module."
    scopeLabel="Community Operations"
    reason="Community profile records are operational entities. Settings keeps only the configuration that changes community behavior."
    destinationLabel="Open Communities Module"
    destinationUrl="/communities/list"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
