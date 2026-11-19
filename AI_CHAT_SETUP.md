# Citizen AI Chat setup

The homepage chat uses a server-side OpenAI Responses API route. The OpenAI key is read only on the server and must never use a `NEXT_PUBLIC_` prefix.

## Local development

Add these variables to the ignored `.env.local` file, then restart the development server:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=an_api_model_enabled_for_your_project
```

## Vercel deployment

In the Vercel project, open **Settings → Environment Variables** and add `OPENAI_API_KEY` and `OPENAI_MODEL` for the environments you use. Redeploy after saving them.

OpenAI's ChatGPT Free access does not provide free API usage. ChatGPT and API billing are separate, so replies will use the billing and limits of the API project attached to the key. Check model access and current rates before enabling it. Until both variables are set, the chat displays a setup message and does not call OpenAI.

Chat history is stored in the visitor's browser. The app sends the recent messages in the active chat to OpenAI to generate each reply. Visitors should not enter NID/passport numbers, OTPs, passwords, or other sensitive personal information.
