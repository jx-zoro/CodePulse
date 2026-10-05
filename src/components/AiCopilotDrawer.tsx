"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2, Sparkles, AlertTriangle, Activity, HeartPulse, Search, Code, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { usePerformanceStore } from "@/lib/store/usePerformanceStore";
import { useRegressionStore } from "@/lib/store/useRegressionStore";
import { APIHealthEngine } from "@/lib/core/APIHealthEngine";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { label: "Summarize API Health", icon: HeartPulse, prompt: "Summarize my overall API health based on my execution history." },
  { label: "Find Security Problems", icon: ShieldCheck, prompt: "Find possible security problems in my recent requests." },
  { label: "Investigate Regressions", icon: AlertTriangle, prompt: "Investigate active API regressions and tell me what is degrading." },
  { label: "Analyze Last Error", icon: Search, prompt: "Explain the last failed request (4xx or 5xx) and suggest a fix." },
  { label: "Generate Tests", icon: Code, prompt: "Generate validation tests for my most recently tested endpoint." },
];

export function AiCopilotDrawer({ isOpen, onClose, initialContext }: { isOpen: boolean, onClose: () => void, initialContext?: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hello! I am your CodePulse API Copilot. I have full context of your API health, performance baselines, execution history, and active regressions. How can I help you investigate or engineer your API today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Execute initial prompt if provided (e.g. from Regression Investigate click)
  useEffect(() => {
    if (isOpen && typeof initialContext === 'string' && messages.length === 1) {
      handleSend(initialContext);
    }
  }, [isOpen, initialContext]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      // Build massive intelligent context snapshot
      const history = useHistoryStore.getState().tests || [];
      const performance = usePerformanceStore.getState().baselines || [];
      const regressions = useRegressionStore.getState().alerts?.filter(a => a.status === "OPEN") || [];
      const testCases = useTestEngineStore.getState().testCases || [];
      
      const healthReport = APIHealthEngine.calculateHealth(history, performance, testCases);
      
      const activeContext = {
        platformState: {
          totalExecutions: history.length,
          activeRegressionsCount: regressions.length,
          apiHealthScore: healthReport.hasInsufficientData ? "Insufficient Data" : healthReport.overallScore,
        },
        healthBreakdown: healthReport,
        activeRegressions: regressions,
        recentErrors: history.filter((t: any) => !t.response || t.response.status >= 400).slice(0, 5),
        lastRequest: history.length > 0 ? history[history.length - 1] : null,
        explicitContext: typeof initialContext !== 'string' ? initialContext : undefined
      };

      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: text, 
          context: activeContext,
          systemInstruction: "You are CodePulse Copilot, an expert API Engineering Assistant. You have deep access to the user's workspace context (Health, Regressions, History, Performance). ALWAYS mention specific data points (e.g., 'Your P95 latency is 1.2s') when answering. If asked to generate tests, output them in JavaScript/Postman syntax. Keep answers concise, highly technical, and actionable. Do not hallucinate metrics—if data is missing, say so."
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
          
          for (const line of lines) {
            const data = line.replace("data: ", "");
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + parsed.text } : m));
              }
            } catch (e) {}
          }
        }
      }
    } catch (error: any) {
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error.message.includes("AI Provider is not configured")) {
        errorMessage = "CodePulse Copilot is currently offline. To enable AI analysis, please configure an AI provider in your environment variables (e.g., set `AI_API_KEY` for OpenAI).";
      } else if (error.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.message) errorMessage = parsed.message;
        } catch(e) {
          errorMessage = error.message;
        }
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `**Configuration Required:**\n\n${errorMessage}` } : m));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] lg:w-[500px] bg-background border-l shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Sparkles className="h-5 w-5" />
          CodePulse Copilot
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-muted/10">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {msg.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                msg.role === "assistant" 
                  ? "bg-card border shadow-sm text-foreground whitespace-pre-wrap" 
                  : "bg-primary text-primary-foreground whitespace-pre-wrap"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <div className="p-4 bg-card border-t">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((sug, i) => (
              <button 
                key={i}
                onClick={() => handleSend(sug.prompt)}
                className="text-[11px] font-medium flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-full transition-colors border shadow-sm"
              >
                <sug.icon className="h-3 w-3" />
                {sug.label}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask Copilot to analyze regressions, health, or history..."
            className="w-full bg-muted/50 border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1.5 h-8 w-8 rounded-full"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
