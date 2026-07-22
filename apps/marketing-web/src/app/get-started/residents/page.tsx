import type { Metadata } from "next";

import { ResidentOnboardingGuide } from "@/components/ResidentOnboardingGuide";

export const metadata: Metadata = {
  title: "Join Your Community",
  description: "Learn how new and existing residents join a community in the Casa Nirvana resident app.",
  alternates: { canonical: "/get-started/residents/" },
};

export default function ResidentGetStartedPage() {
  return <ResidentOnboardingGuide appUrl={process.env.NEXT_PUBLIC_RESIDENT_APP_URL || ""} />;
}
