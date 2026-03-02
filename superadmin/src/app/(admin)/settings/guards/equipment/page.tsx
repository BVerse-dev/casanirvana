import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Equipment Management"
    subName="Equipment tracking now lives in the Guards module."
    scopeLabel="Guard Operations"
    reason="Equipment check-out and inventory are operational workflows. Settings only keeps the equipment policy defaults."
    destinationLabel="Open Guards Module"
    destinationUrl="/guards/list-view"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
