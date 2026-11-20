"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUp, BookOpenText, Cloud, CloudCheck, Landmark, LoaderCircle, MessageSquare, Mic, MicOff, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useCitizenVoiceInput } from "./useCitizenVoiceInput";

type Language = "bn" | "en";
type Message = { id: string; role: "user" | "assistant"; text: string; createdAt: number };
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };
type Account = { id: string; email: string };

const HISTORY_KEY = "jonogon-citizen-chat-v1";
const ACCOUNT_SAVE_KEY = "jonogon-citizen-chat-account-save-v1";
export const CITIZEN_CHAT_PENDING_PROMPT_KEY = "jonogon-citizen-chat-pending-prompt-v1";
const MAX_SAVED_CONVERSATIONS = 40;
const translate = (lang: Language, bn: string, en: string) => lang === "bn" ? bn : en;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function mergeConversations(...groups: Conversation[][]) {
  const byId = new Map<string, Conversation>();
  for (const item of groups.flat()) {
    const current = byId.get(item.id);
    if (!current || item.updatedAt >= current.updatedAt) byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_SAVED_CONVERSATIONS);
}

function readConversationHistory(): Conversation[] {
  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Conversation => Boolean(
      item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" &&
      Array.isArray(item.messages) && typeof item.updatedAt === "number" &&
      item.messages.every((message: unknown) => Boolean(
        message && typeof message === "object" && typeof (message as Message).id === "string" &&
        ((message as Message).role === "user" || (message as Message).role === "assistant") &&
        typeof (message as Message).text === "string" && typeof (message as Message).createdAt === "number"
      ))
    )).slice(0, MAX_SAVED_CONVERSATIONS);
  } catch {
    return [];
  }
}

function decodeAccountRows(rows: unknown): Conversation[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row: unknown) => {
    if (!row || typeof row !== "object") return [];
    const value = row as { id?: unknown; title?: unknown; messages?: unknown; updated_at?: unknown };
    if (typeof value.id !== "string" || typeof value.title !== "string" || typeof value.updated_at !== "string") return [];
    const updatedAt = Date.parse(value.updated_at);
    if (!Number.isFinite(updatedAt)) return [];
    const messages = Array.isArray(value.messages) ? value.messages.filter((message: unknown) => Boolean(
      message && typeof message === "object" && typeof (message as Message).id === "string" &&
      ((message as Message).role === "user" || (message as Message).role === "assistant") &&
      typeof (message as Message).text === "string" && typeof (message as Message).createdAt === "number"
    )) as Message[] : [];
    return [{ id: value.id, title: value.title, messages, updatedAt }];
  }).slice(0, MAX_SAVED_CONVERSATIONS);
}

function MessageText({ text }: { text: string }) {
  const pieces = text.split(/(https?:\/\/[^\s)]+)/g);
  return <span className="whitespace-pre-wrap break-words">{pieces.map((piece, index) => /^https?:\/\//.test(piece)
    ? <a key={index} href={piece} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "var(--primary-green)" }}>{piece}</a>
    : <span key={index}>{piece}</span>)}</span>;
}

export default function CitizenAIChat({ lang, nickname }: { lang: Language; nickname?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountReady, setAccountReady] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [historyNotice, setHistoryNotice] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const voiceInput = useCitizenVoiceInput(lang, (transcript) => setDraft((current) => current.trim() ? `${current.trim()} ${transcript}` : transcript));
  const { isRecording, isTranscribing, notice: voiceNotice, setNotice: setVoiceNotice, toggle: toggleVoice, cancel: cancelVoice } = voiceInput;
  const pendingInitialPromptRef = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const langRef = useRef(lang);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const cloudHydratedUserId = useRef<string | null>(null);
  const activeConversation = useMemo(() => conversations.find((item) => item.id === activeConversationId) || null, [activeConversationId, conversations]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    try {
      const prompt = window.sessionStorage.getItem(CITIZEN_CHAT_PENDING_PROMPT_KEY)?.trim();
      if (prompt) pendingInitialPromptRef.current = prompt;
      window.sessionStorage.removeItem(CITIZEN_CHAT_PENDING_PROMPT_KEY);
    } catch {
      pendingInitialPromptRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      const localConversations = readConversationHistory();
      if (cancelled) return;
      setConversations(localConversations);
      setActiveConversationId(localConversations[0]?.id || null);
      setHasLoadedHistory(true);

      if (!isSupabaseConfigured()) {
        setAccountReady(true);
        return;
      }

      const supabase = createClient();
      supabaseRef.current = supabase;
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authError || !user) {
        setAccountReady(true);
        return;
      }

      const signedInAccount = { id: user.id, email: user.email || "" };
      setAccount(signedInAccount);
      const preferenceKey = `${ACCOUNT_SAVE_KEY}:${user.id}`;
      let optedIn = false;
      try { optedIn = window.localStorage.getItem(preferenceKey) === "true"; } catch { /* Browser storage may be unavailable. */ }
      if (optedIn) {
        const { data, error: historyError } = await supabase
          .from("citizen_chat_conversations")
          .select("id, title, messages, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(MAX_SAVED_CONVERSATIONS);
        if (cancelled) return;
        if (historyError) {
          setHistoryNotice(translate(langRef.current, "অ্যাকাউন্টের চ্যাট লোড করা যায়নি।", "Saved account chats could not be loaded."));
        } else {
          const merged = mergeConversations(localConversations, decodeAccountRows(data));
          setConversations(merged);
          setActiveConversationId(merged[0]?.id || null);
          cloudHydratedUserId.current = user.id;
          setSaveToAccount(true);
          setHistoryNotice(translate(langRef.current, "চ্যাট আপনার অ্যাকাউন্টে সংরক্ষিত হবে।", "New chats are being saved to your account."));
        }
      }
      setAccountReady(true);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hasLoadedHistory) return;
    void Promise.resolve().then(() => {
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations.slice(0, MAX_SAVED_CONVERSATIONS)));
      } catch {
        setError(translate(lang, "ব্রাউজারে চ্যাটের ইতিহাস সংরক্ষণ করা যায়নি।", "Chat history could not be saved in this browser."));
      }
    });
  }, [conversations, hasLoadedHistory, lang]);

  useEffect(() => {
    if (!hasLoadedHistory || !accountReady || !saveToAccount || !account || cloudHydratedUserId.current !== account.id) return;
    const rows = conversations.filter((item) => item.messages.length).map((item) => ({
      id: item.id,
      user_id: account.id,
      title: item.title.slice(0, 120),
      messages: item.messages,
      created_at: new Date(item.messages[0]?.createdAt || item.updatedAt).toISOString(),
      updated_at: new Date(item.updatedAt).toISOString(),
    }));
    if (!rows.length) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setIsSyncing(true);
      void supabaseRef.current?.from("citizen_chat_conversations").upsert(rows, { onConflict: "id" }).then(({ error: syncError }) => {
        if (cancelled) return;
        setIsSyncing(false);
        setHistoryNotice(syncError
          ? translate(lang, "অ্যাকাউন্টে সংরক্ষণ হয়নি। আবার চেষ্টা করুন।", "Could not save to your account. Please try again.")
          : translate(lang, "চ্যাট আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে।", "Chats are saved to your account."));
      });
    }, 450);
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [account, accountReady, conversations, hasLoadedHistory, lang, saveToAccount]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [activeConversation?.messages.length, isSending]);

  useEffect(() => () => cancelVoice(), [cancelVoice]);

  const startNewChat = () => {
    if (isSending) return;
    const id = newId();
    const conversation: Conversation = { id, title: translate(lang, "নতুন চ্যাট", "New chat"), messages: [], updatedAt: Date.now() };
    setConversations((items) => [conversation, ...items.filter((item) => item.messages.length > 0)].slice(0, MAX_SAVED_CONVERSATIONS));
    setActiveConversationId(id);
    setDraft("");
    setError("");
    setVoiceNotice("");
  };

  const clearHistory = async () => {
    const accepted = window.confirm(translate(lang, "এই ব্রাউজার থেকে সব চ্যাট ইতিহাস মুছে ফেলবেন?", "Clear all chat history saved in this browser?"));
    if (!accepted) return;
    if (saveToAccount && account && supabaseRef.current) {
      setIsSyncing(true);
      const { error: deleteError } = await supabaseRef.current
        .from("citizen_chat_conversations")
        .delete()
        .eq("user_id", account.id);
      setIsSyncing(false);
      if (deleteError) {
        setHistoryNotice(translate(lang, "অ্যাকাউন্টের ইতিহাস মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Account history could not be cleared. Please try again."));
        return;
      }
    }
    setConversations([]);
    setActiveConversationId(null);
    setDraft("");
    setError("");
    setHistoryNotice(translate(lang, "এই ব্রাউজারের চ্যাট ইতিহাস মুছে ফেলা হয়েছে।", "Chat history was cleared from this browser."));
  };

  const toggleAccountSaving = async () => {
    if (isSyncing) return;
    if (saveToAccount) {
      setSaveToAccount(false);
      cloudHydratedUserId.current = null;
      try { if (account) window.localStorage.removeItem(`${ACCOUNT_SAVE_KEY}:${account.id}`); } catch { /* Browser storage may be unavailable. */ }
      setHistoryNotice(translate(lang, "অ্যাকাউন্টে সংরক্ষণ বন্ধ। আগে সংরক্ষিত চ্যাট অ্যাকাউন্টে থাকবে।", "Account saving is off. Existing account chats remain saved there."));
      return;
    }
    if (!account || !supabaseRef.current) {
      setHistoryNotice(translate(lang, "অ্যাকাউন্টে চ্যাট রাখতে আগে লগইন করুন।", "Sign in to save chats to your account."));
      return;
    }

    setIsSyncing(true);
    const { data, error: loadError } = await supabaseRef.current
      .from("citizen_chat_conversations")
      .select("id, title, messages, updated_at")
      .eq("user_id", account.id)
      .order("updated_at", { ascending: false })
      .limit(MAX_SAVED_CONVERSATIONS);
    setIsSyncing(false);
    if (loadError) {
      setHistoryNotice(translate(lang, "অ্যাকাউন্টের ইতিহাস চালু করা যায়নি। ডেটাবেস সেটআপ পরীক্ষা করুন।", "Could not enable account history. Check the database setup."));
      return;
    }

    const merged = mergeConversations(conversations, decodeAccountRows(data));
    setConversations(merged);
    setActiveConversationId(merged[0]?.id || null);
    cloudHydratedUserId.current = account.id;
    setSaveToAccount(true);
    try { window.localStorage.setItem(`${ACCOUNT_SAVE_KEY}:${account.id}`, "true"); } catch { /* Cloud saving still works for this session. */ }
    setHistoryNotice(translate(lang, "চ্যাট আপনার অ্যাকাউন্টে সংরক্ষিত হবে।", "Chats will now be saved to your account."));
  };

  const submitMessage = useCallback(async (event?: FormEvent<HTMLFormElement>, promptOverride?: string, startNewConversation = false) => {
    event?.preventDefault();
    const text = (promptOverride ?? draft).trim();
    if (!text || isSending) return;
    const conversationId = startNewConversation ? newId() : activeConversationId || newId();
    const previous = conversations.find((item) => item.id === conversationId);
    const userMessage: Message = { id: newId(), role: "user", text, createdAt: Date.now() };
    const nextMessages = [...(previous?.messages || []), userMessage];
    const title = previous?.messages.length ? previous.title : text.replace(/\s+/g, " ").slice(0, 48);
    const updatedConversation: Conversation = { id: conversationId, title, messages: nextMessages, updatedAt: Date.now() };
    setConversations((items) => [updatedConversation, ...items.filter((item) => item.id !== conversationId)].slice(0, MAX_SAVED_CONVERSATIONS));
    setActiveConversationId(conversationId);
    setDraft("");
    setError("");
    setVoiceNotice("");
    setIsSending(true);
    try {
      const response = await fetch("/api/citizen-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-16).map(({ role, text: content }) => ({ role, content })) }),
      });
      const payload = await response.json().catch(() => ({})) as { text?: string; code?: string };
      if (!response.ok || !payload.text) {
        if (payload.code === "not_configured") throw new Error(translate(lang, "Cloudflare Workers AI এখনো সাইটে সেট করা হয়নি। সাইট মালিককে Cloudflare account ID ও Workers AI API token নিরাপদে যোগ করতে হবে।", "Cloudflare Workers AI is not configured yet. The site owner needs to add the Cloudflare account ID and Workers AI API token securely."));
        if (payload.code === "rate_limited") throw new Error(translate(lang, "এই নেটওয়ার্ক থেকে অনেক বার্তা পাঠানো হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।", "Too many messages came from this network. Please wait about a minute and try again."));
        if (payload.code === "provider_key_invalid") throw new Error(translate(lang, "Cloudflare API token বা account ID সঠিক নয়। সাইট মালিককে Workers AI token পরীক্ষা করতে হবে।", "The Cloudflare API token or account ID is not valid. The site owner needs to check the Workers AI token."));
        if (payload.code === "provider_access_denied") throw new Error(translate(lang, "Cloudflare Workers AI এই account-এ অনুমোদিত নয়। Workers AI access ও Free plan model availability পরীক্ষা করুন।", "Cloudflare Workers AI denied access for this account. Check Workers AI permissions and Free plan model access."));
        if (payload.code === "free_quota_exceeded") throw new Error(translate(lang, "Cloudflare-এর দৈনিক বিনামূল্যের AI সীমা পূর্ণ হয়েছে। এটি UTC রাত ১২টায় আবার চালু হবে; পরে চেষ্টা করুন।", "Cloudflare's daily free AI allowance has been reached. It resets at 00:00 UTC; please try again later."));
        if (payload.code === "provider_rate_limited") throw new Error(translate(lang, "Cloudflare AI-তে অল্প সময়ে অনেক অনুরোধ গেছে। একটু অপেক্ষা করে আবার চেষ্টা করুন।", "Cloudflare AI received too many requests in a short time. Please wait a moment and try again."));
        if (payload.code === "provider_unavailable") throw new Error(translate(lang, "AI সেবা এখন অনুপলব্ধ। একটু পরে আবার চেষ্টা করুন।", "The AI service is currently unavailable. Please try again shortly."));
        if (payload.code === "safety_blocked") throw new Error(translate(lang, "এই অনুরোধে উত্তর তৈরি করা যায়নি। অন্যভাবে জিজ্ঞাসা করুন।", "The assistant could not answer that request. Please rephrase it."));
        if (response.status === 429) throw new Error(translate(lang, "অনেক অনুরোধ এসেছে। একটু পরে আবার চেষ্টা করুন।", "Too many requests. Please try again shortly."));
        throw new Error(translate(lang, "উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।", "No answer was received. Please try again."));
      }
      const assistantMessage: Message = { id: newId(), role: "assistant", text: payload.text, createdAt: Date.now() };
      setConversations((items) => {
        const current = items.find((item) => item.id === conversationId);
        if (!current) return items;
        return [{ ...current, messages: [...current.messages, assistantMessage], updatedAt: Date.now() }, ...items.filter((item) => item.id !== conversationId)].slice(0, MAX_SAVED_CONVERSATIONS);
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : translate(lang, "সংযোগ করা যায়নি। আবার চেষ্টা করুন।", "Could not connect. Please try again."));
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId, conversations, draft, isSending, lang, setVoiceNotice]);

  useEffect(() => {
    if (!hasLoadedHistory || !accountReady || !pendingInitialPromptRef.current) return;
    const initialPrompt = pendingInitialPromptRef.current;
    pendingInitialPromptRef.current = null;
    void submitMessage(undefined, initialPrompt, true);
  }, [hasLoadedHistory, accountReady, submitMessage]);

  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  const starterPrompts = lang === "bn"
    ? ["জন্মনিবন্ধনের জন্য কীভাবে আবেদন করব?", "হারানো NID কীভাবে পুনরায় পাব?", "সরকারি সেবায় অভিযোগ কোথায় করব?"]
    : ["How do I apply for birth registration?", "How can I replace a lost NID?", "Where can I complain about a public service?"];

  return (
    <section className="mx-auto max-w-7xl text-left" aria-label={translate(lang, "নাগরিক সেবা সহায়তা", "Citizen service guide")}>
      <div className="grid gap-4 lg:min-h-[calc(100vh-220px)] lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="flex max-h-[360px] min-h-[240px] flex-col overflow-hidden rounded-2xl border text-left lg:max-h-none lg:min-h-[calc(100vh-220px)]" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
          <div className="h-1.5 bg-gradient-to-r from-[#006A4E] via-[#006A4E] to-[#D14949]" />
          <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-subtle)" }}>{translate(lang, "আপনার সেবা ডেস্ক", "Your service desk")}</p>
              <h3 className="mt-1 text-sm font-bold" style={{ color: "var(--text-main)" }}>{translate(lang, "কথোপকথন", "Conversations")}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => void clearHistory()} disabled={!conversations.some((item) => item.messages.length) || isSyncing} className="rounded-lg p-2 transition hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/5" aria-label={translate(lang, "ইতিহাস মুছুন", "Clear history")} title={translate(lang, "ইতিহাস মুছুন", "Clear history")}><Trash2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={startNewChat} disabled={isSending} className="rounded-lg p-2 transition hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/5" aria-label={translate(lang, "নতুন কথোপকথন", "New conversation")} title={translate(lang, "নতুন কথোপকথন", "New conversation")}><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mx-3 mb-3 rounded-xl border p-3" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: saveToAccount ? "var(--primary-green-light)" : "var(--background)", color: "var(--primary-green)" }}>{saveToAccount ? <CloudCheck className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold" style={{ color: "var(--text-main)" }}>{translate(lang, "অ্যাকাউন্টে চ্যাট সংরক্ষণ", "Save chats to account")}</p>
                <p className="mt-0.5 text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>{translate(lang, "ঐচ্ছিক। চালু করলে এই ব্রাউজারের আগের ও নতুন চ্যাট অ্যাকাউন্টে থাকবে।", "Optional. Turning this on saves existing and new browser chats to your account.")}</p>
              </div>
              <button type="button" onClick={() => void toggleAccountSaving()} disabled={!accountReady || isSyncing} aria-pressed={saveToAccount} className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition disabled:cursor-wait disabled:opacity-50 ${saveToAccount ? "bg-[#006A4E]" : "bg-slate-300 dark:bg-slate-600"}`} aria-label={saveToAccount ? translate(lang, "অ্যাকাউন্টে সংরক্ষণ বন্ধ করুন", "Turn off account saving") : translate(lang, "অ্যাকাউন্টে সংরক্ষণ চালু করুন", "Turn on account saving")}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${saveToAccount ? "left-[18px]" : "left-0.5"}`} /></button>
            </div>
            {!account && accountReady && <Link href="/login?next=%2Fchat" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold underline underline-offset-2" style={{ color: "var(--primary-green)" }}>{translate(lang, "লগইন করে অ্যাকাউন্টে রাখুন", "Sign in to save to your account")}</Link>}
            {account && <p className="mt-2 truncate text-[10px]" style={{ color: "var(--text-subtle)" }}>{account.email || translate(lang, "আপনার Jonogon অ্যাকাউন্ট", "Your Jonogon account")}</p>}
            {historyNotice && <p role="status" className="mt-2 text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>{isSyncing ? translate(lang, "সংরক্ষণ হচ্ছে…", "Saving…") : historyNotice}</p>}
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
            {conversations.filter((item) => item.messages.length).map((item) => (
              <button key={item.id} type="button" onClick={() => { setActiveConversationId(item.id); setError(""); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition hover:bg-black/5 dark:hover:bg-white/5" style={{ backgroundColor: activeConversationId === item.id ? "var(--primary-green-light)" : "transparent", color: "var(--text-main)" }}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.title}</span>
              </button>
            ))}
            {!conversations.some((item) => item.messages.length) && <p className="px-3 py-3 text-[11px] leading-5" style={{ color: "var(--text-muted)" }}>{translate(lang, "সরকারি সেবা নিয়ে নতুন প্রশ্ন শুরু করুন।", "Start a question about a public service.")}</p>}
          </div>
          <div className="flex items-center gap-2 border-t px-4 py-3 text-[10px]" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}><ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--primary-green)" }} />{translate(lang, "নিরাপদ ব্যবহার • তথ্য যাচাই করুন", "Use safely • verify official details")}</div>
        </aside>

        <div className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:min-h-[calc(100vh-220px)]" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundColor: "var(--primary-green)" }}><Landmark className="h-5 w-5" /></span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.17em]" style={{ color: "var(--primary-green)" }}>{translate(lang, "জনগণ • নাগরিক সহায়তা", "JONOGON • CITIZEN SUPPORT")}</p>
                <h2 className="text-sm font-bold sm:text-base" style={{ color: "var(--text-main)" }}>{translate(lang, "সরকারি সেবা নির্দেশিকা", "Public Service Guide")}</h2>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)", backgroundColor: "var(--surface)" }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--primary-green)" }} />{translate(lang, "বাংলা ও ইংরেজি", "Bangla & English")}</div>
          </header>

          <div ref={transcriptRef} className="min-h-[300px] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite" aria-relevant="additions text">
            {activeConversation?.messages.length ? activeConversation.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "rounded-br-md text-white" : "rounded-bl-md border"}`} style={message.role === "user" ? { backgroundColor: "var(--primary-green)" } : { borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}>
                  {message.role === "assistant" && <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--primary-green)" }}><Landmark className="h-3.5 w-3.5" />{translate(lang, "নাগরিক সেবা সহায়ক", "Citizen Service Guide")}</span>}
                  <MessageText text={message.text} />
                </div>
              </div>
            )) : (
              <div className="flex h-full flex-col justify-center rounded-2xl border px-4 py-5 sm:px-6" style={{ borderColor: "var(--border-subtle)", background: "linear-gradient(135deg, var(--background), var(--surface))" }}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}><BookOpenText className="h-5 w-5" /></span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--primary-green)" }}>{translate(lang, "সেবা বুঝুন • পরের ধাপ জানুন", "Understand the service • know your next step")}</p>
                    <h3 className="mt-1 text-lg font-bold sm:text-xl" style={{ color: "var(--text-main)" }}>{nickname ? translate(lang, `কীভাবে সহায়তা করতে পারি, ${nickname}?`, `How can we help, ${nickname}?`) : translate(lang, "সরকারি সেবার কোন ধাপে সহায়তা চান?", "Which step of a public service can we help with?")}</h3>
                    <p className="mt-1 max-w-2xl text-xs leading-5" style={{ color: "var(--text-muted)" }}>{translate(lang, "আবেদন, প্রয়োজনীয় কাগজপত্র, যোগ্যতা বা পরবর্তী করণীয় সম্পর্কে জিজ্ঞাসা করুন।", "Ask about applications, required documents, eligibility, or what to do next.")}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {starterPrompts.map((prompt, index) => <button key={prompt} type="button" onClick={() => setDraft(prompt)} className="group flex min-h-[62px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-semibold leading-4 transition hover:-translate-y-0.5 hover:shadow-sm" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold" style={{ backgroundColor: index === 2 ? "var(--alert-red-light)" : "var(--primary-green-light)", color: index === 2 ? "var(--alert-red)" : "var(--primary-green)" }}>0{index + 1}</span>{prompt}</button>)}
                </div>
              </div>
            )}
            {isSending && <div className="flex items-center gap-2 px-2 py-3 text-xs" style={{ color: "var(--text-muted)" }}><LoaderCircle className="h-4 w-4 animate-spin" />{translate(lang, "সরকারি সেবা নির্দেশনা তৈরি হচ্ছে…", "Preparing service guidance…")}</div>}
          </div>

          <div className="px-4 pb-3 sm:px-5">
            <form onSubmit={(event) => void submitMessage(event)} className="rounded-2xl border p-2 shadow-sm" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onComposerKeyDown} rows={2} maxLength={6000} placeholder={translate(lang, "যেকোনো কিছু জিজ্ঞাসা করুন", "Ask anything")} aria-label={translate(lang, "আপনার বার্তা লিখুন", "Write your message")} className="max-h-36 min-h-12 w-full resize-y bg-transparent px-2 py-1.5 text-sm outline-none" style={{ color: "var(--text-main)" }} />
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => { setError(""); void toggleVoice(); }} disabled={isTranscribing} className="min-h-11 min-w-11 touch-manipulation rounded-lg p-2 transition hover:bg-black/5 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-white/5" style={{ color: isRecording ? "var(--alert-red)" : "var(--text-muted)" }} aria-label={isTranscribing ? translate(lang, "কথা লিখে নেওয়া হচ্ছে", "Transcribing speech") : isRecording ? translate(lang, "শোনা বন্ধ করুন", "Stop listening") : translate(lang, "বাংলা বা ইংরেজিতে বলুন", "Speak in Bangla or English")} aria-pressed={isRecording} aria-busy={isTranscribing} title={isTranscribing ? translate(lang, "কথা লিখে নেওয়া হচ্ছে", "Transcribing speech") : isRecording ? translate(lang, "শোনা বন্ধ করুন", "Stop listening") : translate(lang, "ভয়েস ইনপুট", "Voice input")}>{isTranscribing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
                  {voiceNotice && <span role="status" className="max-w-[180px] truncate text-[10px]" style={{ color: "var(--text-muted)" }}>{voiceNotice}</span>}
                </div>
                <button type="submit" disabled={!draft.trim() || isSending} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: "var(--primary-green)" }} aria-label={translate(lang, "বার্তা পাঠান", "Send message")}><ArrowUp className="h-4 w-4" /></button>
              </div>
            </form>
            {error && <p role="alert" className="mt-2 text-xs leading-5 text-red-700">{error}</p>}
            <p className="mt-2 text-center text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>{translate(lang, "Cloudflare Workers AI-এর বিনামূল্যের দৈনিক সীমা প্রযোজ্য। ব্যক্তিগত NID/পাসপোর্ট নম্বর, OTP বা পাসওয়ার্ড লিখবেন না।", "Cloudflare Workers AI's free daily allowance applies. Do not enter personal ID/passport numbers, OTPs, or passwords.")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
