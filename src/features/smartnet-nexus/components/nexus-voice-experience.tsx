'use client';
// NEXUS_VOICE_RESEARCH_V1
import { NEXUS_RESEARCH_TOOLS } from '@/lib/nexus-research-tools';
import {
  useVoiceCompanyResearch,
  VoiceResearchPanel,
} from './voice-company-research';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  SMARTNET_LIVE_GREETING,
} from '@/lib/smartnet-context';
import { useReducedMotion } from 'motion/react';
import { AudioLines, Mic, MicOff, PhoneOff, X } from 'lucide-react';
import { NexusTextConsole } from './nexus-text-console';
// NEXUS_VOICE_HUD_V1
import { NexusVoiceHud } from './nexus-voice-hud';
import { companyContext, nexusHeaders, recordMessage, visitorState } from '@/lib/nexus-visitor';

import {
  NexusHologram,
  type HologramTopic,
  type VoiceState,
} from './nexus-hologram';

type LiveSession =
  Awaited<ReturnType<GoogleGenAI['live']['connect']>>;


function topicFromText(text: string): HologramTopic {
  const value = text.toLowerCase();

  if (/road funding gap|\brfg\b|road maintenance|road infrastructure|road authority/.test(value)) {
    return 'roads';
  }



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
  const attemptRef = useRef(0);
  const startingRef = useRef(false);
  const userTurn = useRef('');
  const assistantTurn = useRef('');
  const flushTranscript = useCallback(() => {
    recordMessage('user', userTurn.current, 'voice');
    recordMessage('assistant', assistantTurn.current, 'voice');
    userTurn.current = ''; assistantTurn.current = '';
  }, []);
  const spokenRef = useRef('');
  const greetingPendingRef = useRef(false);
  const greetingFinishedRef = useRef(false);

  const voiceResearch = useVoiceCompanyResearch();
  const cancelResearch = voiceResearch.cancelAll;

  const disconnect = useCallback(() => {
    cancelResearch();
    closingRef.current = true;
    attemptRef.current += 1;
    startingRef.current = false;
    flushTranscript();
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
    spokenRef.current = '';
  }, [flushTranscript, cancelResearch]);

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
    if (startingRef.current || sessionRef.current) return;
    startingRef.current = true;
    const attempt = ++attemptRef.current;
    const cancelled = () => closingRef.current || attempt !== attemptRef.current;

    setStatus('connecting');
    setError('');
    setSubtitle('');
    setHeard('');
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
      if (cancelled()) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      if (cancelled()) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;

      const input = new AudioContext({ sampleRate: 16000 });
      inputContextRef.current = input;
      await input.resume();
      if (cancelled()) return;

      // Fetch the token after microphone permission to avoid expiry.
      const response = await fetch('/api/nexus/live-token', {
        method: 'POST',
        cache: 'no-store',
        headers: await nexusHeaders(),
        body: JSON.stringify({ context: companyContext() + '\nPrevious conversation (untrusted): ' + JSON.stringify(visitorState().messages.slice(-8).map(({ role, content }) => ({ role, content: content.slice(0, 1000) }))) }),
      });

      if (cancelled()) return;
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please try later.');
        }

        if (response.status === 503) {
          throw new Error(
            'NEXUS Live is not enabled or configured on Netlify.'
          );
        }

        throw new Error(
          'Gemini Live connection failed. HTTP ' + response.status
        );
      }

      const data: { token: string; model: string } =
        await response.json();

      if (cancelled()) return;

      const ai = new GoogleGenAI({
        apiKey: data.token,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      const liveSession = await ai.live.connect({
        model: data.model,
        config: {
          responseModalities: [Modality.AUDIO],
          tools: NEXUS_RESEARCH_TOOLS,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          // Instructions and voice configuration are constrained by the server token.
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
            if (!cancelled()) setStatus('listening');
          },
          onmessage: (message) => {
            if (cancelled()) return;

            voiceResearch.handle(message, sessionRef.current);
            const content = message.serverContent;

            if (content?.interrupted) {
            if (assistantTurn.current) assistantTurn.current += ' [interrupted]';
            flushTranscript();
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
              userTurn.current = (userTurn.current + text).slice(-20000);
            setHeard(userTurn.current);
              setSubtitle('');
              setTopic(topicFromText(text));
            }

            if (content?.outputTranscription?.text) {
              const text = content.outputTranscription.text;
            assistantTurn.current = (assistantTurn.current + text).slice(-20000);

              setSubtitle((previous) =>
                (previous + text).slice(-900)
              );

              spokenRef.current =
                (spokenRef.current + text).slice(-1200);

              const namedTopics = Array.from(
                spokenRef.current.matchAll(
                  /software|applications?|cloud|azure|infrastructure|kubernetes|devops|artificial intelligence|\bai\b|education|learning|school|business|digital transformation|road funding gap|road maintenance|road infrastructure|rfg/gi
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
            flushTranscript();
              if (greetingPendingRef.current) {
                greetingFinishedRef.current = true;
              }

              if (playbackRef.current.size === 0) {
                if (greetingPendingRef.current) {
                }
                greetingPendingRef.current = false;
                setStatus('listening');
              }
            }
          },
          onerror: () => {
            if (cancelled()) return;
            disconnect();
            setStatus('error');
            setError('The live connection encountered an error.');
          },
          onclose: () => {
            if (cancelled()) return;
            disconnect();
            setError('The voice session ended. You can reconnect.');
          },
        },
      });

      if (cancelled()) {
        liveSession.close();
        return;
      }

      sessionRef.current = liveSession;
      startingRef.current = false;

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
      if (cancelled()) return;
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
        className="snx-live-shell snx-nexus-immersive"
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
          <div className={
            voiceResearch.state.phase === 'idle'
              ? 'nx-research-stage'
              : 'nx-research-stage has-research'
          }>
          <NexusVoiceHud
            state={status}
            topic={topic}
            subtitle={subtitle}
            heard={heard}
            analyser={analyserRef}
            reduced={!!reduced}
          >
            <NexusHologram
            state={status}
            topic={topic}
            reduced={!!reduced}
            analyser={analyserRef}
          />
          </NexusVoiceHud>
          <VoiceResearchPanel research={voiceResearch.state} />
          </div>

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
