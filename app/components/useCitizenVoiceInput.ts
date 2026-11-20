"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Language = "bn" | "en";
type AudioContextWindow = Window & { webkitAudioContext?: typeof AudioContext };

const message = (lang: Language, bn: string, en: string) => lang === "bn" ? bn : en;
const maxRecordingMs = 45_000;
const targetSampleRate = 16_000;

function createWavBlob(chunks: Float32Array[], inputSampleRate: number) {
  const targetRate = Math.min(targetSampleRate, inputSampleRate);
  const inputLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const input = new Float32Array(inputLength);
  let offset = 0;
  for (const chunk of chunks) {
    input.set(chunk, offset);
    offset += chunk.length;
  }

  const ratio = inputSampleRate / targetRate;
  const outputLength = Math.floor(inputLength / ratio);
  const dataLength = outputLength * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const writeText = (position: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(position + index, value.charCodeAt(index));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, dataLength, true);

  for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
    const start = Math.floor(outputIndex * ratio);
    const end = Math.min(inputLength, Math.floor((outputIndex + 1) * ratio));
    let total = 0;
    for (let inputIndex = start; inputIndex < end; inputIndex += 1) total += input[inputIndex];
    const sample = Math.max(-1, Math.min(1, total / Math.max(1, end - start)));
    view.setInt16(44 + outputIndex * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function useCitizenVoiceInput(language: Language, onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [notice, setNotice] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);
  const audioSampleRateRef = useRef(targetSampleRate);
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

  const transcribeRecording = useCallback(async (audio: Blob) => {
    if (!audio.size) {
      setNotice(message(languageRef.current, "কোনো কথা রেকর্ড হয়নি। আবার চেষ্টা করুন।", "No audio was recorded. Please try again."));
      return;
    }
    setIsTranscribing(true);
    setNotice(message(languageRef.current, "কথা লিখে নেওয়া হচ্ছে...", "Transcribing your speech..."));
    const formData = new FormData();
    const extension = audio.type.includes("wav") ? "wav"
      : audio.type.includes("mp4") ? "mp4"
        : audio.type.includes("ogg") ? "ogg"
          : audio.type.includes("mpeg") || audio.type.includes("mp3") ? "mp3" : "webm";
    formData.append("file", audio, `citizen-question.${extension}`);
    try {
      const response = await fetch("/api/citizen-transcribe", { method: "POST", body: formData, cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as { text?: string; code?: string };
      if (!response.ok || !payload.text?.trim()) {
        if (payload.code === "provider_key_invalid") throw new Error(message(languageRef.current, "Cloudflare API token বা account ID সঠিক নয়। সাইট মালিককে সেটিং পরীক্ষা করতে হবে।", "The Cloudflare API token or account ID is not valid. The site owner needs to check its setup."));
        if (payload.code === "provider_access_denied") throw new Error(message(languageRef.current, "Cloudflare Workers AI access অনুমোদিত নয়। Workers AI permissions ও plan পরীক্ষা করুন।", "Cloudflare Workers AI access was denied. Check Workers AI permissions and plan access."));
        if (payload.code === "free_quota_exceeded") throw new Error(message(languageRef.current, "Cloudflare-এর দৈনিক বিনামূল্যের AI সীমা পূর্ণ হয়েছে। UTC রাত ১২টার পর আবার চেষ্টা করুন।", "Cloudflare's daily free AI allowance has been reached. Please try again after 00:00 UTC."));
        if (payload.code === "rate_limited" || payload.code === "provider_rate_limited") throw new Error(message(languageRef.current, "অনেক অনুরোধ এসেছে। একটু পরে আবার চেষ্টা করুন।", "Too many requests. Please try again shortly."));
        if (payload.code === "not_configured") throw new Error(message(languageRef.current, "Cloudflare Workers AI এখনো সেট করা হয়নি।", "Cloudflare Workers AI is not configured yet."));
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

  const clearStopTimer = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  const finishWebAudioRecording = useCallback(() => {
    clearStopTimer();
    const processor = audioProcessorRef.current;
    if (!processor) return;

    processor.onaudioprocess = null;
    processor.disconnect();
    audioSourceRef.current?.disconnect();
    silentGainRef.current?.disconnect();
    audioProcessorRef.current = null;
    audioSourceRef.current = null;
    silentGainRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => undefined);

    const stream = streamRef.current;
    streamRef.current = null;
    stream?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    const chunks = audioBuffersRef.current;
    audioBuffersRef.current = [];
    if (discardRecordingRef.current) return;

    const audio = createWavBlob(chunks, audioSampleRateRef.current);
    void transcribeRecording(audio);
  }, [clearStopTimer, transcribeRecording]);

  const stopRecording = useCallback(() => {
    clearStopTimer();
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }
    if (audioProcessorRef.current) finishWebAudioRecording();
  }, [clearStopTimer, finishWebAudioRecording]);

  const scheduleRecordingLimit = useCallback(() => {
    clearStopTimer();
    stopTimerRef.current = window.setTimeout(() => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      else if (audioProcessorRef.current) finishWebAudioRecording();
    }, maxRecordingMs);
  }, [clearStopTimer, finishWebAudioRecording]);

  const startWebAudioRecording = useCallback(async (stream: MediaStream, generation: number) => {
    const AudioContextConstructor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
    if (!AudioContextConstructor) return false;

    const context = new AudioContextConstructor();
    try {
      await context.resume();
      if (generation !== generationRef.current) {
        await context.close();
        return false;
      }

      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      audioBuffersRef.current = [];
      audioSampleRateRef.current = context.sampleRate;
      processor.onaudioprocess = (event) => {
        const channel = event.inputBuffer.getChannelData(0);
        audioBuffersRef.current.push(new Float32Array(channel));
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(context.destination);
      audioContextRef.current = context;
      audioSourceRef.current = source;
      audioProcessorRef.current = processor;
      silentGainRef.current = silentGain;
      setIsRecording(true);
      setNotice(message(languageRef.current, "বাংলা বা ইংরেজিতে বলুন; শেষ হলে মাইক চাপুন।", "Speak in Bangla or English, then tap the mic to finish."));
      scheduleRecordingLimit();
      return true;
    } catch {
      if (context.state !== "closed") await context.close().catch(() => undefined);
      return false;
    }
  }, [scheduleRecordingLimit]);

  const cancel = useCallback(() => {
    generationRef.current += 1;
    startingRef.current = false;
    discardRecordingRef.current = true;
    clearStopTimer();
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder?.state === "recording") recorder.stop();

    const processor = audioProcessorRef.current;
    if (processor) {
      processor.onaudioprocess = null;
      processor.disconnect();
    }
    audioSourceRef.current?.disconnect();
    silentGainRef.current?.disconnect();
    audioProcessorRef.current = null;
    audioSourceRef.current = null;
    silentGainRef.current = null;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => undefined);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    chunksRef.current = [];
    audioBuffersRef.current = [];
    setIsRecording(false);
  }, [clearStopTimer]);

  const toggle = useCallback(async () => {
    if (isTranscribing || startingRef.current) return;
    if (recorderRef.current?.state === "recording" || audioProcessorRef.current) {
      stopRecording();
      return;
    }

    if (typeof window === "undefined" || !window.isSecureContext) {
      setNotice(message(languageRef.current, "মাইক্রোফোনের জন্য HTTPS-এ সাইট খুলে অনুমতি দিন।", "Microphone access requires HTTPS and permission from your browser."));
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice(message(languageRef.current, "এই ব্রাউজারে অডিও রেকর্ডিং নেই। আপডেট করা Chrome বা Safari ব্যবহার করুন।", "Audio recording is unavailable in this browser. Please use an up-to-date Chrome or Safari."));
      return;
    }

    startingRef.current = true;
    const generation = generationRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== generationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      discardRecordingRef.current = false;

      if (typeof MediaRecorder !== "undefined") {
        try {
          const preferredMimeType = typeof MediaRecorder.isTypeSupported === "function"
            ? ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type))
            : undefined;
          const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
          const recordingGeneration = generationRef.current;
          chunksRef.current = [];
          recorderRef.current = recorder;
          recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
          recorder.onerror = () => setNotice(message(languageRef.current, "রেকর্ডিংয়ে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Recording failed. Please try again."));
          recorder.onstop = () => {
            const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
            chunksRef.current = [];
            if (recorderRef.current === recorder) recorderRef.current = null;
            stream.getTracks().forEach((track) => track.stop());
            if (streamRef.current === stream) streamRef.current = null;
            setIsRecording(false);
            if (!discardRecordingRef.current && recordingGeneration === generationRef.current) void transcribeRecording(audio);
          };
          recorder.start();
          setIsRecording(true);
          setNotice(message(languageRef.current, "বাংলা বা ইংরেজিতে বলুন; শেষ হলে মাইক চাপুন।", "Speak in Bangla or English, then tap the mic to finish."));
          scheduleRecordingLimit();
          return;
        } catch {
          recorderRef.current = null;
        }
      }

      if (await startWebAudioRecording(stream, generation)) return;
      stream.getTracks().forEach((track) => track.stop());
      if (streamRef.current === stream) streamRef.current = null;
      setNotice(message(languageRef.current, "এই ব্রাউজারে অডিও রেকর্ডিং চালু হয়নি। Chrome বা Safari আপডেট করে আবার চেষ্টা করুন।", "This browser could not start audio recording. Update Chrome or Safari and try again."));
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const errorName = error instanceof Error ? error.name : "";
      if (errorName === "NotAllowedError" || errorName === "SecurityError") {
        setNotice(message(languageRef.current, "এই সাইটের মাইক্রোফোন অনুমতি দিন এবং HTTPS-এ আবার চেষ্টা করুন।", "Allow microphone access for this site and try again over HTTPS."));
      } else if (errorName === "NotFoundError") {
        setNotice(message(languageRef.current, "কোনো মাইক্রোফোন পাওয়া যায়নি।", "No microphone was found."));
      } else if (errorName === "NotReadableError" || errorName === "AbortError") {
        setNotice(message(languageRef.current, "মাইক্রোফোন অন্য অ্যাপে ব্যবহৃত হতে পারে। সেটি বন্ধ করে আবার চেষ্টা করুন।", "The microphone may be in use by another app. Close it and try again."));
      } else {
        setNotice(message(languageRef.current, "মাইক্রোফোন চালু করা যায়নি। অনুমতি ও ব্রাউজার সেটিং পরীক্ষা করুন।", "Could not start the microphone. Check browser permissions and settings."));
      }
    } finally {
      startingRef.current = false;
    }
  }, [isTranscribing, scheduleRecordingLimit, startWebAudioRecording, stopRecording, transcribeRecording]);

  useEffect(() => () => {
    generationRef.current += 1;
    discardRecordingRef.current = true;
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    if (audioProcessorRef.current) {
      audioProcessorRef.current.onaudioprocess = null;
      audioProcessorRef.current.disconnect();
    }
    audioSourceRef.current?.disconnect();
    silentGainRef.current?.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close().catch(() => undefined);
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return { isRecording, isTranscribing, notice, setNotice, toggle, stop: stopRecording, cancel };
}
