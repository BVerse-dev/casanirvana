import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Amenities & Facilities"
    subName="Amenity operations now live in the Amenities module."
    scopeLabel="Community Operations"
    reason="Amenity inventory, booking, and utilization are operational workflows. Settings keeps only amenity policy defaults."
    destinationLabel="Open Amenities Module"
    destinationUrl="/amenities/list"
    secondaryLabel="Open Community Configuration"
    secondaryUrl="/settings/communities/configuration"
  />
);

export default Page;
