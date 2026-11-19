"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, Mail, Save, Send, ShieldCheck, Upload, UserRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { JonogonPage } from "./JonogonApp";

type AccountPageMode = Extract<JonogonPage, "login" | "signup" | "profile" | "feedback" | "notifications" | "owner" | "owner-setup">;
type AccountUser = { id: string; email: string };
type ProfileRow = { user_id: string; email: string; nickname: string; full_name: string; avatar_url: string | null; role: string; created_at: string };
type FeedbackRow = { id: string; user_id: string; sender_email: string; message: string; status: "new" | "answered"; created_at: string };
type NotificationRow = { id: string; title: string; message: string; created_at: string; read_at: string | null };

export default function AccountPages({ mode, lang }: { mode: AccountPageMode; lang: "bn" | "en" }) {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const isAuthPage = mode === "login" || mode === "signup";
  const isOwnerPage = mode === "owner";

  useEffect(() => {
    if (mode === "owner-setup") {
      setIsLoading(false);
      return;
    }
    if (!isSupabaseConfigured()) {
      if (!isAuthPage) setError(t("অ্যাকাউন্ট সেবা চালু করতে Supabase সেটআপ প্রয়োজন।", "Supabase setup is required to enable account services."));
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (mode === "login" && new URLSearchParams(window.location.search).get("auth") === "confirmation-failed") {
      setError(t("ইমেইল নিশ্চিত করা যায়নি। লিংকটি আবার চেষ্টা করুন বা নতুন নিশ্চিতকরণ ইমেইল চাইুন।", "Email confirmation failed. Try the link again or request a new confirmation email."));
    }
    let cancelled = false;
    const load = async () => {
      const { data: { user: signedInUser } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (signedInUser) {
        const signedIn = { id: signedInUser.id, email: signedInUser.email || "" };
        setUser(signedIn);
        setEmail((current) => current || signedIn.email);
        setFeedbackEmail((current) => current || signedIn.email);
      } else if (!isAuthPage) {
        setError(t("এই পৃষ্ঠাটি ব্যবহার করতে আগে লগইন করুন।", "Please sign in to use this page."));
        setIsLoading(false);
        return;
      }

      if (!signedInUser) {
        setIsLoading(false);
        return;
      }

      if (mode === "profile") {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, email, nickname, full_name, avatar_url, role, created_at")
          .eq("user_id", signedInUser.id)
          .maybeSingle();
        if (profileError) setError(profileError.message);
        if (data) {
          setNickname(data.nickname || "");
          setFullName(data.full_name || "");
          setAvatarUrl(data.avatar_url || "");
        }
      }

      if (mode === "notifications") {
        const { data, error: notificationError } = await supabase
          .from("notifications")
          .select("id, title, message, created_at, read_at")
          .eq("user_id", signedInUser.id)
          .order("created_at", { ascending: false });
        if (notificationError) setError(notificationError.message);
        setNotifications((data || []) as NotificationRow[]);
      }

      if (isOwnerPage) {
        const { data: roleData, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", signedInUser.id)
          .maybeSingle();
        if (roleError || roleData?.role !== "owner") {
          setError(t("এই নিয়ন্ত্রণ প্যানেলটি সাইট মালিকের জন্য সংরক্ষিত।", "This control panel is reserved for the site owner."));
          setIsLoading(false);
          return;
        }
        const [profileResult, feedbackResult] = await Promise.all([
          supabase.from("profiles").select("user_id, email, nickname, full_name, avatar_url, role, created_at").order("created_at", { ascending: false }),
          supabase.from("feedback").select("id, user_id, sender_email, message, status, created_at").order("created_at", { ascending: false }),
        ]);
        if (profileResult.error) setError(profileResult.error.message);
        if (feedbackResult.error) setError(feedbackResult.error.message);
        setProfiles((profileResult.data || []) as ProfileRow[]);
        setFeedbackItems((feedbackResult.data || []) as FeedbackRow[]);
      }
      setIsLoading(false);
    };

    void load();
    return () => { cancelled = true; };
  }, [mode, isAuthPage, isOwnerPage, lang]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!isSupabaseConfigured()) {
      setError(t("সুপাবেস সেটআপ করা হয়নি।", "Supabase is not configured yet."));
      return;
    }
    setIsSaving(true);
    const supabase = createClient();
    const next = new URLSearchParams(window.location.search).get("next");
    const nextPath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
    if (mode === "signup") {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname: nickname.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) setError(authError.message);
      else if (!data.session) setMessage(t("আপনার ইমেইলে নিশ্চিতকরণ লিংক পাঠানো হয়েছে। লিংকটি খুলে অ্যাকাউন্ট সক্রিয় করুন।", "A confirmation link was sent to your email. Open it to activate your account."));
      else router.replace(nextPath);
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message);
      else {
        router.replace(nextPath);
        router.refresh();
      }
    }
    setIsSaving(false);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");
    setIsSaving(true);
    const { error: saveError } = await createClient().from("profiles").update({
      nickname: nickname.trim(),
      full_name: fullName.trim(),
      avatar_url: avatarUrl || null,
    }).eq("user_id", user.id);
    if (saveError) setError(saveError.message);
    else setMessage(t("প্রোফাইল সংরক্ষণ হয়েছে।", "Profile saved."));
    setIsSaving(false);
  };

  const uploadAvatar = async (file?: File) => {
    if (!user || !file) return;
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError(t("ছবির আকার ৫ এমবির কম হতে হবে।", "Choose an image smaller than 5 MB."));
      return;
    }
    setIsSaving(true);
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setError(uploadError.message);
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      const { error: saveError } = await supabase.from("profiles").update({
        nickname: nickname.trim(),
        full_name: fullName.trim(),
        avatar_url: data.publicUrl,
      }).eq("user_id", user.id);
      if (saveError) setError(saveError.message);
      else setMessage(t("প্রোফাইল ছবি আপডেট হয়েছে।", "Profile picture updated."));
    }
    setIsSaving(false);
  };

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");
    setIsSaving(true);
    const { error: submitError } = await createClient().from("feedback").insert({
      user_id: user.id,
      sender_email: feedbackEmail.trim(),
      message: feedbackMessage.trim(),
    });
    if (submitError) setError(submitError.message);
    else {
      setFeedbackMessage("");
      setMessage(t("আপনার মতামত পাঠানো হয়েছে। ধন্যবাদ!", "Your feedback has been sent. Thank you!"));
    }
    setIsSaving(false);
  };

  const sendOwnerReply = async (item: FeedbackRow) => {
    const text = replyDraft.trim();
    if (!text) return;
    setError("");
    setMessage("");
    setIsSaving(true);
    const supabase = createClient();
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: item.user_id,
      feedback_id: item.id,
      title: t("আপনার মতামতের উত্তর", "A reply to your feedback"),
      message: text,
      created_by: user?.id,
    });
    if (notificationError) {
      setError(notificationError.message);
    } else {
      await supabase.from("feedback").update({ status: "answered" }).eq("id", item.id);
      setFeedbackItems((items) => items.map((feedback) => feedback.id === item.id ? { ...feedback, status: "answered" } : feedback));
      setReplyDraft("");
      setActiveReplyId(null);
      setMessage(t("উত্তরটি ব্যবহারকারীর নোটিফিকেশন সেন্টারে পাঠানো হয়েছে।", "The reply was sent to the user's notification center."));
    }
    setIsSaving(false);
  };

  const markNotificationRead = async (item: NotificationRow) => {
    if (item.read_at) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await createClient().from("notifications").update({ read_at: readAt }).eq("id", item.id);
    if (updateError) setError(updateError.message);
    else {
      setNotifications((items) => items.map((notification) => notification.id === item.id ? { ...notification, read_at: readAt } : notification));
      window.dispatchEvent(new Event("jonogon:notifications-updated"));
    }
  };

  const cardStyle = { backgroundColor: "var(--surface)", borderColor: "var(--border-color)", color: "var(--text-main)" };
  const inputStyle = { backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" };
  const inputClass = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/25";

  return (
    <section className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--primary-green)" }}>
          <ArrowLeft className="h-4 w-4" /> {t("হোমে ফিরুন", "Back to home")}
        </Link>
        {(mode === "profile" || mode === "notifications") && user && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</span>}
      </div>

      <div className="rounded-2xl border p-5 sm:p-7 shadow-sm" style={cardStyle}>
        {mode === "owner-setup" ? (
          <div className="space-y-3">
            <ShieldCheck className="h-8 w-8" style={{ color: "var(--primary-green)" }} />
            <h2 className="text-xl font-bold">{t("সাইট মালিকের প্যানেল সেটআপ", "Set up the owner panel")}</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("এই প্যানেল চালু করতে Supabase project URL, publishable key এবং ডেটাবেস migration প্রয়োগ করতে হবে।", "Add the Supabase project URL and publishable key, then apply the database migration to enable this panel.")}</p>
          </div>
        ) : isAuthPage ? (
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-bold">{mode === "signup" ? t("নতুন অ্যাকাউন্ট তৈরি করুন", "Create your account") : t("আপনার অ্যাকাউন্টে লগইন করুন", "Log in to your account")}</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{t("প্রোফাইল, মতামত এবং নোটিফিকেশন এক জায়গায় পরিচালনা করুন।", "Manage your profile, feedback, and notifications in one place.")}</p>
            <form onSubmit={handleAuth} className="mt-5 space-y-3">
              {mode === "signup" && <label className="block space-y-1.5 text-sm font-medium"><span>{t("নিকনেম", "Nickname")}</span><input required maxLength={40} autoComplete="nickname" className={inputClass} style={inputStyle} value={nickname} onChange={(event) => setNickname(event.target.value)} /></label>}
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("ইমেইল / Gmail", "Email / Gmail")}</span><input required type="email" autoComplete="email" className={inputClass} style={inputStyle} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("পাসওয়ার্ড", "Password")}</span><input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} className={inputClass} style={inputStyle} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <button disabled={isSaving || !isSupabaseConfigured()} className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: mode === "signup" ? "#1d5eaa" : "var(--primary-green)" }}>
                {isSaving ? t("অপেক্ষা করুন…", "Please wait…") : mode === "signup" ? t("সাইন আপ করুন", "Sign up") : t("লগইন করুন", "Log in")}
              </button>
            </form>
            <p className="mt-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {mode === "signup" ? t("আগে অ্যাকাউন্ট আছে?", "Already have an account?") : t("নতুন এখানে?", "New here?")} {" "}
              <Link className="font-semibold underline" style={{ color: "var(--primary-green)" }} href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? t("লগইন", "Log in") : t("সাইন আপ", "Sign up")}</Link>
            </p>
            {!isSupabaseConfigured() && <p className="mt-4 rounded-xl border p-3 text-xs" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>{t("Supabase চালু করতে .env.local-এ প্রজেক্টের URL ও publishable key যোগ করুন।", "Add your Supabase project URL and publishable key to .env.local to enable accounts.")}</p>}
          </div>
        ) : !isAuthPage && !isSupabaseConfigured() ? (
          <div className="space-y-3"><h2 className="text-xl font-bold">{t("অ্যাকাউন্ট সেবা সেটআপ প্রয়োজন", "Account setup required")}</h2><p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("সাইন ইন, প্রোফাইল ও মতামত চালু করতে সুপাবেস প্রজেক্ট সংযোগ এবং ডেটাবেস migration প্রয়োগ করতে হবে।", "Connect the Supabase project and apply the database migration to enable sign-in, profiles, and feedback.")}</p><Link href="/login" className="inline-flex rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary-green)" }}>{t("লগইন", "Log in")}</Link></div>
        ) : isLoading ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("তথ্য লোড হচ্ছে…", "Loading…")}</p>
        ) : error && !user ? (
          <div className="space-y-3"><h2 className="text-xl font-bold">{t("লগইন প্রয়োজন", "Sign in required")}</h2><p className="text-sm" style={{ color: "var(--text-muted)" }}>{error}</p><Link href="/login" className="inline-flex rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary-green)" }}>{t("লগইন", "Log in")}</Link></div>
        ) : mode === "profile" ? (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3"><UserRound className="h-6 w-6" style={{ color: "var(--primary-green)" }} /><div><h2 className="text-xl font-bold">{t("আমার প্রোফাইল", "My profile")}</h2><p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("আপনার পরিচিতির তথ্য সম্পাদনা করুন।", "Edit the information shown on your profile.")}</p></div></div>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border flex items-center justify-center" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                {avatarUrl ? <img src={avatarUrl} alt={t("প্রোফাইল ছবি", "Profile picture")} className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" style={{ color: "var(--text-muted)" }} />}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--border-color)" }}><Upload className="h-4 w-4" />{t("ছবি বাছুন", "Choose picture")}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={isSaving} onChange={(event) => void uploadAvatar(event.target.files?.[0])} /></label>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("সর্বোচ্চ ৫ এমবি", "Up to 5 MB")}</span>
            </div>
            <form onSubmit={saveProfile} className="mt-5 space-y-3">
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("নিকনেম", "Nickname")}</span><input required maxLength={40} className={inputClass} style={inputStyle} value={nickname} onChange={(event) => setNickname(event.target.value)} /></label>
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("পূর্ণ নাম", "Full name")}</span><input maxLength={100} className={inputClass} style={inputStyle} value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("অ্যাকাউন্ট ইমেইল", "Account email")}</span><input readOnly className={inputClass} style={{ ...inputStyle, opacity: 0.75 }} value={user?.email || ""} /></label>
              <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: "var(--primary-green)" }}><Save className="h-4 w-4" />{isSaving ? t("সংরক্ষণ হচ্ছে…", "Saving…") : t("প্রোফাইল সংরক্ষণ করুন", "Save profile")}</button>
            </form>
          </div>
        ) : mode === "feedback" ? (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold">{t("আপনার মতামত জানান", "Share your feedback")}</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{t("কোনো সমস্যা বা উন্নতির পরামর্শ লিখুন। সাইট মালিক আপনাকে ইমেইলে বা নোটিফিকেশনে উত্তর দিতে পারবেন।", "Tell us what needs fixing or improving. The site owner can reply by email or through your notification center.")}</p>
            <form onSubmit={submitFeedback} className="mt-5 space-y-3">
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("Gmail-এ উত্তর পেতে ইমেইল", "Email for a Gmail reply")}</span><input required type="email" autoComplete="email" className={inputClass} style={inputStyle} value={feedbackEmail} onChange={(event) => setFeedbackEmail(event.target.value)} /></label>
              <label className="block space-y-1.5 text-sm font-medium"><span>{t("আপনার মতামত", "Your feedback")}</span><textarea required minLength={10} maxLength={5000} rows={6} className={inputClass} style={inputStyle} value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} placeholder={t("কোন ফিচারটি উন্নত করা উচিত?", "Which feature should we improve?")} /></label>
              <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: "var(--primary-green)" }}><Send className="h-4 w-4" />{isSaving ? t("পাঠানো হচ্ছে…", "Sending…") : t("মতামত পাঠান", "Send feedback")}</button>
            </form>
          </div>
        ) : mode === "notifications" ? (
          <div>
            <div className="flex items-center gap-3"><Bell className="h-6 w-6" style={{ color: "var(--primary-green)" }} /><div><h2 className="text-xl font-bold">{t("নোটিফিকেশন", "Notifications")}</h2><p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("আপনার মতামতের উত্তর ও সাইটের বার্তা এখানে পাবেন।", "Replies to your feedback and site messages appear here.")}</p></div></div>
            <div className="mt-5 space-y-3">
              {notifications.length === 0 ? <p className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>{t("এখনও কোনো নোটিফিকেশন নেই।", "You have no notifications yet.")}</p> : notifications.map((item) => <article key={item.id} className="rounded-xl border p-4" style={{ borderColor: item.read_at ? "var(--border-color)" : "var(--primary-green)", backgroundColor: item.read_at ? "var(--background)" : "var(--primary-green-light)" }}><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold">{item.title}</h3><span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(item.created_at).toLocaleString()}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{item.message}</p>{!item.read_at && <button onClick={() => void markNotificationRead(item)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--primary-green)" }}><Check className="h-3.5 w-3.5" />{t("পড়া হয়েছে", "Mark as read")}</button>}</article>)}
            </div>
          </div>
        ) : mode === "owner" ? (
          <div className="space-y-7">
            <div className="flex items-start gap-3"><ShieldCheck className="h-7 w-7" style={{ color: "var(--primary-green)" }} /><div><h2 className="text-xl font-bold">{t("সাইট মালিক নিয়ন্ত্রণ প্যানেল", "Site owner control panel")}</h2><p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("প্রোফাইল ও ব্যবহারকারীদের পাঠানো মতামত। মালিকের ভূমিকা ডেটাবেসে নিরাপদভাবে নির্ধারিত হয়।", "Profiles and user feedback. Owner access is assigned securely in the database.")}</p></div></div>
            <section><h3 className="mb-3 font-bold">{t(`ব্যবহারকারী প্রোফাইল (${profiles.length})`, `User profiles (${profiles.length})`)}</h3><div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-color)" }}><table className="min-w-full text-left text-sm"><thead style={{ backgroundColor: "var(--background)" }}><tr><th className="p-3">{t("ব্যক্তি", "Person")}</th><th className="p-3">{t("ইমেইল", "Email")}</th><th className="p-3">{t("ভূমিকা", "Role")}</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.user_id} className="border-t" style={{ borderColor: "var(--border-color)" }}><td className="p-3"><span className="font-semibold">{profile.nickname || profile.full_name || t("নাম নেই", "No name")}</span>{profile.full_name && profile.nickname && <span className="block text-xs" style={{ color: "var(--text-muted)" }}>{profile.full_name}</span>}</td><td className="p-3">{profile.email}</td><td className="p-3 capitalize">{profile.role}</td></tr>)}</tbody></table></div></section>
            <section><h3 className="mb-3 font-bold">{t(`ব্যবহারকারীর মতামত (${feedbackItems.length})`, `User feedback (${feedbackItems.length})`)}</h3><div className="space-y-3">{feedbackItems.length === 0 ? <p className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>{t("এখনও কোনো মতামত আসেনি।", "No feedback has arrived yet.")}</p> : feedbackItems.map((item) => <article key={item.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}><div className="flex flex-wrap items-start justify-between gap-2"><div><span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.sender_email} · {new Date(item.created_at).toLocaleString()}</span><p className="mt-2 whitespace-pre-wrap text-sm">{item.message}</p></div><span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: item.status === "answered" ? "var(--primary-green-light)" : "var(--alert-red-light)", color: item.status === "answered" ? "var(--primary-green)" : "var(--alert-red)" }}>{item.status === "answered" ? t("উত্তর দেওয়া হয়েছে", "Answered") : t("নতুন", "New")}</span></div><div className="mt-3 flex flex-wrap gap-2"><a target="_blank" rel="noopener noreferrer" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(item.sender_email)}&su=${encodeURIComponent(t("Jonogon মতামতের উত্তর", "Reply to Jonogon feedback"))}&body=${encodeURIComponent(t("আপনার মতামতের জন্য ধন্যবাদ।\n\n", "Thank you for your feedback.\n\n"))}`} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border-color)" }}><Mail className="h-3.5 w-3.5" />{t("Gmail-এ উত্তর দিন", "Reply in Gmail")}</a><button onClick={() => { setActiveReplyId(activeReplyId === item.id ? null : item.id); setReplyDraft(""); }} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--primary-green)" }}><Bell className="h-3.5 w-3.5" />{t("সাইটে উত্তর দিন", "Reply in site")}</button></div>{activeReplyId === item.id && <div className="mt-3 space-y-2"><textarea rows={3} maxLength={5000} value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} className={inputClass} style={inputStyle} placeholder={t("আপনার উত্তর লিখুন…", "Write your reply…")} /><button disabled={isSaving || !replyDraft.trim()} onClick={() => void sendOwnerReply(item)} className="rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: "var(--primary-green)" }}>{isSaving ? t("পাঠানো হচ্ছে…", "Sending…") : t("নোটিফিকেশন পাঠান", "Send notification")}</button></div>}</article>)}</div></section>
          </div>
        ) : null}

        {(error && user || error && isAuthPage) && <p role="alert" className="mt-4 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--alert-red)", backgroundColor: "var(--alert-red-light)", color: "var(--alert-red)" }}>{error}</p>}
        {message && <p role="status" className="mt-4 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--primary-green)", backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>{message}</p>}
      </div>
    </section>
  );
}
