'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Send, X, FileText, ChevronRight, AlertCircle, LogIn } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { getAccessToken, onAuthChange } from '@/lib/auth-storage';
import { cn } from '@/lib/utils';

interface Source {
  type: string;
  source: string;
  page: number | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

const SUGGESTIONS = [
  'How do I claim a lost parcel?',
  'What is the compensation for lost uninsured parcels?',
  'Are documents covered by compensation?',
  'Can I ship perishable items?',
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Parcel Payout's AI Assistant. How can I help you today? You can ask me about our shipping policies, tracking guidelines, or claim procedures.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `/rag/ask` needs a signed-in user — each call bills an embedding and a
  // completion — but this widget also renders on the public pages.
  const [signedIn, setSignedIn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read after mount: localStorage does not exist during the server render.
    const sync = () => setSignedIn(Boolean(getAccessToken()));
    sync();
    return onAuthChange(sync);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || !signedIn) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    // Create an empty assistant message to stream into
    const assistantId = Math.random().toString(36).substring(7);
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', sources: [], timestamp: new Date() }
    ]);

    try {
      const token = getAccessToken();
      const { API_BASE_URL } = await import('@/lib/config');
      
      const res = await fetch(`${API_BASE_URL}/rag/ask/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ question: text.trim(), filter: 'parcel' }),
      });

      if (!res.ok) {
        if (res.status === 401) setSignedIn(false);
        throw new Error('Failed to connect to assistant');
      }

      if (!res.body) throw new Error('ReadableStream not supported');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.slice(6).trim();
              if (!dataStr) continue;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'sources') {
                  setMessages((prev) => 
                    prev.map(m => m.id === assistantId ? { ...m, sources: data.sources } : m)
                  );
                } else if (data.type === 'token') {
                  setMessages((prev) => 
                    prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.token } : m)
                  );
                } else if (data.type === 'done') {
                  done = true;
                } else if (data.type === 'error') {
                  throw new Error(data.message);
                }
              } catch {
                // Ignore parse errors on incomplete chunks if any, but it shouldn't happen with \n\n
              }
            }
          }
        }
        if (readerDone) done = true;
      }
      setIsLoading(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setSignedIn(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      // Remove the empty assistant message if it failed before generating anything
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.id === assistantId && !last.content) return prev.slice(0, -1);
        return prev;
      });
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Helper to format/render markdown-like text
  const renderMessageContent = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let listKey = 0;

    const parseBold = (str: string) => {
      const parts = str.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-semibold text-accent-2">{part}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');

      if (isBullet) {
        const content = line.trim().replace(/^[-*]\s+/, '');
        listItems.push(
          <li key={`bullet-${index}`} className="ml-4 list-disc mb-1 text-white/90 leading-relaxed">
            {parseBold(content)}
          </li>
        );
      } else {
        // If we accumulated list items, flush them into a <ul>
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${listKey++}`} className="my-2 space-y-0.5">
              {listItems}
            </ul>
          );
          listItems = [];
        }

        if (line.trim() === '') {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        } else {
          elements.push(
            <p key={`p-${index}`} className="mb-2 text-white/90 leading-relaxed text-[13px] md:text-sm">
              {parseBold(line)}
            </p>
          );
        }
      }
    });

    // Flush any remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="my-2 space-y-0.5">
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer",
          isOpen 
            ? "bg-ink border border-ink-2/40 hover:bg-ink-2" 
            : "bg-gradient-to-tr from-accent to-accent-2 hover:shadow-[0_8px_30px_rgb(232,76,30,0.4)]"
        )}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <div className="relative">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-ink-2/40 bg-ink/95 backdrop-blur-xl text-white shadow-2xl transition-all duration-300 origin-bottom-right transform",
          isOpen 
            ? "scale-100 opacity-100 pointer-events-auto" 
            : "scale-90 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-[#b83b10] px-4 py-3.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold tracking-wide">Parcel Payout Copilot</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-white/80 font-medium font-sans">Always Active</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Panel Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((message) => {
            const isAI = message.role === 'assistant';
            
            // Deduplicate sources to avoid duplicates in rendering
            const uniqueSources = message.sources
              ? message.sources.filter(
                  (s, idx, self) => self.findIndex((src) => src.source === s.source) === idx
                )
              : [];

            return (
              <div
                key={message.id}
                className={cn("flex w-full animate-fade-in", isAI ? "justify-start" : "justify-end")}
              >
                <div className={cn("flex gap-2 max-w-[85%]", isAI ? "items-start" : "items-end flex-row-reverse")}>
                  {isAI && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-bg text-accent flex-shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all",
                        isAI 
                          ? "bg-ink-2/30 border border-ink-2/20 text-white rounded-tl-sm" 
                          : "bg-accent text-white rounded-tr-sm"
                      )}
                    >
                      {isAI ? renderMessageContent(message.content) : <p className="leading-relaxed">{message.content}</p>}
                    </div>

                    {/* RAG citations / sources */}
                    {isAI && uniqueSources.length > 0 && (
                      <div className="mt-2 border-t border-white/5 pt-2">
                        <span className="text-[9px] uppercase tracking-wider text-ink-3 font-bold flex items-center gap-1 mb-1.5">
                          <FileText className="h-2.5 w-2.5 text-accent" /> Verified Sources ({uniqueSources.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueSources.map((src, i) => (
                            <div
                              key={i}
                              title={src.source}
                              className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/80"
                            >
                              <FileText className="h-3 w-3 text-white/40" />
                              <span className="max-w-[120px] truncate">{src.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex w-full justify-start animate-pulse">
              <div className="flex gap-2 max-w-[85%] items-start">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-bg text-accent flex-shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-ink-2/30 border border-ink-2/20 px-4 py-3 shadow-sm">
                  <div className="flex space-x-1.5 py-1 items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert inside message feed */}
          {error && (
            <div className="flex w-full justify-center">
              <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-500/20 px-3.5 py-2 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <div className="flex-1">{error}</div>
              </div>
            </div>
          )}

          {/* SUGGESTIONS: Only show when user hasn't asked anything yet */}
          {signedIn && messages.length === 1 && !isLoading && (
            <div className="pt-2 space-y-2 animate-fade-in">
              <span className="text-[10px] uppercase tracking-wider text-ink-3 font-bold px-1 block">
                Common Questions
              </span>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-xl px-3.5 py-2 text-xs text-white/95 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{suggestion}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar — replaced by a sign-in prompt when there is no session */}
        {!signedIn ? (
          <div className="p-3 border-t border-white/10 bg-black/20">
            <p className="mb-2.5 text-xs text-white/70 leading-relaxed">
              Sign in to ask the assistant about policies, tracking and claims.
            </p>
            <Link
              href="/login"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-full bg-accent text-xs font-medium text-white transition-colors hover:bg-accent-2"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in to continue
            </Link>
          </div>
        ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="p-3 border-t border-white/10 bg-black/20 flex gap-2 items-center"
        >
          <input
            type="text"
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-9 w-9 bg-accent hover:bg-accent-2 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 disabled:hover:bg-accent cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        )}
      </div>
    </>
  );
}
