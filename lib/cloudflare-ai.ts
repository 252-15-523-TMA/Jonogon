export const CLOUDFLARE_CHAT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
export const CLOUDFLARE_TRANSCRIPTION_MODEL = "@cf/openai/whisper";

type CloudflareError = { code?: unknown; message?: unknown };
export type CloudflareResponse = {
  success?: boolean;
  result?: {
    choices?: { message?: { content?: unknown } }[];
    response?: unknown;
    text?: unknown;
    error?: unknown;
    errors?: CloudflareError[];
  };
  choices?: { message?: { content?: unknown } }[];
  text?: unknown;
  errors?: CloudflareError[];
  error?: { code?: unknown; status?: unknown; message?: unknown } | string;
};

export function getCloudflareCredentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN?.trim();

  if (!accountId || !apiToken) return null;
  return { accountId, apiToken };
}

export function getCloudflareChatText(response: CloudflareResponse) {
  const content = response.result?.choices?.[0]?.message?.content
    ?? response.choices?.[0]?.message?.content
    ?? response.result?.response;

  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => part && typeof part === "object" && "text" in part ? part.text : "")
      .filter((part): part is string => typeof part === "string")
      .join("\n")
      .trim();
  }
  return "";
}

export function getCloudflareTranscriptionText(response: CloudflareResponse) {
  const text = response.result?.text ?? response.text;
  return typeof text === "string" ? text.trim() : "";
}

export function getCloudflareFailure(status: number, response: CloudflareResponse, retryAfterHeader?: string | null) {
  const errors = [
    ...(Array.isArray(response.errors) ? response.errors : []),
    ...(Array.isArray(response.result?.errors) ? response.result.errors : []),
  ];
  const errorMessage = typeof response.error === "string"
    ? response.error
    : typeof response.error?.message === "string"
      ? response.error.message
      : "";
  const providerError = `${JSON.stringify(errors)} ${errorMessage}`.toLowerCase();

  if (status === 401) return { code: "provider_key_invalid", status: 503 };
  if (status === 403) return { code: "provider_access_denied", status: 503 };

  if (status === 429) {
    if (/daily|per.day|neuron|quota|usage limit/.test(providerError)) {
      return { code: "free_quota_exceeded", status: 429 };
    }
    const retryAfter = Math.min(300, Math.max(1, Number(retryAfterHeader) || 30));
    return { code: "provider_rate_limited", status: 429, retryAfter: String(retryAfter) };
  }

  if (status === 503 || status === 502 || status === 504) return { code: "provider_unavailable", status: 502 };
  return { code: "provider_error", status: 502 };
}
