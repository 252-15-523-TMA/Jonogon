import {
  CLOUDFLARE_TRANSCRIPTION_MODEL,
  getCloudflareCredentials,
  getCloudflareFailure,
  getCloudflareTranscriptionText,
  type CloudflareResponse,
} from "@/lib/cloudflare-ai";

const rateWindowMs = 10 * 60_000;
const requestsPerWindow = 12;
// Keep uploads comfortably below the Vercel Functions request-body ceiling.
const maxAudioBytes = 4_000_000;
const rateLimits = new Map<string, { startedAt: number; count: number }>();

function json(data: Record<string, unknown>, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function consumeRateLimit(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = rateLimits.get(address);
  if (!current || now - current.startedAt >= rateWindowMs) {
    if (rateLimits.size > 1000) {
      for (const [key, value] of rateLimits) if (now - value.startedAt >= rateWindowMs) rateLimits.delete(key);
    }
    rateLimits.set(address, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= requestsPerWindow) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return json({ code: "invalid_origin" }, 403);
  if (Number(request.headers.get("content-length") || 0) > maxAudioBytes + 100_000) return json({ code: "audio_too_large" }, 413);

  const credentials = getCloudflareCredentials();
  if (!credentials) return json({ code: "not_configured" }, 503);
  if (!consumeRateLimit(request)) return json({ code: "rate_limited" }, 429, { "Retry-After": "600" });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ code: "invalid_audio" }, 400);
  }

  const upload = form.get("file");
  if (!(upload instanceof File) || upload.size === 0) return json({ code: "invalid_audio" }, 400);
  if (upload.size > maxAudioBytes) return json({ code: "audio_too_large" }, 413);

  const originalMimeType = upload.type.split(";")[0].toLowerCase();
  const mimeType = originalMimeType === "audio/x-wav" ? "audio/wav" : originalMimeType;
  const supportedMimeTypes = new Set([
    "audio/mp4", "audio/m4a", "audio/webm", "audio/ogg", "audio/wav",
    "audio/mpeg", "audio/mp3", "audio/flac", "audio/aac", "audio/aiff",
  ]);
  if (!supportedMimeTypes.has(mimeType)) return json({ code: "unsupported_audio" }, 415);

  try {
    const upstream = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(credentials.accountId)}/ai/run/${CLOUDFLARE_TRANSCRIPTION_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${credentials.apiToken}`, "Content-Type": mimeType },
      body: await upload.arrayBuffer(),
      signal: AbortSignal.timeout(50_000),
      cache: "no-store",
    });

    const result = await upstream.json().catch(() => ({})) as CloudflareResponse;
    if (!upstream.ok) {
      const failure = getCloudflareFailure(upstream.status, result, upstream.headers.get("retry-after"));
      console.warn("[citizen-transcribe] Cloudflare Workers AI request failed", {
        status: upstream.status,
        code: result.errors?.[0]?.code,
        model: CLOUDFLARE_TRANSCRIPTION_MODEL,
      });
      return json({ code: failure.code }, failure.status, failure.retryAfter ? { "Retry-After": failure.retryAfter } : {});
    }

    const text = getCloudflareTranscriptionText(result);
    if (!text) return json({ code: "empty_transcription" }, 422);
    return json({ text });
  } catch {
    return json({ code: "provider_unavailable" }, 502);
  }
}
