# Citizen AI chat and voice setup

Jonogon's citizen chat and voice transcription use Cloudflare Workers AI. The app calls Cloudflare from server-side API routes, so the AI token must never use a `NEXT_PUBLIC_` prefix or be committed to Git.

## Local development

Add these values to the ignored `.env.local` file and restart the Next.js development server:

```env
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_AI_API_TOKEN=your-workers-ai-api-token
```

The token needs permission to run Workers AI models for the selected account.

## Production and preview deployments

In the Vercel project, open **Settings → Environment Variables** and add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_API_TOKEN` to each environment that should support chat and voice. Redeploy after changing variables. Keep the token as a server-side secret.

## Models and request limits

- Chat uses `@cf/google/gemma-4-26b-a4b-it` through `/api/citizen-chat`.
- Voice transcription uses `@cf/openai/whisper` through `/api/citizen-transcribe`.
- Chat sends up to 16 recent messages, with a 6,000-character per-message limit, a 24,000-character total limit, and an 800-token response cap.
- Voice recording is limited to 45 seconds in the browser and 4 MB at the API route.
- The app also has in-memory request limits per function instance. Cloudflare and hosting quotas apply separately; availability can change when a provider quota is reached.

## Conversation storage and privacy

Chat history is stored in the visitor's browser by default. Signed-in visitors can opt in to saving conversations to their Jonogon account; Supabase row-level security restricts each row to its owner. Disabling account saving stops future syncs. Clearing history while account saving is on also deletes that visitor's saved account history.

Chat messages are sent to Cloudflare Workers AI to generate replies. Visitors should not enter NID/passport/birth-registration numbers, OTPs, passwords, or other sensitive personal information. The assistant is instructed not to invent current fees, deadlines, laws, or official links, and it cannot access government databases or submit applications.

The chat currently uses recent conversation context and a system instruction. It does not retrieve external service documents or use RAG, embeddings, or a vector index.
