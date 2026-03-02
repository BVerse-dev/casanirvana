import SettingsRelocationNotice from '@/components/SettingsRelocationNotice';

const Page = () => (
  <SettingsRelocationNotice
    title="Finance & Billing"
    subName="Agency finance operations now live in Payments and payout workflows."
    scopeLabel="Agency Operations"
    reason="Agency payout and revenue operations belong in the operational finance workspace. Settings keeps only commission and settlement defaults."
    destinationLabel="Open Payouts Workspace"
    destinationUrl="/payments/payouts"
    secondaryLabel="Open Agency Configuration"
    secondaryUrl="/settings/agencies/configuration"
  />
);

export default Page;
