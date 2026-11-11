'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  AudioLines,
  MessageCircle,
  X,
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Welcome to SmartNet. I am NEXUS, your AI business consultant. Tell me about your organisation or ask how our engineering capabilities could help.',
};

const PROMPTS = [
  'What can SmartNet do for my company?',
  'We need to modernise our cloud infrastructure.',
  'Tell me about SmartNet Technologies.',
  'How could AI improve our business operations?',
];

export function NexusAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages, loading, open]);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();

    const message = draft.trim();

    if (!message || loading) return;

    setDraft('');
    setError('');
    setLoading(true);

    const history = messages.slice(-8);

    setMessages((current) => [
      ...current,
      { role: 'user', content: message },
    ]);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      20000
    );

    try {
      const response = await fetch('/api/nexus/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });

      const data: { answer?: string; error?: string } =
        await response.json();

      if (!response.ok || !data.answer) {
        throw new Error(data.error || 'Unable to respond.');
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.answer! },
      ]);
    } catch (cause) {
      setError(
        controller.signal.aborted
          ? 'The request took too long. Please try again.'
          : cause instanceof Error
            ? cause.message
            : 'NEXUS is unavailable.'
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <div className="snx-ai">
      <button
        ref={triggerRef}
        type="button"
        className="snx-ai-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open NEXUS AI assistant"
        aria-expanded={open}
      >
        <AudioLines size={23} />
        <span>ASK NEXUS</span>
      </button>

      {open && (
        <div className="snx-ai-layer">
          <div className="snx-ai-modal" role="dialog"
            aria-modal="true" aria-labelledby="snx-ai-title">

            <header className="snx-ai-header">
              <div>
                <span className="snx-ai-kicker">
                  SMARTNET / INTELLIGENCE INTERFACE
                </span>
                <strong>NEXUS AI</strong>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close NEXUS AI"
              >
                <X size={22} />
              </button>
            </header>

            <div className="snx-ai-layout">
              <aside className="snx-ai-intro">
                <div className="snx-ai-orb" aria-hidden="true">
                  <div className="snx-ai-orb-core">
                    <AudioLines size={43} />
                  </div>
                </div>

                <span className="snx-ai-kicker">
                  YOUR DIGITAL SOLUTIONS CONSULTANT
                </span>

                <h2 id="snx-ai-title">
                  What can we
                  <br />
                  <em>solve together?</em>
                </h2>

                <p>
                  Explore our capabilities, describe a
                  business challenge or discover possible
                  technology solutions.
                </p>

                <div className="snx-ai-suggestions">
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setDraft(prompt);
                        inputRef.current?.focus();
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </aside>

              <section className="snx-ai-chat"
                aria-label="NEXUS AI conversation">
                <div className="snx-ai-chat-top">
                  <span>
                    <i /> AI CONSULTANT
                  </span>
                  <span>TEXT MODE / LIVE AI</span>
                </div>

                <div className="snx-ai-messages"
                  aria-live="polite">
                  {messages.map((item, index) => (
                    <div
                      key={index}
                      className={
                        `snx-ai-message snx-ai-${item.role}`
                      }
                    >
                      <span>
                        {item.role === 'user'
                          ? 'YOU'
                          : 'NEXUS'}
                      </span>
                      <p>{item.content}</p>
                    </div>
                  ))}

                  {loading && (
                    <div className="snx-ai-thinking">
                      NEXUS IS THINKING
                      <span>...</span>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {error && (
                  <p className="snx-ai-error" role="alert">
                    {error}
                  </p>
                )}

                <form
                  onSubmit={sendMessage}
                  className="snx-ai-form"
                >
                  <MessageCircle size={19} />
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(event) =>
                      setDraft(event.target.value)
                    }
                    placeholder="Ask a question or describe a challenge..."
                    maxLength={800}
                    aria-label="Message to NEXUS AI"
                  />
                  <button type="submit"
                    disabled={loading || !draft.trim()}
                    aria-label="Send message">
                    <ArrowUp size={20} />
                  </button>
                </form>

                <p className="snx-ai-disclaimer">
                  AI-generated guidance. Do not share
                  confidential company information.
                  Responses may be inaccurate.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
