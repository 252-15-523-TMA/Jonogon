"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Bot, LoaderCircle, MessageSquare, Mic, MicOff, Plus, Trash2 } from "lucide-react";

type Language = "bn" | "en";
type Message = { id: string; role: "user" | "assistant"; text: string; createdAt: number };
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };
type SpeechResult = { length: number; [index: number]: { transcript: string } };
type SpeechEventLike = { resultIndex: number; results: ArrayLike<SpeechResult> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  suppressEmptyEnd?: boolean;
  onresult: ((event: SpeechEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const HISTORY_KEY = "jonogon-citizen-chat-v1";
const MAX_SAVED_CONVERSATIONS = 40;
const translate = (lang: Language, bn: string, en: string) => lang === "bn" ? bn : en;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<Language>(lang);
  const [voiceNotice, setVoiceNotice] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const activeConversation = useMemo(() => conversations.find((item) => item.id === activeConversationId) || null, [activeConversationId, conversations]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Conversation[];
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((item) => item && typeof item.id === "string" && Array.isArray(item.messages)).slice(0, MAX_SAVED_CONVERSATIONS);
          setConversations(valid);
          setActiveConversationId(valid[0]?.id || null);
        }
      }
    } catch {
      setConversations([]);
    }
    setHasLoadedHistory(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedHistory) return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations.slice(0, MAX_SAVED_CONVERSATIONS)));
    } catch {
      setError(translate(lang, "ব্রাউজারে চ্যাটের ইতিহাস সংরক্ষণ করা যায়নি।", "Chat history could not be saved in this browser."));
    }
  }, [conversations, hasLoadedHistory, lang]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [activeConversation?.messages.length, isSending]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

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

  const clearHistory = () => {
    const accepted = window.confirm(translate(lang, "এই ব্রাউজার থেকে সব চ্যাট ইতিহাস মুছে ফেলবেন?", "Clear all chat history saved in this browser?"));
    if (!accepted) return;
    setConversations([]);
    setActiveConversationId(null);
    setDraft("");
    setError("");
  };

  const toggleVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.suppressEmptyEnd = true;
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as SpeechRecognitionWindow).SpeechRecognition ?? (window as SpeechRecognitionWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice(translate(lang, "এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। Chrome বা Edge-এ চেষ্টা করুন।", "Voice input is not supported in this browser. Try Chrome or Edge."));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage === "bn" ? "bn-BD" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    let heardSpeech = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) transcript += event.results[index][0].transcript;
      transcript = transcript.trim();
      if (transcript) {
        heardSpeech = true;
        setDraft(transcript);
        setVoiceNotice(transcript);
      }
    };
    recognition.onerror = (event) => {
      const messages: Record<string, [string, string]> = {
        "not-allowed": ["মাইক্রোফোন ব্যবহারের অনুমতি দিন, তারপর আবার চেষ্টা করুন।", "Allow microphone access, then try again."],
        "service-not-allowed": ["ব্রাউজারের স্পিচ সার্ভিস ব্যবহার করা যাচ্ছে না।", "The browser speech service is unavailable."],
        "audio-capture": ["কোনো মাইক্রোফোন পাওয়া যায়নি।", "No microphone was found."],
        "no-speech": ["কোনো কথা শোনা যায়নি। আবার বলুন।", "No speech was detected. Please try again."],
        network: ["স্পিচ সার্ভিসে সংযোগ করা যায়নি।", "Could not connect to the speech service."],
      };
      const message = messages[event.error];
      if (event.error !== "aborted") setVoiceNotice(message ? translate(lang, message[0], message[1]) : translate(lang, "ভয়েস ইনপুটে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Voice input failed. Please try again."));
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setIsRecording(false);
      if (!heardSpeech && !recognition.suppressEmptyEnd) setVoiceNotice((current) => current || translate(lang, "কোনো কথা ধরা যায়নি। আবার চেষ্টা করুন।", "No speech was detected. Please try again."));
    };
    try {
      setError("");
      setVoiceNotice(translate(lang, "শুনছি... কথা বলুন...", "Listening... speak now..."));
      recognitionRef.current = recognition;
      setIsRecording(true);
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsRecording(false);
      setVoiceNotice(translate(lang, "মাইক্রোফোন চালু করা যায়নি। অনুমতি পরীক্ষা করুন।", "Could not start the microphone. Check its permission."));
    }
  };

  const toggleVoiceLanguage = () => {
    if (recognitionRef.current) {
      recognitionRef.current.suppressEmptyEnd = true;
      recognitionRef.current.stop();
    }
    recognitionRef.current = null;
    setIsRecording(false);
    const next = voiceLanguage === "bn" ? "en" : "bn";
    setVoiceLanguage(next);
    setVoiceNotice(next === "bn" ? translate(lang, "ভয়েস ইনপুটের ভাষা বাংলা করা হয়েছে।", "Voice input language set to Bangla.") : translate(lang, "ভয়েস ইনপুটের ভাষা ইংরেজি করা হয়েছে।", "Voice input language set to English."));
  };

  const submitMessage = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;
    const conversationId = activeConversationId || newId();
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
        if (payload.code === "not_configured") throw new Error(translate(lang, "AI চ্যাট চালু করতে সাইট মালিককে OpenAI API key ও model যোগ করতে হবে।", "AI chat is not connected yet. The site owner must configure an OpenAI API key and model."));
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
  };

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
    <section className="mx-auto max-w-5xl text-left" aria-label={translate(lang, "নাগরিক AI চ্যাট", "Citizen AI chat")}>
      <div className="grid gap-3 md:grid-cols-[205px_minmax(0,1fr)]">
        <aside className="flex max-h-[450px] flex-col rounded-xl border p-2 text-left" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold" style={{ color: "var(--text-main)" }}>{translate(lang, "চ্যাটের ইতিহাস", "Chat history")}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearHistory} disabled={!conversations.some((item) => item.messages.length)} className="rounded-lg p-1.5 disabled:opacity-35" aria-label={translate(lang, "ইতিহাস মুছুন", "Clear history")} title={translate(lang, "ইতিহাস মুছুন", "Clear history")}><Trash2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={startNewChat} className="rounded-lg p-1.5" aria-label={translate(lang, "নতুন চ্যাট", "New chat")} title={translate(lang, "নতুন চ্যাট", "New chat")}><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {conversations.filter((item) => item.messages.length).map((item) => (
              <button key={item.id} type="button" onClick={() => { setActiveConversationId(item.id); setError(""); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition hover:bg-black/5 dark:hover:bg-white/5" style={{ backgroundColor: activeConversationId === item.id ? "var(--primary-green-light)" : "transparent", color: "var(--text-main)" }}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.title}</span>
              </button>
            ))}
            {!conversations.some((item) => item.messages.length) && <p className="px-2 py-3 text-[11px] leading-5" style={{ color: "var(--text-muted)" }}>{translate(lang, "আপনার আগের কথোপকথন এখানে থাকবে।", "Your conversations will appear here.")}</p>}
          </div>
        </aside>

        <div className="min-w-0 rounded-xl border p-3 sm:p-4" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
          <div ref={transcriptRef} className="mb-3 h-[260px] space-y-3 overflow-y-auto rounded-lg px-1 py-1 sm:h-[300px]" aria-live="polite" aria-relevant="additions text">
            {activeConversation?.messages.length ? activeConversation.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "rounded-br-md text-white" : "rounded-bl-md border"}`} style={message.role === "user" ? { backgroundColor: "var(--primary-green)" } : { borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}>
                  {message.role === "assistant" && <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--primary-green)" }}><Bot className="h-3.5 w-3.5" />Jonogon AI</span>}
                  <MessageText text={message.text} />
                </div>
              </div>
            )) : (
              <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}><Bot className="h-5 w-5" /></span>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>{nickname ? translate(lang, `আজ আপনাকে কীভাবে সাহায্য করতে পারি, ${nickname}?`, `How can I help you today, ${nickname}?`) : translate(lang, "আজ আপনাকে কীভাবে সাহায্য করতে পারি, Citizen?", "How can I help you today, Citizen?")}</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{translate(lang, "সরকারি সেবা সম্পর্কে যেকোনো প্রশ্ন করুন।", "Ask anything about public services.")}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">{starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => setDraft(prompt)} className="rounded-full border px-3 py-1.5 text-[11px] transition hover:shadow-sm" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}>{prompt}</button>)}</div>
              </div>
            )}
            {isSending && <div className="flex items-center gap-2 px-2 py-3 text-xs" style={{ color: "var(--text-muted)" }}><LoaderCircle className="h-4 w-4 animate-spin" />{translate(lang, "উত্তর তৈরি হচ্ছে…", "Thinking…")}</div>}
          </div>

          <form onSubmit={(event) => void submitMessage(event)} className="rounded-2xl border p-2 shadow-sm" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onComposerKeyDown} rows={2} maxLength={6000} placeholder={translate(lang, "যেকোনো কিছু জিজ্ঞাসা করুন", "Ask anything")} aria-label={translate(lang, "আপনার বার্তা লিখুন", "Write your message")} className="max-h-36 min-h-12 w-full resize-y bg-transparent px-2 py-1.5 text-sm outline-none" style={{ color: "var(--text-main)" }} />
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={toggleVoiceLanguage} className="rounded-lg px-2 py-1.5 text-[10px] font-bold" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }} aria-label={voiceLanguage === "bn" ? translate(lang, "ভয়েসের ভাষা বাংলা; ইংরেজিতে বদলান", "Voice language is Bangla; switch to English") : translate(lang, "ভয়েসের ভাষা ইংরেজি; বাংলায় বদলান", "Voice language is English; switch to Bangla")}>{voiceLanguage === "bn" ? "বাংলা" : "EN"}</button>
                <button type="button" onClick={toggleVoice} className="rounded-lg p-2 transition hover:bg-black/5 dark:hover:bg-white/5" style={{ color: isRecording ? "var(--alert-red)" : "var(--text-muted)" }} aria-label={isRecording ? translate(lang, "শোনা বন্ধ করুন", "Stop listening") : voiceLanguage === "bn" ? translate(lang, "বাংলায় বলুন", "Speak in Bangla") : translate(lang, "ইংরেজিতে বলুন", "Speak in English")} aria-pressed={isRecording} title={isRecording ? translate(lang, "শোনা বন্ধ করুন", "Stop listening") : translate(lang, "ভয়েস ইনপুট", "Voice input")}>{isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
                {voiceNotice && <span role="status" className="max-w-[180px] truncate text-[10px]" style={{ color: "var(--text-muted)" }}>{voiceNotice}</span>}
              </div>
              <button type="submit" disabled={!draft.trim() || isSending} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: "var(--primary-green)" }} aria-label={translate(lang, "বার্তা পাঠান", "Send message")}><ArrowUp className="h-4 w-4" /></button>
            </div>
          </form>
          {error && <p role="alert" className="mt-2 text-xs leading-5 text-red-700">{error}</p>}
          <p className="mt-2 text-center text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>{translate(lang, "উত্তর OpenAI API থেকে আসে। ব্যক্তিগত NID/পাসপোর্ট নম্বর, OTP বা পাসওয়ার্ড লিখবেন না।", "Replies use the OpenAI API. Do not enter personal ID/passport numbers, OTPs, or passwords.")}</p>
        </div>
      </div>
    </section>
  );
}
