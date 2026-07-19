import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Roles Management"
    subName="Roles and permissions are now managed from the canonical identity workspace."
    scopeLabel="Identity & Access"
    reason="Role and permission management should use one source of truth. Use the canonical Roles & Permissions page to avoid split policy paths."
    destinationLabel="Open Roles & Permissions"
    destinationUrl="/settings/admin/roles"
    secondaryLabel="Open Access Groups"
    secondaryUrl="/settings/users/groups"
  />
);

export default Page;
