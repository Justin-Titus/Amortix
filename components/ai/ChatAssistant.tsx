"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { Bot, Send, User, MessageSquarePlus, Copy, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type MessagePart = {
  type?: string;
  text?: string;
};

type DisplayMessage = {
  id: string;
  role: string;
  content?: string;
  parts?: MessagePart[];
};

function getMessageText(message: DisplayMessage) {
  if (typeof message.content === "string" && message.content.length > 0) {
    return message.content;
  }

  return message.parts
    ?.filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text ?? "")
    .join("") ?? "";
}

export default function ChatAssistant({ initialInput }: { initialInput?: string }) {
  const [input, setInput] = useState(() => (typeof initialInput === "string" ? initialInput.trim() : ""));
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/chat" }),
    []
  );
  const { messages, setMessages, status, stop, sendMessage } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setInput(e.target.value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedMessageId(null);
        copyTimeoutRef.current = null;
      }, 1500);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="glass-panel flex max-h-[calc(100vh)] flex-col overflow-hidden">
      <div className="dark-panel rounded-none border-x-0 border-t-0 px-6 py-4 shadow-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-medium text-white">Amortix AI</h2>
              <p className="flex items-center gap-1.5 text-xs text-white/65">
                <span className="h-2 w-2 rounded-full bg-amortix-emerald-light animate-pulse"></span>
                Online and analyzing your finances
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Start a new chat?")) {
                  setMessages([]);
                }
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/15 hover:text-white"
              title="New Chat"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center space-y-5 pt-8 text-center text-amortix-slate">
            <div className="mb-2 flex h-18 w-18 items-center justify-center rounded-full bg-white shadow-sm">
              <Bot className="h-8 w-8 text-amortix-slate" />
            </div>
            <h3 className="mt-2 text-2xl font-heading font-medium text-amortix-navy">How can I help you today?</h3>
            <p className="text-sm leading-7">
              I can analyze your current loans, explain repayment strategies, or help you figure out exactly how much you can save.
            </p>
            <div className="grid w-full grid-cols-1 gap-3 pt-4">
              <button onClick={() => {
                const prompt = "Which repayment strategy is best for my current loans?";
                sendMessage({ text: prompt });
              }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">
                &ldquo;Which repayment strategy is best for my current loans?&rdquo;
              </button>
              <button onClick={() => {
                const prompt = "How much interest will I save if I pay an extra ₹5000 per month?";
                sendMessage({ text: prompt });
              }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">
                &ldquo;How much interest will I save if I pay an extra ₹5000 per month?&rdquo;
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const textContent = getMessageText(message as DisplayMessage);
            return (
              <div
                key={message.id}
                className={`group relative flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${message.role === "user"
                    ? "bg-white text-amortix-navy shadow-sm"
                    : "bg-amortix-navy text-white shadow-[0_12px_20px_rgba(13,27,47,0.12)]"
                  }`}>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-[22px] px-5 py-4 text-sm ${message.role === "user"
                      ? "bg-amortix-navy text-white shadow-[0_18px_28px_rgba(13,27,47,0.16)]"
                      : "border border-white/70 bg-white/85 text-amortix-slate shadow-sm prose prose-sm max-w-none"
                    }`}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap">{textContent}</p>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => copyMessage(message.id, textContent)}
                        className="absolute right-0 top-0 translate-x-2 -translate-y-2 rounded-full border border-white/80 bg-white p-2 text-amortix-slate opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:text-amortix-navy"
                        aria-label="Copy assistant response"
                        title="Copy response"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3.5 w-3.5 text-amortix-emerald" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <ReactMarkdown>{textContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-4 flex-row">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amortix-navy text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-[22px] border border-white/70 bg-white/85 px-5 py-4 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1 lg:h-4" />
      </div>

      <div className="border-t border-white/70 bg-white/58 p-4 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 rounded-[22px] border border-white/80 bg-white/85 p-2 shadow-sm transition-all focus-within:border-amortix-emerald focus-within:ring-2 focus-within:ring-amortix-emerald/15"
        >
          <textarea
            onFocus={(e) => {
              e.currentTarget.style.outline = "0";
            }}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your finances..."
            className="scrollbar-hide min-h-11 max-h-32 flex-1 resize-none border-0 bg-transparent p-3 text-sm text-amortix-navy outline-none focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-2xl bg-amortix-red p-3 text-white transition-opacity hover:opacity-90"
            >
              <div className="h-4 w-4 rounded-xs bg-white"></div>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-2xl bg-amortix-emerald p-3 text-white transition-all hover:bg-amortix-emerald/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
        <p className="mt-3 text-center text-[10px] text-amortix-slate">
          This is not financial advice - verify important financial decisions with a qualified professional.
        </p>
      </div>
    </div>
  );
}
