'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  SMARTNET_COMPANY_CONTEXT,
  SMARTNET_LIVE_GREETING,
} from '@/lib/smartnet-context';
import { useReducedMotion } from 'motion/react';
import { AudioLines, Mic, MicOff, PhoneOff, X } from 'lucide-react';
import { NexusTextConsole } from './nexus-text-console';

import {
  NexusHologram,
  type HologramTopic,
  type VoiceState,
} from './nexus-hologram';

type LiveSession =
  Awaited<ReturnType<GoogleGenAI['live']['connect']>>;

const SYSTEM_PROMPT = `
You are NEXUS, the official AI technology consultant
representing SmartNet Technologies.

YOUR IDENTITY
You represent SmartNet Technologies, not Google, Cisco
or another technology company.
Pronounce SmartNet as "Smart Net".
When someone asks about SmartNet, our company, our services
or our technology, answer using the verified profile below.

VERIFIED SMARTNET KNOWLEDGE
${SMARTNET_COMPANY_CONTEXT}

CONVERSATION RULES
- Be natural, warm, confident and professional.
- Speak in concise, clear sentences suitable for voice.
- Keep your focus on SmartNet and the visitor's business.
- Ask only one useful discovery question at a time.
- If the visitor describes a problem, explain how SmartNet
  could potentially help, rather than promising a solution.
- If a name sounds like SmartNet but transcription is unclear,
  use the conversation context before assuming another meaning.
- Never present another company's services as SmartNet's services.
- Do not invent any projects, qualifications or partnerships.
- Do not request passwords or confidential business records.
- If asked about unrelated matters, briefly redirect to the
  visitor's technology or business objectives when appropriate.
- Do not repeat the entire company profile in every answer.

FIRST GREETING
When you receive the automatic introduction request at the
start of a new live session, deliver the supplied welcome
message as a natural spoken introduction.
Finish the greeting and wait for the visitor to speak.
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

  if (/\bai\b|artificial intelligence|machine learning/.test(value)) {
    return 'ai';
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
  const [introComplete, setIntroComplete] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');

  const reduced = useReducedMotion();

  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playTimeRef = useRef(0);
  const playbackRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRef = useRef(false);
  const spokenRef = useRef('');
  const greetingPendingRef = useRef(false);
  const greetingFinishedRef = useRef(false);

  const disconnect = useCallback(() => {
    closingRef.current = true;
    greetingPendingRef.current = false;
    greetingFinishedRef.current = false;

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

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    void inputContextRef.current?.close().catch(() => {});
    void outputContextRef.current?.close().catch(() => {});

    inputContextRef.current = null;
    outputContextRef.current = null;
    playTimeRef.current = 0;

    setStatus('idle');
    setMuted(false);
    setIntroComplete(false);
    spokenRef.current = '';
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
    source.connect(analyserRef.current ?? context.destination);

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
        if (greetingPendingRef.current) {
          if (greetingFinishedRef.current) {
            greetingPendingRef.current = false;
            setIntroComplete(true);
            setStatus('listening');
          }
        } else {
          setStatus((current) =>
            current === 'speaking' ? 'listening' : current
          );
        }
      }
    };
  }

  async function startConversation() {
    if (status === 'connecting' || sessionRef.current) return;

    setStatus('connecting');
    setError('');
    setSubtitle('');
    setHeard('');
    setIntroComplete(false);
    spokenRef.current = '';
    setTopic('general');
    closingRef.current = false;
    greetingPendingRef.current = true;
    greetingFinishedRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not supported.');
      }

      // Create and unlock playback from the user gesture.
      const output = new AudioContext({ sampleRate: 24000 });
      outputContextRef.current = output;

      const analyser = output.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      analyser.connect(output.destination);
      analyserRef.current = analyser;

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

              spokenRef.current =
                (spokenRef.current + text).slice(-1200);

              const namedTopics = Array.from(
                spokenRef.current.matchAll(
                  /software|applications?|cloud|azure|infrastructure|kubernetes|devops|artificial intelligence|\bai\b|education|learning|school|business|digital transformation/gi
                )
              );

              const latest = namedTopics.at(-1)?.[0] ?? '';
              const detected = topicFromText(latest);

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

            if (content?.turnComplete) {
              if (greetingPendingRef.current) {
                greetingFinishedRef.current = true;
              }

              if (playbackRef.current.size === 0) {
                if (greetingPendingRef.current) {
                  setIntroComplete(true);
                }
                greetingPendingRef.current = false;
                setStatus('listening');
              }
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

      setStatus('speaking');

      liveSession.sendClientContent({
        turns: [{
          role: 'user',
          parts: [{
            text:
              'AUTOMATIC SESSION START. The visitor has just ' +
              'enabled the microphone. Speak this welcome ' +
              'message aloud, naturally and briefly. ' +
              'Do not answer a different question. ' +
              'Do not add unrelated company information. ' +
              'Welcome message: ' + SMARTNET_LIVE_GREETING,
          }],
        }],
        turnComplete: true,
      });

      const source = input.createMediaStreamSource(stream);
      const processor = input.createScriptProcessor(2048, 1, 1);

      sourceRef.current = source;
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        // Never feed the microphone back through the speakers.
        event.outputBuffer.getChannelData(0).fill(0);

        if (
          !sessionRef.current ||
          closingRef.current ||
          greetingPendingRef.current
        ) return;

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

      // Listening starts once the welcome turn
      // and queued greeting audio have finished.

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

  function selectIntroductionPath(
    choice: 'company' | 'business'
  ) {
    if (!sessionRef.current || status !== 'listening') return;

    const prompt = choice === 'company'
      ? 'Please tell me more about SmartNet Technologies: its history, values and real capabilities. Keep it conversational and then ask what I would like to explore.'
      : 'I would like to find out how SmartNet could help my business. Please start by asking what industry I work in and what my biggest operational challenge is. Ask one question at a time.';

    setIntroComplete(false);
    setSubtitle('');
    spokenRef.current = '';
    setStatus('speaking');

    try {
      sessionRef.current.sendClientContent({
        turns: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        turnComplete: true,
      });
    } catch {
      setStatus('listening');
      setIntroComplete(true);
      setError('Could not send your selection. Please try speaking.');
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
            analyser={analyserRef}
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

            {introComplete && status === 'listening' && (
              <div className="snx-live-intro-choices">
                <span>WHERE SHALL WE BEGIN?</span>

                <button
                  type="button"
                  onClick={() => selectIntroductionPath('company')}
                >
                  Discover SmartNet
                  <small>Our story, expertise and capabilities</small>
                </button>

                <button
                  type="button"
                  onClick={() => selectIntroductionPath('business')}
                >
                  Explore my business
                  <small>Tell NEXUS about a challenge you face</small>
                </button>
              </div>
            )}

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

            <details className="snx-v12-text-details">
              <summary>
                <span>Prefer typing?</span>
                <strong>OPEN TEXT CONVERSATION</strong>
              </summary>

              <NexusTextConsole
                disabled={
                  status !== 'idle' && status !== 'error'
                }
                onTopic={setTopic}
              />
            </details>

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
