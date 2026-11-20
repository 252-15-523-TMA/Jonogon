export const GEMINI_MODEL = "gemini-3.5-flash-lite";

type GeminiPart = { text?: unknown };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { status?: unknown; message?: unknown; details?: unknown };
};

export function getGeminiText(result: GeminiResponse) {
  return result.candidates?.flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => typeof part.text === "string" ? part.text : "")
    .filter(Boolean)
    .join("\n")
    .trim() || "";
}

export function getGeminiFailure(status: number, result: GeminiResponse, retryAfterHeader?: string | null) {
  const details = JSON.stringify(result.error || {}).toLowerCase();
  const statusName = typeof result.error?.status === "string" ? result.error.status.toLowerCase() : "";
  const message = typeof result.error?.message === "string" ? result.error.message.toLowerCase() : "";
  const providerError = `${details} ${statusName} ${message}`;

  if (/api.?key|permission_denied|unauthenticated|invalid credential|key is invalid/.test(providerError) && [400, 401, 403].includes(status)) {
    return { code: "provider_key_invalid", status: 503 };
  }

  if (status === 429) {
    if (/per[_\s-]?day|requestsperday|daily|perday/.test(providerError)) {
      return { code: "free_quota_exceeded", status: 429 };
    }
    const retryFromDetails = providerError.match(/(?:retrydelay|retry in)[^\d]*(\d+(?:\.\d+)?)\s*s/);
    const retryAfter = Math.min(300, Math.max(1, Number(retryAfterHeader) || Number(retryFromDetails?.[1]) || 30));
    return { code: "provider_rate_limited", status: 429, retryAfter: String(retryAfter) };
  }

  if (status === 503 || status === 502 || status === 504) return { code: "provider_unavailable", status: 502 };
  return { code: "provider_error", status: 502 };
}
