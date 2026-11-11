'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useReducedMotion } from 'motion/react';
import { AudioLines, Mic, MicOff, PhoneOff, X } from 'lucide-react';
import {
  NexusHologram,
  type HologramTopic,
  type VoiceState,
} from './nexus-hologram';

type LiveSession =
  Awaited<ReturnType<GoogleGenAI['live']['connect']>>;

const SYSTEM_PROMPT = `
You are NEXUS, the live AI technology and business consultant
representing SmartNet Technologies.

IMPORTANT IDENTITY:
The company is SMARTNET TECHNOLOGIES, pronounced "Smart Net".
Spoken references to "SmartNet", "Smart Net", "SmartNet Tech",
or similar-sounding company names usually mean SmartNet Technologies.
When a transcription is ambiguous, ask a brief clarifying question.
Do not reinterpret SmartNet as "market two" or discuss unrelated
definitions of similarly sounding words.

VERIFIED COMPANY PROFILE:
SmartNet Technologies is based in South Africa, has developed software
since 2016 and has worked with international clients.
Capabilities include custom software development, cloud infrastructure,
Azure, Kubernetes, DevOps, CI/CD, architecture, systems integration,
security-first engineering, responsible AI, education technology,
business technology consulting and technology procurement.
SmartNet develops road maintenance funding analysis solutions
and AI-assisted education technology.

YOUR ROLE:
First understand the visitor's situation, not simply advertise services.
Ask one useful discovery question at a time.
Explain practical ways SmartNet could help, without guaranteeing results.
Describe possible architectures and implementation phases in clear words.
If a visitor asks about SmartNet, answer about SmartNet directly.
When appropriate, offer to connect them with the SmartNet team.
Keep spoken answers concise and natural.

Never invent contracts, customer identities, awards, qualifications,
partner arrangements, pricing or project delivery records.
Never ask for credentials or confidential business information.
Never pretend to have inspected the visitor's systems.
`;

function topicFromText(text: string): HologramTopic {
  const value = text.toLowerCase();

  if (/school|student|learner|education|university|training/.test(value)) {
    return 'education';
  }

  if (/cloud|azure|aws|server|kubernetes|infrastructure|devops/.test(value)) {
    return 'cloud';
  }

  if (/software|application|api|database|platform|system/.test(value)) {
    return 'software';
  }

  if (/warehouse|fleet|stock|procurement|business|logistics|supply/.test(value)) {
    return 'business';
  }

  return 'general';
}

function encodePcm(samples: Float32Array): string {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(
      i * 2,
      sample < 0 ? sample * 32768 : sample * 32767,
      true
    );
  }

  let binary = '';

  for (let i = 0; i < bytes.length; i += 2048) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + 2048)
    );
  }

  return btoa(binary);
}

export function NexusVoiceExperience({
  onClose,
}: {
  onClose: () => void;
}) {
  const [status, setStatus] = useState<VoiceState>('idle');
  const [topic, setTopic] = useState<HologramTopic>('general');
  const [subtitle, setSubtitle] = useState('');
  const [heard, setHeard] = useState('');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');

  const reduced = useReducedMotion();

  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playTimeRef = useRef(0);
  const playbackRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRef = useRef(false);

  const disconnect = useCallback(() => {
    closingRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      sessionRef.current?.sendRealtimeInput({
        audioStreamEnd: true,
      });
      sessionRef.current?.close();
    } catch {
      // Session may already be closed.
    }

    sessionRef.current = null;

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    playbackRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Playback already finished.
      }
    });

    playbackRef.current.clear();

    void inputContextRef.current?.close().catch(() => {});
    void outputContextRef.current?.close().catch(() => {});

    inputContextRef.current = null;
    outputContextRef.current = null;
    playTimeRef.current = 0;

    setStatus('idle');
    setMuted(false);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
      disconnect();
    };
  }, [disconnect]);

  function playAudio(base64: string) {
    const context = outputContextRef.current;
    if (!context) return;

    const binary = atob(base64);
    const length = Math.floor(binary.length / 2);
    if (!length) return;

    const buffer = context.createBuffer(1, length, 24000);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      let sample =
        binary.charCodeAt(i * 2) |
        (binary.charCodeAt(i * 2 + 1) << 8);

      if (sample >= 32768) sample -= 65536;
      channel[i] = sample / 32768;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    const startAt = Math.max(
      context.currentTime + 0.025,
      playTimeRef.current
    );

    source.start(startAt);
    playTimeRef.current = startAt + buffer.duration;

    playbackRef.current.add(source);

    source.onended = () => {
      playbackRef.current.delete(source);

      if (playbackRef.current.size === 0) {
        setStatus((current) =>
          current === 'speaking' ? 'listening' : current
        );
      }
    };
  }

  async function startConversation() {
    if (status === 'connecting' || sessionRef.current) return;

    setStatus('connecting');
    setError('');
    setSubtitle('');
    setHeard('');
    closingRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not supported.');
      }

      // Create and unlock playback from the user gesture.
      const output = new AudioContext({ sampleRate: 24000 });
      outputContextRef.current = output;
      await output.resume();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      streamRef.current = stream;

      const input = new AudioContext({ sampleRate: 16000 });
      inputContextRef.current = input;
      await input.resume();

      // Fetch the token after microphone permission to avoid expiry.
      const response = await fetch('/api/nexus/live-token', {
        method: 'POST',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(
          'Live AI unavailable. Check Gemini Live API access and quota.'
        );
      }

      const data: { token: string; model: string } =
        await response.json();

      if (closingRef.current) return;

      const ai = new GoogleGenAI({
        apiKey: data.token,
        httpOptions: { apiVersion: 'v1beta' },
      });

      const liveSession = await ai.live.connect({
        model: data.model,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: SYSTEM_PROMPT,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck',
              },
            },
          },
        },
        callbacks: {
          onopen: () => {
            setStatus('listening');
          },
          onmessage: (message) => {
            if (closingRef.current) return;

            const content = message.serverContent;

            if (content?.interrupted) {
              playbackRef.current.forEach((source) => {
                try { source.stop(); } catch {}
              });

              playbackRef.current.clear();
              playTimeRef.current =
                outputContextRef.current?.currentTime ?? 0;
              setStatus('listening');
            }

            if (content?.inputTranscription?.text) {
              const text = content.inputTranscription.text;
              setHeard(text);
              setSubtitle('');
              setTopic(topicFromText(text));
            }

            if (content?.outputTranscription?.text) {
              const text = content.outputTranscription.text;

              setSubtitle((previous) =>
                (previous + text).slice(-900)
              );

              const detected = topicFromText(text);
              if (detected !== 'general') {
                setTopic(detected);
              }
            }

            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                setStatus('speaking');
                playAudio(part.inlineData.data);
              }
            }

            if (
              content?.turnComplete &&
              playbackRef.current.size === 0
            ) {
              setStatus('listening');
            }
          },
          onerror: () => {
            if (closingRef.current) return;
            disconnect();
            setStatus('error');
            setError('The live connection encountered an error.');
          },
          onclose: () => {
            if (closingRef.current) return;
            disconnect();
            setError('The voice session ended. You can reconnect.');
          },
        },
      });

      if (closingRef.current) {
        liveSession.close();
        return;
      }

      sessionRef.current = liveSession;

      const source = input.createMediaStreamSource(stream);
      const processor = input.createScriptProcessor(2048, 1, 1);

      sourceRef.current = source;
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        // Never feed the microphone back through the speakers.
        event.outputBuffer.getChannelData(0).fill(0);

        if (!sessionRef.current || closingRef.current) return;

        try {
          sessionRef.current.sendRealtimeInput({
            audio: {
              data: encodePcm(
                event.inputBuffer.getChannelData(0)
              ),
              mimeType: `audio/pcm;rate=${input.sampleRate}`,
            },
          });
        } catch {
          // Connection errors are handled by session callbacks.
        }
      };

      source.connect(processor);
      processor.connect(input.destination);

      setStatus('listening');

      // Development safeguard: short sessions while testing.
      timerRef.current = setTimeout(() => {
        disconnect();
        setError('The demo session limit was reached.');
      }, 8 * 60 * 1000);
    } catch (cause) {
      disconnect();
      setStatus('error');
      setError(
        cause instanceof DOMException &&
          ['NotAllowedError', 'PermissionDeniedError', 'SecurityError']
            .includes(cause.name)
          ? 'Microphone blocked. Check Chrome site permissions and macOS Privacy & Security > Microphone.'
          : cause instanceof Error
            ? cause.message
            : 'Unable to start NEXUS Live.'
      );
    }
  }

  function toggleMicrophone() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = muted;

    if (!muted) {
      try {
        sessionRef.current?.sendRealtimeInput({
          audioStreamEnd: true,
        });
      } catch {}
    }

    setMuted(!muted);
  }

  function closeExperience() {
    disconnect();
    onClose();
  }

  return (
    <div className="snx-live-overlay">
      <section
        className="snx-live-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="snx-live-title"
      >
        <header className="snx-live-header">
          <div>
            <span>SMARTNET / LIVE INTELLIGENCE</span>
            <strong id="snx-live-title">NEXUS AI</strong>
          </div>

          <button
            type="button"
            onClick={closeExperience}
            aria-label="Close live experience"
          >
            <X size={23} />
          </button>
        </header>

        <div className="snx-live-content">
          <NexusHologram
            state={status}
            topic={topic}
            reduced={!!reduced}
          />

          <div className="snx-live-conversation">
            <div className="snx-live-kicker">
              LIVE BUSINESS INTELLIGENCE / VOICE
            </div>

            <h2>
              Talk to
              <br />
              <em>NEXUS.</em>
            </h2>

            <p>
              Describe your biggest business challenge.
              NEXUS will explore the problem with you,
              explain possible technology solutions and
              help identify your next step with SmartNet.
            </p>

            <div className="snx-live-pillars">
              <span>01 / EXPLAIN YOUR CHALLENGE</span>
              <span>02 / EXPLORE POSSIBLE SOLUTIONS</span>
              <span>03 / PLAN YOUR NEXT MOVE</span>
            </div>

            <div className="snx-live-status" aria-live="polite">
              <AudioLines size={19} />
              <span>{status.toUpperCase()}</span>
            </div>

            {heard && (
              <div className="snx-live-transcript">
                <span>YOU SAID</span>
                <p>{heard}</p>
              </div>
            )}

            {subtitle && (
              <div className="snx-live-transcript">
                <span>NEXUS SAYS</span>
                <p>{subtitle}</p>
              </div>
            )}

            {error && (
              <p className="snx-live-error" role="alert">
                {error}
              </p>
            )}

            <div className="snx-live-controls">
              {status === 'idle' || status === 'error' ? (
                <button
                  type="button"
                  className="snx-live-start"
                  onClick={startConversation}
                >
                  <Mic size={20} />
                  Start Live Conversation
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    disabled={status === 'connecting'}
                  >
                    {muted ? <MicOff size={19} /> : <Mic size={19} />}
                    {muted ? 'Unmute' : 'Mute'}
                  </button>

                  <button
                    type="button"
                    onClick={disconnect}
                  >
                    <PhoneOff size={19} />
                    End Call
                  </button>
                </>
              )}
            </div>

            <small className="snx-live-privacy">
              Microphone access is optional. This session sends
              audio to Google Gemini Live for processing.
              Do not share confidential information.
              AI responses and diagrams can be inaccurate.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}
