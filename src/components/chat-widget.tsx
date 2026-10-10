'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { rateLimitMessage, refreshAccessToken } from '@/lib/api';
import { getAccessToken, onAuthChange } from '@/lib/auth-storage';
import { API_BASE_URL } from '@/lib/config';
import { Icon } from '@/components/icon-sprite';

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
}

const SUGGESTIONS = [
  'How do I claim a lost parcel?',
  'What is the compensation for lost uninsured parcels?',
  'Are documents covered by compensation?',
  'Can I ship perishable items?',
];

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm Copilot 👋 Ask me about shipping policies, tracking, or claims.",
};

/** The API accepts at most this many earlier turns with a question. */
const MAX_HISTORY_TURNS = 10;

/** The sign-in and account-recovery screens stay free of distractions. */
const HIDDEN_ON = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

/** Speech bubble holding a parcel — the Copilot mark. */
function CopilotMark() {
  return (
    <svg className="icon-chat" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3.5c6.1 0 11 4.3 11 9.7s-4.9 9.7-11 9.7c-1.2 0-2.4-.2-3.5-.5L5 24.5l1.3-4.4C4.3 18.3 3 15.9 3 13.200c0-5.400 4.900-9.700 11-9.700Z" />
      <path d="m14 8.6 4.2 2.3v4.6L14 17.8l-4.2-2.3v-4.600L14 8.600Z" />
      <path d="m9.8 10.9 4.2 2.3 4.2-2.3M14 13.200v4.600" />
    </svg>
  );
}

/** The assistant answers in light markdown: paragraphs, `- ` bullets and `**bold**`. */
function renderContent(text: string) {
  const bold = (value: string) =>
    value.split(/\*\*(.*?)\*\*/g).map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));

  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {bullets.map((item, i) => <li key={i}>{bold(item)}</li>)}
      </ul>,
    );
    bullets = [];
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }
    flush();
    if (line) blocks.push(<p key={`p-${blocks.length}`}>{bold(line)}</p>);
  }
  flush();
  return blocks;
}

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(true);
  // `/rag/ask` needs a signed-in user — each call bills an embedding and a
  // completion — but this widget also renders on the public pages.
  const [signedIn, setSignedIn] = useState(false);
  // The API answers 503 when it has no AI provider keys; asking again won't help.
  const [unavailable, setUnavailable] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read after mount: localStorage does not exist during the server render.
    const sync = () => setSignedIn(Boolean(getAccessToken()));
    sync();
    return onAuthChange(sync);
  }, []);

  // Any element marked `data-open-chat` (FAQ, contact, footer…) opens the panel.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('[data-open-chat]')) return;
      e.preventDefault();
      setUnread(false);
      setIsOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || !signedIn || unavailable) return;

    // The server keeps no chat state, so "and when will it arrive?" only
    // makes sense if the conversation rides along. The canned greeting and
    // anything that never got an answer are left out.
    const history = messages
      .filter((m) => m.id !== WELCOME.id && m.content.trim())
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text },
      // An empty assistant message to stream into
      { id: assistantId, role: 'assistant', content: '', sources: [] },
    ]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const patch = (update: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? update(m) : m)));

    try {
      const ask = (token: string | null) =>
        fetch(`${API_BASE_URL}/rag/ask/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            question: text.trim(),
            filter: 'parcel',
            ...(history.length ? { history } : {}),
          }),
        });

      let res = await ask(getAccessToken());
      // An expired access token is not a signed-out user: rotate and retry once.
      if (res.status === 401) {
        const fresh = await refreshAccessToken();
        if (fresh) res = await ask(fresh);
      }

      // Failures arrive as an ordinary JSON error before the stream starts.
      if (!res.ok) {
        if (res.status === 401) setSignedIn(false);
        if (res.status === 503) setUnavailable(true);
        if (res.status === 429) throw new Error(rateLimitMessage(res));
        const body = await res.json().catch(() => null);
        throw new Error(typeof body?.message === 'string' ? body.message : 'Failed to connect to assistant');
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
            if (!part.startsWith('data: ')) continue;
            const dataStr = part.slice(6).trim();
            if (!dataStr) continue;
            let data;
            try {
              data = JSON.parse(dataStr);
            } catch {
              // Ignore a malformed chunk; events are `\n\n`-delimited so this is rare.
              continue;
            }
            if (data.type === 'sources') patch((m) => ({ ...m, sources: data.sources }));
            else if (data.type === 'token') patch((m) => ({ ...m, content: m.content + data.token }));
            else if (data.type === 'done') done = true;
            else if (data.type === 'error') throw new Error(data.message);
          }
        }
        if (readerDone) done = true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      // Drop the empty assistant message if it failed before generating anything
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last.id === assistantId && !last.content ? prev.slice(0, -1) : prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (HIDDEN_ON.includes(pathname)) return null;

  const streamingId = isLoading ? messages[messages.length - 1]?.id : null;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            className="chat-panel"
            id="chat-panel"
            role="dialog"
            aria-label="Parcel Payout Copilot"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <header className="chat-head">
              <span className="chat-avatar"><Icon name="i-box" size={22} /></span>
              <div><b>Parcel Payout Copilot</b><small>Always active · replies in seconds</small></div>
              <button type="button" aria-label="Minimise chat" onClick={() => setIsOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </header>

            <div className="chat-body" aria-live="polite" ref={bodyRef}>
              <span className="chat-day">Today</span>

              {messages.map((message) => {
                const isAI = message.role === 'assistant';
                // Only documents are worth citing: parcel records come back with a
                // tracking ID as their source, which means nothing to the reader.
                // Deduplicated, since several chunks can share one document.
                const sources = (message.sources ?? []).filter(
                  (s, idx, all) => s.type === 'pdf' && all.findIndex((o) => o.source === s.source) === idx,
                );
                const waiting = message.id === streamingId && !message.content;

                return (
                  <motion.div
                    key={message.id}
                    className={`msg${isAI ? '' : ' user'}`}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  >
                    {isAI && <span className="mini"><Icon name="i-box" size={14} /></span>}
                    <div className="bubble">
                      {waiting ? (
                        <span className="typing" aria-label="Copilot is typing"><i /><i /><i /></span>
                      ) : isAI ? (
                        renderContent(message.content)
                      ) : (
                        message.content
                      )}
                      {sources.map((src) => (
                        <span className="source" key={src.source} title={src.source}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6v18h12V7l-4-4Z" /><path d="M14 3v4h4" /></svg>
                          {src.source}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {error && <p className="chat-error" role="alert">{error}</p>}
            </div>

            {unavailable ? (
              <div className="chat-signin">
                <p>Copilot is switched off on this server right now. Please try again later.</p>
              </div>
            ) : signedIn ? (
              <>
                {/* Suggestions only until the first question has been asked */}
                {messages.length === 1 && (
                  <div className="chat-suggest">
                    {SUGGESTIONS.map((suggestion) => (
                      <button type="button" key={suggestion} onClick={() => handleSend(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  className="chat-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(inputValue);
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your question..."
                    aria-label="Message"
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                  />
                  <button type="submit" aria-label="Send" disabled={!inputValue.trim() || isLoading}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
                  </button>
                </form>
                <p className="chat-note">Copilot can make mistakes. Check important details.</p>
              </>
            ) : (
              <div className="chat-signin">
                <p>Sign in to ask Copilot about policies, tracking and claims.</p>
                <Link className="btn dark full" href="/login" onClick={() => setIsOpen(false)}>
                  Sign in to continue
                </Link>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="chat-launcher"
        aria-label="Toggle chat assistant"
        aria-expanded={isOpen}
        aria-controls="chat-panel"
        onClick={() => {
          setUnread(false);
          setIsOpen((open) => !open);
        }}
      >
        <CopilotMark />
        <svg className="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        {unread && <span className="chat-badge">1</span>}
      </button>
    </MotionConfig>
  );
}
