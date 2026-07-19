import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Training & Certification"
    subName="Training records now live in the Guards module."
    scopeLabel="Guard Operations"
    reason="Training and certification records are operational entities. Settings only keeps the required training policy."
    destinationLabel="Open Manage Guards"
    destinationUrl="/guards/manage?tab=training"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
