"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Language = "bn" | "en";
type SpeechResult = { length: number; [index: number]: { transcript: string } };
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechResult> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const message = (lang: Language, bn: string, en: string) => lang === "bn" ? bn : en;

export function useCitizenVoiceInput(language: Language, onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [notice, setNotice] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const discardRecordingRef = useRef(false);
  const generationRef = useRef(0);
  const languageRef = useRef(language);
  const transcriptCallbackRef = useRef(onTranscript);

  useEffect(() => {
    languageRef.current = language;
    transcriptCallbackRef.current = onTranscript;
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition.stop();
      setIsRecording(false);
      return;
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const cancel = useCallback(() => {
    generationRef.current += 1;
    startingRef.current = false;
    discardRecordingRef.current = true;
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    }
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder?.state === "recording") recorder.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsRecording(false);
  }, []);

  const startBrowserSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as SpeechRecognitionWindow).SpeechRecognition ?? (window as SpeechRecognitionWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice(message(languageRef.current, "এই ডিভাইসে মাইক্রোফোন রেকর্ডিং সমর্থিত নয়।", "This device does not support microphone recording."));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = languageRef.current === "bn" ? "bn-BD" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    let transcript = "";
    recognition.onresult = (event) => {
      transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ").trim();
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setNotice(message(languageRef.current, "মাইক্রোফোনের অনুমতি দিন এবং HTTPS-এ আবার চেষ্টা করুন।", "Allow microphone access and try again over HTTPS."));
      } else if (event.error === "audio-capture") {
        setNotice(message(languageRef.current, "কোনো মাইক্রোফোন পাওয়া যায়নি।", "No microphone was found."));
      } else if (event.error === "no-speech") {
        setNotice(message(languageRef.current, "কোনো কথা ধরা যায়নি। আবার বলুন।", "No speech was detected. Please try again."));
      } else if (event.error !== "aborted") {
        setNotice(message(languageRef.current, "ভয়েস ইনপুটে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Voice input failed. Please try again."));
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setIsRecording(false);
      if (transcript) {
        transcriptCallbackRef.current(transcript);
        setNotice(message(languageRef.current, "কথা লিখে দেওয়া হয়েছে। পাঠানোর আগে দেখে নিন।", "Speech added. Review it before sending."));
      } else {
        setNotice(message(languageRef.current, "কোনো কথা ধরা যায়নি। আবার বলুন।", "No speech was detected. Please try again."));
      }
    };
    try {
      recognitionRef.current = recognition;
      setIsRecording(true);
      setNotice(message(languageRef.current, "শুনছি... কথা বলুন...", "Listening... speak now..."));
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsRecording(false);
      setNotice(message(languageRef.current, "মাইক্রোফোন চালু করা যায়নি। অনুমতি পরীক্ষা করুন।", "Could not start the microphone. Check its permission."));
    }
  }, []);

  const transcribeRecording = useCallback(async (audio: Blob) => {
    if (!audio.size) {
      setNotice(message(languageRef.current, "কোনো কথা রেকর্ড হয়নি। আবার চেষ্টা করুন।", "No audio was recorded. Please try again."));
      return;
    }
    setIsTranscribing(true);
    setNotice(message(languageRef.current, "কথা লিখে নেওয়া হচ্ছে...", "Transcribing your speech..."));
    const formData = new FormData();
    const extension = audio.type.includes("mp4") ? "mp4" : audio.type.includes("ogg") ? "ogg" : "webm";
    formData.append("file", audio, `citizen-question.${extension}`);
    try {
      const response = await fetch("/api/citizen-transcribe", { method: "POST", body: formData, cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as { text?: string; code?: string };
      if (!response.ok || !payload.text?.trim()) {
        if (payload.code === "provider_key_invalid") throw new Error(message(languageRef.current, "Gemini key বা AI Studio project অনুমোদিত নয়। সাইট মালিককে সেটিং পরীক্ষা করতে হবে।", "The Gemini key or AI Studio project is not authorized. The site owner needs to check its setup."));
        if (payload.code === "free_quota_exceeded") throw new Error(message(languageRef.current, "Gemini-এর বিনামূল্যের দৈনিক সীমা পূর্ণ হয়েছে। রাত ১২টায় Pacific সময়ে আবার চেষ্টা করুন।", "The Gemini free daily quota has been reached. Please try again after midnight Pacific time."));
        if (payload.code === "rate_limited" || payload.code === "provider_rate_limited") throw new Error(message(languageRef.current, "অনেক অনুরোধ এসেছে। একটু পরে আবার চেষ্টা করুন।", "Too many requests. Please try again shortly."));
        if (payload.code === "not_configured") throw new Error(message(languageRef.current, "বিনামূল্যের Gemini সেবা এখনো সেট করা হয়নি।", "The free Gemini service is not configured yet."));
        if (payload.code === "unsupported_audio") throw new Error(message(languageRef.current, "এই রেকর্ডিং ফরম্যাট সমর্থিত নয়। আবার রেকর্ড করুন।", "This recording format is not supported. Please record again."));
        if (payload.code === "audio_too_large") throw new Error(message(languageRef.current, "রেকর্ডিংটি অনেক বড়। ৪৫ সেকেন্ডের মধ্যে বলুন।", "The recording is too large. Please keep it under 45 seconds."));
        throw new Error(message(languageRef.current, "কথা বোঝা যায়নি। একটু পরে আবার চেষ্টা করুন।", "Could not transcribe the audio. Please try again."));
      }
      transcriptCallbackRef.current(payload.text.trim());
      setNotice(message(languageRef.current, "কথা লিখে দেওয়া হয়েছে। পাঠানোর আগে দেখে নিন।", "Speech added. Review it before sending."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : message(languageRef.current, "ভয়েস ইনপুটে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Voice input failed. Please try again."));
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isTranscribing || startingRef.current) return;
    if (recorderRef.current?.state === "recording" || recognitionRef.current) {
      stopRecording();
      return;
    }
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      startBrowserSpeechRecognition();
      return;
    }
    startingRef.current = true;
    const generation = generationRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (generation !== generationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const preferredMimeType = typeof MediaRecorder.isTypeSupported === "function"
        ? ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type))
        : undefined;
      const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      discardRecordingRef.current = false;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => setNotice(message(languageRef.current, "রেকর্ডিংয়ে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Recording failed. Please try again."));
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        recorderRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
        if (discardRecordingRef.current) return;
        setIsRecording(false);
        void transcribeRecording(audio);
      };
      recorder.start();
      setIsRecording(true);
      setNotice(message(languageRef.current, "শুনছি... শেষ হলে মাইক্রোফোনে আবার চাপ দিন।", "Listening... tap the microphone again when finished."));
      stopTimerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 45_000);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setNotice(message(languageRef.current, "মাইক্রোফোনের অনুমতি দিন এবং HTTPS-এ আবার চেষ্টা করুন।", "Allow microphone access and try again over HTTPS."));
      } else if (error instanceof DOMException && error.name === "NotFoundError") {
        setNotice(message(languageRef.current, "কোনো মাইক্রোফোন পাওয়া যায়নি।", "No microphone was found."));
      } else {
        setNotice(message(languageRef.current, "মাইক্রোফোন চালু করা যায়নি। অনুমতি পরীক্ষা করুন।", "Could not start the microphone. Check its permission."));
      }
    } finally {
      startingRef.current = false;
    }
  }, [isTranscribing, startBrowserSpeechRecognition, stopRecording, transcribeRecording]);

  useEffect(() => () => {
    generationRef.current += 1;
    discardRecordingRef.current = true;
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return { isRecording, isTranscribing, notice, setNotice, toggle, stop: stopRecording, cancel };
}
