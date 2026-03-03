import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Guard Performance"
    subName="Performance tracking now lives in the Guards module."
    scopeLabel="Guard Operations"
    reason="Performance data is operational guard data. Settings keeps only the policies and thresholds that affect performance workflows."
    destinationLabel="Open Guard Performance"
    destinationUrl="/guards/performance"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
