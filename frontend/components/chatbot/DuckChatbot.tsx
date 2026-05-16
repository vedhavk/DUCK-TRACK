"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "./types";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { getToken } from "@/lib/api";
import { usePathname } from "next/navigation";

export default function DuckChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

    // If token exists, chatbot is active
    // Alternatively, if the token state changes dynamically, we need to listen or just rely on pathname
  }, [pathname]);

  // Determine if chatbot should be rendered
  const isExcludedPage = pathname === "/" || pathname.includes("/login") || pathname.includes("/signup");
  
  if (!isAuthenticated || isExcludedPage) {
    return null;
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
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
            ${isMinimized ? 'w-[300px] h-[60px]' : 'w-[350px] h-[450px]'}
          `}
        >
          {/* Header */}
          <div className="bg-yellow-400 dark:bg-yellow-500 p-3 px-4 flex items-center justify-between text-slate-900 shrink-0">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-xl">🦆</span>
              <span className="text-sm">Duck Health Assistant</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="p-1 hover:bg-yellow-500/50 rounded-md transition"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 hover:bg-yellow-500/50 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Hidden if minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
                <ChatWindow messages={messages} isLoading={isLoading} />
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="w-14 h-14 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
          aria-label="Open Duck Health Assistant"
        >
          🦆
        </button>
      )}
    </div>
  );
}
