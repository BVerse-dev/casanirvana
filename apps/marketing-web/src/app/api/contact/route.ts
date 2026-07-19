import { NextResponse } from "next/server";

import { MAX_REQUEST_BYTES, publicBackendError, validateContactPayload } from "@/lib/forms";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  const apiKey = process.env.MARKETING_CONTACT_API_KEY;
  const backendUrl = process.env.BACKEND_API_URL;
  if (!apiKey || !backendUrl) return NextResponse.json({ message: "Contact service is not configured." }, { status: 503 });
  const result = validateContactPayload(await request.json().catch(() => null));
  if (result.payload.website) return NextResponse.json({ message: "Thank you." }, { status: 202 });
  if (!result.valid) return NextResponse.json({ message: "Please correct the highlighted fields.", errors: result.errors }, { status: 400 });

  let response: Response;
  try {
    response = await fetch(`${backendUrl.replace(/\/$/, "")}/contact/requests`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-marketing-contact-key": apiKey },
      body: JSON.stringify({ ...result.payload, source: "marketing_web" }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Contact service is temporarily unavailable." }, { status: 503 });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ message: publicBackendError(data, "Contact service is temporarily unavailable.") }, { status: response.status });
  return NextResponse.json({ message: "Message received." }, { status: 202 });
}
