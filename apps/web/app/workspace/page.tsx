"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Code2, MessageSquare, Monitor } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Workspace = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("initialPrompt");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeView, setActiveView] = useState<"code" | "preview">("preview");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages if initialPrompt exists
  useEffect(() => {
    if (!initialPrompt) return;

    const userMessage: Message = {
      id: "0",
      role: "user",
      content: initialPrompt,
      timestamp: new Date(),
    };
    const assistantMessage: Message = {
      id: "1",
      role: "assistant",
      content: "I'll help you build that! Let me start working on it...",
      timestamp: new Date(),
    };

    setMessages([userMessage, assistantMessage]);

    setTimeout(() => {
      setGeneratedCode(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${initialPrompt}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem; }
    .container { max-width:800px; background:white; border-radius:20px; padding:3rem; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
    h1 { font-size:2.5rem; font-weight:700; color:#1a202c; margin-bottom:1rem; }
    p { font-size:1.125rem; color:#4a5568; line-height:1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${initialPrompt}</h1>
    <p>This is a starting point for your project. The AI has generated this preview based on your prompt.</p>
  </div>
</body>
</html>`);
    }, 1500);
  }, [initialPrompt]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I've updated the code based on your request. Check the preview on the right!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    },
    [input]
  );

  return (
    <div className="h-screen flex flex-col bg-[#0F0F0F] overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/5 bg-[#1A1A1A] px-6 py-3.5 flex items-center justify-between"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
          <span className="text-xs text-white/50">AI Ready</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[30%] flex flex-col border-r border-white/5 bg-[#0F0F0F]"
        >
          <div className="p-3.5 border-b border-white/5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/50" />
            <h2 className="font-medium text-sm text-white">Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                    message.role === "user"
                      ? "bg-[#2A2A2A] text-white"
                      : "bg-[#1A1A1A] text-white/90 border border-white/5"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to modify your code..."
                className="w-full px-3.5 py-2.5 pr-10 bg-[#1A1A1A] border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2A2A2A] hover:bg-[#333333] text-white/70 p-1.5 rounded-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Code Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col bg-[#0F0F0F]"
        >
          <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#0F0F0F]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveView("preview")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  activeView === "preview"
                    ? "bg-[#2A2A2A] text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <Monitor className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveView("code")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  activeView === "code"
                    ? "bg-[#2A2A2A] text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <Code2 className="w-4 h-4" />
                Code
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeView === "preview" ? (
              generatedCode ? (
                <iframe
                  srcDoc={generatedCode}
                  className="w-full h-full border-none"
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-[#0A0A0A] text-center text-white/40">
                  <Monitor className="w-7 h-7 mb-3 mx-auto" />
                  <p>No preview yet. Start chatting with AI.</p>
                </div>
              )
            ) : generatedCode ? (
              <pre className="h-full overflow-auto p-5 text-xs font-mono text-white/80">{generatedCode}</pre>
            ) : (
              <div className="h-full flex items-center justify-center bg-[#0A0A0A] text-center text-white/40">
                <Code2 className="w-7 h-7 mb-3 mx-auto" />
                <p>No code yet. Start chatting with AI.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Workspace;
