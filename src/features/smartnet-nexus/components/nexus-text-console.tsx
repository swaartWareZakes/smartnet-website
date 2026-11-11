'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, LoaderCircle } from 'lucide-react';
import type { HologramTopic } from './nexus-hologram';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  disabled: boolean;
  onTopic: (topic: HologramTopic) => void;
};

const PROMPTS = [
  'Tell me about SmartNet Technologies.',
  'How could SmartNet help my business?',
];

function detectTopic(text: string): HologramTopic {
  const value = text.toLowerCase();

  if (/cloud|azure|kubernetes|devops|infrastructure/.test(value)) {
    return 'cloud';
  }

  if (/education|school|student|learner|training/.test(value)) {
    return 'education';
  }

  if (/\bai\b|artificial intelligence|machine learning/.test(value)) {
    return 'ai';
  }

  if (/software|application|database|api|platform/.test(value)) {
    return 'software';
  }

  if (/business|fleet|logistics|procurement|operations/.test(value)) {
    return 'business';
  }

  return 'general';
}

export function NexusTextConsole({ disabled, onTopic }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inFlight = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [messages]);

  async function send(value: string) {
    const message = value.trim();

    if (!message || disabled || inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    setError('');
    setDraft('');

    const history = messages.slice(-8);

    setMessages((previous) => [
      ...previous,
      { role: 'user', content: message },
    ]);

    onTopic(detectTopic(message));

    const controller = new AbortController();
    controllerRef.current = controller;

    const timeout = window.setTimeout(
      () => controller.abort(),
      20000
    );

    try {
      const response = await fetch('/api/nexus/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          history,
        }),
      });

      const data: {
        answer?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !data.answer) {
        throw new Error(data.error || 'NEXUS is unavailable.');
      }

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: data.answer! },
      ]);

      const topic = detectTopic(data.answer);
      if (topic !== 'general') onTopic(topic);
    } catch (cause) {
      setError(
        controller.signal.aborted
          ? 'The request timed out. Please try again.'
          : cause instanceof Error
            ? cause.message
            : 'NEXUS could not respond.'
      );
    } finally {
      window.clearTimeout(timeout);
      controllerRef.current = null;
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="snx-v12-text">
      <div className="snx-v12-suggestions">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled || loading}
            onClick={() => void send(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div
        className="snx-v12-messages"
        aria-live="polite"
        aria-label="Text conversation"
      >
        {messages.map((item, index) => (
          <div
            key={index}
            className={`snx-v12-message is-${item.role}`}
          >
            <span>
              {item.role === 'user' ? 'YOU' : 'NEXUS'}
            </span>
            <p>{item.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="snx-v12-error" role="alert">{error}</p>}

      {disabled && (
        <p className="snx-v12-hint">
          End the live voice call to use text mode.
        </p>
      )}

      <form
        className="snx-v12-form"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <input
          aria-label="Ask NEXUS a question"
          placeholder="Ask NEXUS anything about SmartNet..."
          value={draft}
          maxLength={800}
          disabled={disabled || loading}
          onChange={(event) => setDraft(event.target.value)}
        />

        <button
          type="submit"
          aria-label="Send question"
          disabled={disabled || loading || !draft.trim()}
        >
          {loading
            ? <LoaderCircle size={18} className="snx-v12-spin" />
            : <ArrowUp size={18} />}
        </button>
      </form>
    </div>
  );
}
