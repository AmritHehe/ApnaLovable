"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Code2,
  MessageSquare,
  Monitor,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const RANDOM_RESPONSES = [
  "Great! I'm working on that for you...",
  "Let me create that component...",
  "Building your request now...",
  "Perfect! I'll generate that...",
  "Working on your changes...",
];

export default function Workspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [activeView, setActiveView] = useState<"code" | "preview">("preview");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialPromptSent, setIsInitialPromptSent] = useState(false);
  const [sandboxId, setSandboxId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // guard ref to prevent double-run in Strict Mode / re-renders
  const consumedInitialRef = useRef(false);

  // helper: extract sandbox id safely
  const extractSandboxId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/https?:\/\/\d+-([a-z0-9]+)\.e2b\.app/i);
    return match && match[1] ? match[1] : null;
  };

  // restore persisted sandbox/preview on mount (prevents lost id on refresh)
  useEffect(() => {
    try {
      const savedSandbox = localStorage.getItem("sandboxId");
      const savedPreview = localStorage.getItem("previewUrl");
      if (savedSandbox) setSandboxId(savedSandbox);
      if (savedPreview) setPreviewUrl(savedPreview);
    } catch (err) {
      // ignore localStorage errors
      console.warn("localStorage restore failed", err);
    }
  }, []);

  // auto scroll chat to bottom
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // consume initialPrompt once and remove query param to avoid re-trigger on refresh
  useEffect(() => {
    const initialPrompt = searchParams.get("initialPrompt");
    if (!initialPrompt) return;

    // if already consumed (StrictMode or re-render), don't call again
    if (consumedInitialRef.current) {
      // but still remove param to prevent future triggers
      router.replace("/workspace");
      return;
    }

    consumedInitialRef.current = true;
    (async () => {
      // show the user's initial message in chat
      const userMessage: Message = {
        id: "0",
        role: "user",
        content: initialPrompt,
        timestamp: new Date(),
      };
      setMessages([userMessage]);

      await sendPromptToBackend(initialPrompt, true);
      setIsInitialPromptSent(true);
      // remove query so refresh doesn't resend the prompt
      router.replace("/workspace");
    })();
  }, [searchParams, router]);

  // utility: wait for sandboxId to be available with a short timeout
  const waitForSandboxId = async (timeout = 5000, interval = 200): Promise<string | null> => {
    const start = Date.now();
    // first check current state or localStorage
    if (sandboxId) return sandboxId;
    const fromStorage = localStorage.getItem("sandboxId");
    if (fromStorage) {
      setSandboxId(fromStorage);
      return fromStorage;
    }
    // poll
    return new Promise((resolve) => {
      const iv = setInterval(() => {
        const now = Date.now();
        const stored = localStorage.getItem("sandboxId");
        if (stored) {
          clearInterval(iv);
          setSandboxId(stored);
          resolve(stored);
        } else if (now - start > timeout) {
          clearInterval(iv);
          resolve(null);
        }
      }, interval);
    });
  };

  // core: send prompt to backend. isInitial = POST, otherwise PUT
  const sendPromptToBackend = async (userPrompt: string, isInitial = false) => {
    setIsLoading(true);

    try {
      const API_URL = "http://localhost:3001/prompt";
      // push an assistant 'thinking' message
      const randomResponse =
        RANDOM_RESPONSES[Math.floor(Math.random() * RANDOM_RESPONSES.length)] ?? "Working on that...";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: randomResponse,
          timestamp: new Date(),
        },
      ]);

      // If not initial, ensure sandboxId present
      let usedSandboxId: string | null = null;
      if (!isInitial) {
        usedSandboxId = await waitForSandboxId(5000, 200);
        if (!usedSandboxId) {
          // Failed to find sandboxId — show message and abort
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content:
                "Cannot update sandbox: sandbox ID not available yet. Try again in a moment or reload the page.",
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
          return;
        }
      }

      const body = isInitial ? { prompt: userPrompt } : { prompt: userPrompt, sandboxID: usedSandboxId };

      console.log("Sending to backend:", { method: isInitial ? "POST" : "PUT", body });

      const res = await fetch(API_URL, {
        method: isInitial ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // include server response text if available for debugging
        const text = await res.text().catch(() => "");
        throw new Error(`Backend error ${res.status} ${res.statusText} ${text}`);
      }

      const data = await res.json(); // backend returns plain URL string (e.g. "https://5173-iXXXX.e2b.app/")

      if (typeof data === "string" && data.startsWith("http")) {
        // set preview and persist sandbox id
        setPreviewUrl(data);
        try {
          localStorage.setItem("previewUrl", data);
        } catch {}

        const id = extractSandboxId(data);
        if (id) {
          setSandboxId(id);
          try {
            localStorage.setItem("sandboxId", id);
          } catch {}
          console.log("Persisted sandboxId:", id);
        } else {
          console.warn("Could not extract sandbox id from:", data);
        }
      } else {
        // if backend changed and returns object, adapt here (optional)
        console.warn("Unexpected backend response (expected string URL):", data);
      }
    } catch (err) {
      console.error("sendPromptToBackend error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // handle user submit (normal chat submit)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const text = input;
    setInput("");

    // call backend: if no sandboxId yet this will wait (via waitForSandboxId) and abort if not found
    await sendPromptToBackend(text, false);
  };

  // iframe refresh without reloading the page
  const handleRefreshPreview = () => {
    if (!iframeRef.current) return;
    const src = iframeRef.current.src;
    // force reload
    iframeRef.current.src = src;
  };

  return (
    <div className="h-screen flex flex-col bg-[#0F0F0F] overflow-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-white/5 bg-[#1A1A1A] px-6 py-3.5 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-white/50">E2B Ready</span>
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-[30%] flex flex-col border-r border-white/5 bg-[#0F0F0F]">
          <div className="p-3.5 border-b border-white/5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/50" />
            <h2 className="font-medium text-sm text-white">Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${m.role === "user" ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-white border border-orange-500/30" : "bg-[#1A1A1A] text-white/90 border border-white/5"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && <div className="flex"><div className="bg-[#1A1A1A] text-white/90 border border-white/5 rounded-xl px-3.5 py-2.5 flex gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" /><div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-100" /><div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200" /></div></div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5">
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe what you want to build..." disabled={isLoading} className="w-full px-3.5 py-2.5 pr-10 bg-[#1A1A1A] border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition-all disabled:opacity-50" />
              <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white p-1.5 rounded-md transition-all disabled:opacity-50"><Send className="w-3.5 h-3.5" /></button>
            </div>
          </form>
        </motion.div>

        {/* Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col bg-[#0F0F0F]">
          <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#0F0F0F]">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveView("preview")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${activeView === "preview" ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-white border border-orange-500/30" : "text-white/50 hover:text-white/70"}`}><Monitor className="w-4 h-4" />Preview</button>
              <button onClick={() => setActiveView("code")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${activeView === "code" ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-white border border-orange-500/30" : "text-white/50 hover:text-white/70"}`}><Code2 className="w-4 h-4" />Code</button>
            </div>

            {previewUrl && activeView === "preview" && <button onClick={handleRefreshPreview} className="flex items-center gap-1 text-white/70 hover:text-white text-sm"><RefreshCw className="w-4 h-4" />Refresh</button>}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeView === "preview" ? (
              previewUrl ? (
                <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-none bg-white" title="E2B Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" />
              ) : (
                <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-orange-500/30"><Monitor className="w-7 h-7 text-orange-400" /></div>
                    <h3 className="text-base font-medium mb-1 text-white">No preview yet</h3>
                    <p className="text-sm text-white/40">Start chatting to generate your app</p>
                  </div>
                </div>
              )
            ) : previewUrl ? (
              <div className="h-full overflow-auto bg-[#0A0A0A] p-5 text-white/90 font-mono text-sm">
                <p className="mb-2 text-white/60">E2B Sandbox URL:</p>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline break-all">{previewUrl}</a>
                <p className="mt-4 text-white/40 text-xs">Note: Access E2B filesystem using the preview link above</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-orange-500/30"><Code2 className="w-7 h-7 text-orange-400" /></div>
                  <h3 className="text-base font-medium mb-1 text-white">No code yet</h3>
                  <p className="text-sm text-white/40">Start chatting to generate your code</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
