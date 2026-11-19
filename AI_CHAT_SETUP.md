# Citizen AI Chat setup

The homepage chat uses a server-side OpenAI Responses API route. The OpenAI key is read only on the server and must never use a `NEXT_PUBLIC_` prefix.

## Local development

Add these variables to the ignored `.env.local` file, then restart the development server:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-6-luna
```

## Vercel deployment

In the Vercel project, open **Settings → Environment Variables** and add `OPENAI_API_KEY` and `OPENAI_MODEL` for the environments you use. Redeploy after saving them.

ChatGPT Free access does not provide free API usage. ChatGPT and API billing are separate, so replies use the billing and limits of the API project attached to the key. GPT-6 Luna is the current low-cost general model; it is billed by tokens and must be available to the selected API project. Check the project's usage limits and current rates before enabling it. Until both variables are set, the chat displays a setup message and does not call OpenAI.

Chat history is stored in the visitor's browser by default. A signed-in visitor can opt in to saving conversations to their Jonogon account; account history is protected by Supabase row-level security and can be switched off in the chat panel. The hosted Jonogon database has the required migration; apply `supabase/migrations/202611200001_citizen_chat_history.sql` in other Supabase environments. Disabling account saving stops future syncs but leaves previously saved account chats available if the visitor enables it again. Clearing history while account saving is on deletes the visitor's account history too.

The app sends the recent messages in the active chat to OpenAI to generate each reply. Visitors should not enter NID/passport numbers, OTPs, passwords, or other sensitive personal information.
