import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="User Profiles"
    subName="Profile records now live in the Residents module."
    scopeLabel="Identity & Access"
    reason="User profile records are operational resident data. Settings should only manage default profile policies and access rules."
    destinationLabel="Open Residents Module"
    destinationUrl="/residents"
    secondaryLabel="Open User Defaults"
    secondaryUrl="/settings/users/preferences"
  />
);

export default Page;
