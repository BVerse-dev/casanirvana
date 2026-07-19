import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Permissions"
    subName="Permissions are now managed from the canonical identity workspace."
    scopeLabel="Identity & Access"
    reason="Permission policies should be managed from one canonical page so admin access rules stay consistent across the platform."
    destinationLabel="Open Roles & Permissions"
    destinationUrl="/settings/admin/roles"
    secondaryLabel="Open Security Policies"
    secondaryUrl="/settings/admin/security"
  />
);

export default Page;
