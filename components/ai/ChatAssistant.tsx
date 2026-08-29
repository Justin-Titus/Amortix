"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { Bot, Send, MessageSquarePlus, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

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

interface ChatAssistantProps {
  initialInput?: string;
  contextPrompts?: string[];
}

const markdownComponents: any = {
  a: ({ href, children }: any) => {
    const isInternal = href && href.startsWith("/");
    const linkClasses =
      "inline-flex items-center gap-1.5 font-medium text-amortix-emerald bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/80 hover:border-emerald-300 px-2.5 py-1 rounded-xl text-xs transition-all shadow-xs no-underline my-1 hover:shadow-sm";

    if (isInternal) {
      return (
        <Link href={href} className={linkClasses}>
          <span>{children}</span>
          <ExternalLink className="h-3 w-3 shrink-0 text-amortix-emerald" />
        </Link>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        <span>{children}</span>
        <ExternalLink className="h-3 w-3 shrink-0 text-amortix-emerald" />
      </a>
    );
  },
  table: ({ children }: any) => (
    <div className="not-prose my-4 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm border-collapse min-w-[450px]">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-slate-100">{children}</tbody>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-slate-600 align-top">{children}</td>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-slate-50/50 transition-colors">{children}</tr>
  ),
  hr: () => (
    <hr className="my-5 border-t border-slate-200" />
  ),
};

export default function ChatAssistant({ initialInput, contextPrompts }: ChatAssistantProps) {
  const [input, setInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/chat" }),
    []
  );
  const { messages, setMessages, status, stop, sendMessage, error } = useChat({ transport });
  const hasAutoSentRef = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = typeof initialInput === "string" ? initialInput.trim() : "";
    if (trimmed && hasAutoSentRef.current !== trimmed) {
      hasAutoSentRef.current = trimmed;
      sendMessage({ text: trimmed });
      setInput("");
    }
  }, [initialInput, sendMessage]);

  const defaultPrompts = [
    "Which repayment strategy is best for my current loans?",
    "How much interest will I save if I pay an extra ₹5000 per month?",
    "Should I prioritize Debt Avalanche or Debt Snowball?",
  ];

  const activePrompts = contextPrompts && contextPrompts.length > 0 ? contextPrompts : defaultPrompts;

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevMessagesLength = useRef(messages.length);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // If user manually scrolls back down to the bottom (within 60px), resume auto-scroll
    if (scrollHeight - scrollTop - clientHeight < 60) {
      userScrolledUpRef.current = false;
    }
  };

  const handleUserInteraction = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // If user uses mouse wheel or touch gesture to scroll UP, pause auto-scroll
    if (scrollHeight - scrollTop - clientHeight >= 60) {
      userScrolledUpRef.current = true;
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevMessagesLength.current;
    prevMessagesLength.current = messages.length;

    if (isNewMessage) {
      userScrolledUpRef.current = false;
    }

    // Instantly snap to bottom during streaming if user has not scrolled up
    if (!userScrolledUpRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white/90 backdrop-blur-md absolute top-0 inset-x-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-amortix-emerald border border-emerald-100/80 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amortix-emerald" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-slate-800 font-heading">Amortix AI</span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Advisor</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Start a new chat?")) {
                setMessages([]);
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 active:scale-95"
            title="New Chat"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium">New Chat</span>
          </button>
        )}
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="flex-1 space-y-6 overflow-y-auto bg-white px-4 pt-20 pb-14"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center space-y-6 pt-6 pb-8 text-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-700 shadow-2xs">
              <Bot className="h-6 w-6 text-slate-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800">
                How can I help you today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                I can analyze your loan portfolio, calculate optimal repayment strategies, or compare Avalanche vs. Snowball payoff timelines.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-2.5 pt-2">
              {activePrompts.map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => sendMessage({ text: promptText })}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-left text-xs sm:text-sm text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-900"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const textContent = getMessageText(message as DisplayMessage);
            return (
              <div
                key={message.id}
                className={`group relative flex gap-4 max-w-5xl mx-auto w-full min-w-0 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {message.role !== "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-amortix-navy shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] min-w-0 break-words text-[15px] leading-relaxed ${message.role === "user"
                      ? "rounded-[24px] bg-slate-100 px-5 py-3 text-slate-800"
                      : "rounded-[24px] bg-slate-50 border border-slate-200/60 px-5 py-4 text-slate-800 prose prose-slate prose-sm max-w-none shadow-2xs overflow-hidden"
                    }`}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap">{textContent}</p>
                  ) : (
                    <div className="relative pr-6">
                      <button
                        type="button"
                        onClick={() => copyMessage(message.id, textContent)}
                        className="absolute right-0 top-0 rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 opacity-0 shadow-2xs transition-all group-hover:opacity-100 hover:text-slate-700 hover:border-slate-300"
                        aria-label="Copy assistant response"
                        title="Copy response"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3.5 w-3.5 text-amortix-emerald" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {textContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {isLoading && messages[messages.length - 1]?.role === "user" && !error && (
          <div className="flex gap-4 max-w-5xl mx-auto w-full flex-row">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-amortix-navy shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-4 max-w-5xl mx-auto w-full flex-row">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-800 max-w-lg shadow-xs">
              <p className="font-semibold text-amber-900">
                {error.message?.includes("429") || error.message?.toLowerCase().includes("rate limit") || error.message?.toLowerCase().includes("too many")
                  ? "Message Limit Reached"
                  : error.message?.includes("401") || error.message?.toLowerCase().includes("unauthorized")
                  ? "Session Expired"
                  : "Assistant Temporarily Unavailable"}
              </p>
              <p className="mt-0.5 text-amber-700 leading-relaxed">
                {(() => {
                  const msg = (error.message || "").toLowerCase();
                  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many")) {
                    return "You've sent too many messages in a short period. Please wait a minute before sending another message.";
                  }
                  if (msg.includes("401") || msg.includes("unauthorized")) {
                    return "Your session has expired. Please refresh the page or log in again to continue chatting.";
                  }
                  if (msg.includes("quota") || msg.includes("token")) {
                    return "The AI service is experiencing high demand. Please try again in a few moments.";
                  }
                  return "Our financial assistant encountered a temporary hiccup. Please try sending your message again.";
                })()}
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-12 shrink-0" />
      </div>

      <div className="bg-gradient-to-t from-white via-white to-white/0 pt-6 pb-4 px-4 absolute bottom-0 inset-x-0">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-5xl relative flex items-end gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm transition-all focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-md"
        >
          <textarea
            onFocus={(e) => {
              e.currentTarget.style.outline = "0";
            }}
            value={input}
            onChange={handleInputChange}
            maxLength={4000}
            placeholder="Ask about your finances..."
            className="scrollbar-hide min-h-9 max-h-32 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm text-amortix-navy outline-none focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
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
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amortix-red text-white shadow-sm transition-transform hover:scale-105 hover:bg-red-600"
            >
              <div className="h-2.5 w-2.5 rounded-sm bg-white"></div>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amortix-navy text-white shadow-sm transition-transform hover:scale-105 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="h-3.5 w-3.5" />
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
