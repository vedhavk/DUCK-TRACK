"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "./types";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { getToken } from "@/lib/api";
import { usePathname } from "next/navigation";

const ChatbotIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img
    src="/chatbot-icon.png"
    alt="Duck Mascot"
    className={`${className} object-contain rounded-full bg-yellow-100 p-0.5 border border-emerald-500/20`}
  />
);

export default function DuckChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Hello! I am the DuckTrack Health Assistant. Ask me anything about Avian Influenza in ducks!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status and visibility rules
  useEffect(() => {
    // Basic auth check
    const token = getToken();
    setIsAuthenticated(!!token);
  }, [pathname]);

  // Determine if chatbot should be rendered
  const isExcludedPage = pathname === "/" || pathname.includes("/login") || pathname.includes("/signup");
  
  if (!isAuthenticated || isExcludedPage) {
    return null;
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    // Send previous messages as history context (excluding the new unsent userMsg)
    const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
    
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          message: text,
          history: historyPayload
        })
      });
      
      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.response || "Sorry, I could not process that request."
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Sorry, I am currently unable to connect to the server."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all origin-bottom-right duration-300 mb-4
            ${isExpanded ? 'w-[45vw] h-[70vh] min-w-[320px] min-h-[400px]' : 'w-[350px] h-[450px]'}
          `}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 p-3 px-4 flex items-center justify-between text-white shrink-0 select-none shadow-md">
            <div className="flex items-center gap-2.5 font-bold">
              <ChatbotIcon className="w-7 h-7" />
              <div className="flex flex-col">
                <span className="text-sm leading-tight">Duck Health AI</span>
                <span className="text-[10px] text-emerald-100/80 font-normal">Active Assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-base p-1 hover:bg-white/15 rounded-md transition duration-150 flex items-center justify-center w-8 h-8"
                title={isExpanded ? "Shrink Chat" : "Expand Chat"}
              >
                🔲
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }} 
                className="text-lg font-bold p-1 hover:bg-white/15 rounded-md transition duration-150 flex items-center justify-center w-8 h-8"
                title="Close Chat"
              >
                ✖
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
            <ChatWindow messages={messages} isLoading={isLoading} />
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsExpanded(false);
          }}
          className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-110 transition-all duration-300 flex items-center justify-center text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/30 group"
          aria-label="Open Duck Health Assistant"
        >
          <ChatbotIcon className="w-10 h-10 transition-transform duration-300 group-hover:rotate-6" />
        </button>
      )}
    </div>
  );
}
