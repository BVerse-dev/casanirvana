import { NextResponse } from "next/server";

import { MAX_REQUEST_BYTES, publicBackendError, validateOnboardingPayload } from "@/lib/forms";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  const apiKey = process.env.ONBOARDING_REQUEST_API_KEY;
  const backendUrl = process.env.BACKEND_API_URL;
  if (!apiKey || !backendUrl) return NextResponse.json({ message: "Onboarding is not configured." }, { status: 503 });
  const result = validateOnboardingPayload(await request.json().catch(() => null));
  if (result.payload.website) return NextResponse.json({ message: "Thank you." }, { status: 201 });
  if (!result.valid) return NextResponse.json({ message: "Please correct the highlighted fields.", errors: result.errors }, { status: 400 });
  const payload = { ...result.payload };
  delete payload.website;

  let response: Response;
  try {
    response = await fetch(`${backendUrl.replace(/\/$/, "")}/onboarding/requests`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-onboarding-api-key": apiKey },
      body: JSON.stringify({ ...payload, source: "marketing_web", metadata: { website_version: "nextjs" } }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Onboarding is temporarily unavailable." }, { status: 503 });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ message: publicBackendError(data, "Onboarding is temporarily unavailable.") }, { status: response.status });
  return NextResponse.json({ message: "Request received." }, { status: 201 });
}
