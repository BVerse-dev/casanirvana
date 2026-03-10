"use client";

import { useEffect } from "react";

import { reportClientIssue } from "@/lib/clientMonitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void reportClientIssue({
      source: "next.global-error",
      level: "error",
      message: error.message || "Unhandled app router error",
      errorName: error.name,
      stack: error.stack,
      metadata: {
        digest: error.digest || null,
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#f7f7f7",
          }}
        >
          <div
            style={{
              maxWidth: "420px",
              width: "100%",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Something went wrong</h2>
            <p style={{ marginTop: 0, marginBottom: "20px", color: "#475467" }}>
              The issue has been captured. You can retry this screen now.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: 0,
                borderRadius: "10px",
                padding: "12px 18px",
                background: "#d92d20",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

