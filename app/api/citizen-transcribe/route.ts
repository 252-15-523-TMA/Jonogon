const rateWindowMs = 10 * 60_000;
const requestsPerWindow = 30;
// Keep the upload below the Vercel Functions request-body ceiling with room for multipart headers.
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

function mapProviderError(status: number, code?: string, type?: string) {
  if (code === "billing_not_active" || type === "billing_not_active") return json({ code: "provider_billing_inactive" }, 503);
  if (["insufficient_quota", "billing_hard_limit_reached", "usage_limit_reached"].includes(code || "")) return json({ code: "provider_quota_exceeded" }, 503);
  if (code === "invalid_api_key" || type === "invalid_api_key") return json({ code: "provider_key_invalid" }, 503);
  if (status === 429) return json({ code: "provider_rate_limited" }, 429);
  return json({ code: "provider_error" }, 502);
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return json({ code: "invalid_origin" }, 403);
  if (!consumeRateLimit(request)) return json({ code: "rate_limited" }, 429, { "Retry-After": "600" });
  if (Number(request.headers.get("content-length") || 0) > maxAudioBytes + 100_000) return json({ code: "audio_too_large" }, 413);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ code: "not_configured" }, 503);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ code: "invalid_audio" }, 400);
  }

  const upload = form.get("file");
  if (!(upload instanceof File) || upload.size === 0) return json({ code: "invalid_audio" }, 400);
  if (upload.size > maxAudioBytes) return json({ code: "audio_too_large" }, 413);

  const mimeType = upload.type.split(";")[0].toLowerCase();
  const extensionByMime: Record<string, string> = {
    "audio/mp4": "mp4",
    "audio/m4a": "m4a",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/flac": "flac",
  };
  const extension = extensionByMime[mimeType];
  if (!extension) return json({ code: "unsupported_audio" }, 415);

  const providerForm = new FormData();
  providerForm.append("file", new File([upload], `citizen-question.${extension}`, { type: mimeType }));
  providerForm.append("model", "gpt-transcribe");
  providerForm.append("response_format", "json");
  providerForm.append("languages[]", "bn");
  providerForm.append("languages[]", "en");
  providerForm.append("prompt", "Transcribe Bengali (Bangla) or English speech in its original language and script. Preserve mixed Bangla and English when both are spoken.");

  try {
    const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: providerForm,
      signal: AbortSignal.timeout(50_000),
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => ({})) as { text?: string; error?: { code?: unknown; type?: unknown } };
    if (!upstream.ok) {
      const providerCode = typeof result.error?.code === "string" ? result.error.code : undefined;
      const providerType = typeof result.error?.type === "string" ? result.error.type : undefined;
      console.warn("[citizen-transcribe] OpenAI request failed", { status: upstream.status, code: providerCode, type: providerType });
      return mapProviderError(upstream.status, providerCode, providerType);
    }
    if (typeof result.text !== "string" || !result.text.trim()) return json({ code: "empty_transcription" }, 422);
    return json({ text: result.text.trim() });
  } catch {
    return json({ code: "provider_unavailable" }, 502);
  }
}
