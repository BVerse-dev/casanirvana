import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Schedules & Shifts"
    subName="Shift scheduling now lives in the Guards module."
    scopeLabel="Guard Operations"
    reason="Schedules and shift management are operational workflows and should be managed with guard records, not from Settings."
    destinationLabel="Open Schedules & Shifts"
    destinationUrl="/guards/schedules"
    secondaryLabel="Open Guard Configuration"
    secondaryUrl="/settings/guards/configuration"
  />
);

export default Page;
