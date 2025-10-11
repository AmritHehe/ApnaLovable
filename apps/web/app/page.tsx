"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // ✅ fixed
import { ArrowRight, Plus } from "lucide-react";
import { motion } from "framer-motion"; // ✅ correct

interface Workspace {
  id: string;
  name: string;
  preview: string;
  updatedAt: string;
}

const Landing = () => {
  const router = useRouter(); // ✅ works now
  const [prompt, setPrompt] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("workspaces");
    if (stored) {
      setWorkspaces(JSON.parse(stored));
    } else {
      const mockWorkspaces: Workspace[] = [
        { id: "1", name: "E-commerce Dashboard", preview: "A modern analytics dashboard with charts", updatedAt: "2 hours ago" },
        { id: "2", name: "Portfolio Website", preview: "Personal portfolio with dark theme", updatedAt: "1 day ago" },
        { id: "3", name: "Chat Application", preview: "Real-time messaging interface", updatedAt: "3 days ago" },
      ];
      localStorage.setItem("workspaces", JSON.stringify(mockWorkspaces));
      setWorkspaces(mockWorkspaces);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (prompt.trim()) {
        router.push(`/workspace?initialPrompt=${encodeURIComponent(prompt)}`);
      }
    },
    [prompt, router]
  );

  const handleWorkspaceClick = useCallback(
    (id: string) => {
      router.push(`/workspace?workspaceId=${id}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center min-h-[70vh] text-center"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight tracking-tight">
            Build something <span className="text-white">Lovable.</span>
            {/* Hire Someone <span className="text-white">fuckable.</span> */}
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl font-normal">
            Create apps and websites by chatting with AI
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative group"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Lovable to create an internal tool that..."
                className="w-full px-6 py-5 text-base bg-[#2A2A2A] backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#3A3A3A] hover:bg-[#404040] text-white/70 p-2.5 rounded-xl transition-all duration-200"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Workspaces Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Your Workspaces</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] border border-white/10 rounded-lg text-white text-sm transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                onClick={() => handleWorkspaceClick(workspace.id)}
                className="group cursor-pointer bg-[#1A1A1A] backdrop-blur-xl border border-white/5 rounded-xl p-4 hover:bg-[#222222] hover:border-white/10 transition-all duration-200"
              >
                <div className="mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-3 flex items-center justify-center">
                    <div className="text-4xl opacity-30">📱</div>
                  </div>
                  <h3 className="text-base font-medium text-white mb-1.5">
                    {workspace.name}
                  </h3>
                  <p className="text-sm text-white/50 mb-2">{workspace.preview}</p>
                  <p className="text-xs text-white/30">Updated {workspace.updatedAt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
