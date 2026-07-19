import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Services Management"
    subName="Service operations now live in the Services module."
    scopeLabel="Community Operations"
    reason="Service catalogs and request handling belong in the Services module. Settings keeps only the rules that change service behavior."
    destinationLabel="Open Services Module"
    destinationUrl="/services"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
