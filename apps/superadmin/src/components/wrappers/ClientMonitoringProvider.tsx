"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PropsWithChildren, useEffect } from "react";

import { reportClientIssue } from "@/lib/clientMonitoring";

export default function ClientMonitoringProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const accessToken =
      typeof session?.accessToken === "string" && session.accessToken.length > 0
        ? session.accessToken
        : null;

    const onError = (event: ErrorEvent) => {
      void reportClientIssue({
        source: "window.onerror",
        level: "error",
        message: event.message || "Unhandled browser error",
        errorName: event.error?.name,
        stack: event.error?.stack,
        route: pathname,
        accessToken,
        metadata: {
          filename: event.filename || null,
          lineno: event.lineno || null,
          colno: event.colno || null,
        },
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection";

      void reportClientIssue({
        source: "window.unhandledrejection",
        level: "error",
        message,
        errorName: reason instanceof Error ? reason.name : undefined,
        stack: reason instanceof Error ? reason.stack : undefined,
        route: pathname,
        accessToken,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [pathname, session?.accessToken]);

  return children;
}

