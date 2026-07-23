import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Guard Overview"
    subName="Guard operations now live in the Guards module."
    scopeLabel="Guard Operations"
    reason="Guard dashboards and operational workflows belong in the Guards module. Settings keeps only the global rules that control how guard operations behave."
    destinationLabel="Open Guards Module"
    destinationUrl="/guards"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
