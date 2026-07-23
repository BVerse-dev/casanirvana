"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { ChildrenType } from "@/types/component-props";
import FallbackLoading from "../FallbackLoading";

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status !== "authenticated") {
    return <FallbackLoading label={status === "loading" ? "Checking your session" : "Redirecting to sign in"} />;
  }

  return <Suspense fallback={<FallbackLoading label="Loading workspace" />}>{children}</Suspense>;
};

export default AuthProtectionWrapper;
