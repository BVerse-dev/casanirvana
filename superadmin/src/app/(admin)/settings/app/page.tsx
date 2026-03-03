import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Application Settings"
    subName="Use the dedicated app settings pages for platform configuration."
    scopeLabel="Platform Settings"
    reason="Application settings are now managed through dedicated pages for splash, onboarding, URLs, and extensions to keep one source of truth per configuration area."
    destinationLabel="Open Splash Settings"
    destinationUrl="/settings/app/splash"
    secondaryLabel="Open App URLs & Redirects"
    secondaryUrl="/settings/app/urls"
  />
);

export default Page;
