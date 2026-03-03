import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Community Assignments"
    subName="Assignment management now lives in the Guards module."
    scopeLabel="Guard Operations"
    reason="Community assignments are operational scheduling data. Settings keeps only assignment rules and policy defaults."
    destinationLabel="Open Community Assignments"
    destinationUrl="/guards/assignments"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
