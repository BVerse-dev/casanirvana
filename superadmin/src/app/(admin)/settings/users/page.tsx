import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="User Management"
    subName="User operations now live in the Residents and People modules."
    scopeLabel="Identity & Access"
    reason="User lists and profile operations belong in the operational resident and people modules. Settings only keeps default access behavior and policy controls."
    destinationLabel="Open Residents Module"
    destinationUrl="/residents/list-view"
    secondaryLabel="Open User Defaults"
    secondaryUrl="/settings/users/preferences"
  />
);

export default Page;
