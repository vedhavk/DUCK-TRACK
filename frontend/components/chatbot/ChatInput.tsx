"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all flex items-center pr-1 overflow-hidden shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Avian Influenza in ducks..."
          className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="icon"
          className="rounded-full w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm disabled:opacity-50 disabled:hover:bg-emerald-600"
        >
          <SendHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
