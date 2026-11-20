'use client';
// NEXUS_VOICE_RESEARCH_V1
import { NEXUS_RESEARCH_TOOLS } from '@/lib/nexus-research-tools';
import {
  useVoiceCompanyResearch,
  VoiceResearchPanel,
  type ResearchNarration,
} from './voice-company-research';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
// NEXUS_SINGLE_COMPANY_INPUT_V1
import {
  SMARTNET_TYPED_GREETING as SMARTNET_LIVE_GREETING,
} from '@/lib/nexus-visual-scenes';
import { useReducedMotion } from 'motion/react';
import { Mic, MicOff, PhoneOff, X } from 'lucide-react';
import { NexusTextConsole } from './nexus-text-console';
// NEXUS_VOICE_HUD_V1
import { NexusLiveStage } from './nexus-live-stage';
// NEXUS_SPOKEN_RESEARCH_V6
import { NexusCompanySearch } from './nexus-company-search';
import { NexusHandoverForm } from './nexus-handover-form';
import './nexus-research-flow.css';
// NEXUS_RESEARCH_OVERLAY_V1
import { NEXUS_SCENES, type NexusSceneAction } from '@/lib/nexus-visual-scenes';
import { companyContext, nexusHeaders, recordMessage, visitorState } from '@/lib/nexus-visitor';

import {
  type HologramTopic,
  type VoiceState,
} from './nexus-hologram';

type LiveSession =
  Awaited<ReturnType<GoogleGenAI['live']['connect']>>;

const IDLE_WARNING_MS = 25_000;
const IDLE_TIMEOUT_MS = 40_000;


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
  const [, setTopic] = useState<HologramTopic>('general');
  const [subtitle, setSubtitle] = useState('');
  const [heard, setHeard] = useState('');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');
  const [idleNotice, setIdleNotice] = useState('');
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number | null>(null);

  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scene, setScene] = useState('');
  const pendingVisual = useRef<{ id: string; scene: string } | null>(null);
  const visualTimers = useRef(new Map<number, string>());
  const visualCalls = useRef(new Set<string>());

  const cancelPendingVisuals = useCallback(() => {
    pendingVisual.current = null;
    visualTimers.current.forEach((_, timer) => window.clearTimeout(timer));
    visualTimers.current.clear();
  }, []);

  const clearVisuals = useCallback(() => {
    cancelPendingVisuals();
    setScene('');
  }, [cancelPendingVisuals]);


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
  const assistantTurnFinishedRef = useRef(true);

  // NEXUS_COHESIVE_LAYOUT_V4
  const [researchVisible, setResearchVisible] = useState(false);
  // NEXUS_QUIET_RESEARCH_V5
  const [inputRequested, setInputRequested] = useState(false);
  const inputRequestedAtRef = useRef(0);
  const [inputOpen, setInputOpen] = useState(false);
  // NEXUS_HANDOVER_V1
  const [handoverRequested, setHandoverRequested] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverSummary, setHandoverSummary] = useState('');
  const handoverOpenRef = useRef(false);
  const handoverRequestedAtRef = useRef(0);
  const handoverCallsRef = useRef(new Set<string>());
  const overlayRef = useRef(false);
  const researchQuietRef = useRef(false);
  const discardedTurnRef = useRef(false);
  const invitationAudioSeenRef = useRef(false);
  const lastOutputAtRef = useRef(0);
  const microphoneMutedRef = useRef(false);
  const pausedToolCallsRef = useRef(new Set<string>());
  const lastUserAudio = useRef(0);
  const lastActivityAtRef = useRef(0);
  const lastPlaybackEndedAtRef = useRef(0);
  const bargeInFramesRef = useRef(0);
  const bargeInUntilRef = useRef(0);
  const interruptCheckTimerRef = useRef<number | null>(null);
  const lastInterruptPromptAtRef = useRef(0);
  const narrationQueue = useRef<ResearchNarration[]>([]);
  const queueNarration = useCallback((item: ResearchNarration) => {
    narrationQueue.current.push(item);
  }, []);
  const voiceResearch = useVoiceCompanyResearch(queueNarration);
  const researchRunning = voiceResearch.state.phase === 'running';
  const companyInputVisible = inputOpen && !researchRunning && !handoverOpen;
  const overlayActive = companyInputVisible || handoverOpen;

  const closeCompanyInput = useCallback(() => {
    setInputOpen(false);
    setInputRequested(false);
    lastActivityAtRef.current = Date.now();
    if (!handoverOpenRef.current) {
      overlayRef.current = false;
      if (!researchQuietRef.current && !discardedTurnRef.current) {
        streamRef.current?.getAudioTracks().forEach(track => {
          track.enabled = !microphoneMutedRef.current;
        });
      }
    }
  }, []);

  const closeHandover = useCallback(() => {
    handoverOpenRef.current = false;
    overlayRef.current = false;
    setHandoverOpen(false);
    setHandoverRequested(false);
    lastActivityAtRef.current = Date.now();
    if (!researchQuietRef.current && !discardedTurnRef.current) {
      streamRef.current?.getAudioTracks().forEach(track => {
        track.enabled = !microphoneMutedRef.current;
      });
    }
  }, []);

  const openHandover = useCallback((summaryOverride?: string) => {
    if (typeof summaryOverride === 'string' && summaryOverride.trim()) {
      setHandoverSummary(summaryOverride.trim().slice(0, 2000));
    }
    handoverOpenRef.current = true;
    overlayRef.current = true;
    setInputOpen(false);
    setInputRequested(false);
    setHandoverRequested(false);
    setHandoverOpen(true);
    clearVisuals();
    playbackRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    playbackRef.current.clear();
    playTimeRef.current = outputContextRef.current?.currentTime ?? 0;
    flushTranscript();
    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
    try {
      sessionRef.current?.sendRealtimeInput({ audioStreamEnd: true });
    } catch {}
    setStatus(current => (current === 'speaking' ? 'listening' : current));
  }, [clearVisuals, flushTranscript]);

  const openCompanyInput = useCallback(() => {
    if (
      !sessionRef.current || closingRef.current ||
      researchQuietRef.current || discardedTurnRef.current
    ) return;

    // Latch the input open. Later status changes cannot hide it.
    overlayRef.current = true;
    setInputOpen(true);
    setInputRequested(false);
    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
    try {
      sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
    } catch {}
  }, []);

  useEffect(() => {
    microphoneMutedRef.current = muted;
    overlayRef.current = overlayActive;
    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled =
        !muted && !overlayActive && !researchRunning &&
        !researchQuietRef.current && !discardedTurnRef.current;
    });
  }, [overlayActive, muted, researchRunning, status]);

  useEffect(() => {
    if (!handoverRequested || handoverOpen) return;

    const timer = window.setInterval(() => {
      if (closingRef.current || discardedTurnRef.current) return;
      const doneSpeaking =
        assistantTurnFinishedRef.current && playbackRef.current.size === 0;
      if (!doneSpeaking) return;

      const settled = invitationAudioSeenRef.current
        ? Date.now() - lastOutputAtRef.current >= 450
        : Date.now() - handoverRequestedAtRef.current >= 2200;
      if (!settled) return;

      openHandover();
    }, 100);

    return () => window.clearInterval(timer);
  }, [handoverRequested, handoverOpen, openHandover]);

  useEffect(() => {
    if (!inputRequested || inputOpen || researchRunning) return;

    const timer = window.setInterval(() => {
      if (
        closingRef.current || researchQuietRef.current ||
        discardedTurnRef.current || greetingPendingRef.current
      ) return;

      const doneSpeaking =
        assistantTurnFinishedRef.current && playbackRef.current.size === 0;
      if (!doneSpeaking) return;

      const settled = invitationAudioSeenRef.current
        ? Date.now() - lastOutputAtRef.current >= 450
        : Date.now() - inputRequestedAtRef.current >= 1400;
      if (!settled) return;

      openCompanyInput();
    }, 100);

    return () => window.clearInterval(timer);
  }, [inputRequested, inputOpen, researchRunning, openCompanyInput]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      narrationQueue.current = narrationQueue.current.filter(item => item.current());
      const session = sessionRef.current;
      if (
        !session || closingRef.current ||
        status !== 'listening' ||
        !assistantTurnFinishedRef.current ||
        playbackRef.current.size > 0 ||
        overlayRef.current ||
        discardedTurnRef.current ||
        Date.now() - lastUserAudio.current < 1800
      ) return;

      // During research, only explicit interludes may speak.
      // Afterwards, only the result may speak.
      const nextIndex = narrationQueue.current.findIndex(item =>
        researchQuietRef.current
          ? item.duringResearch === true
          : item.duringResearch !== true
      );
      if (nextIndex < 0) return;

      const item = narrationQueue.current.splice(nextIndex, 1)[0];
      if (!item || !item.current()) return;

      flushTranscript();
      setSubtitle('');
      spokenRef.current = '';
      assistantTurnFinishedRef.current = false;
      setStatus('speaking');

      try {
        session.sendClientContent({
          turns: [{
            role: 'user',
            parts: [{
              text: 'APPLICATION RESEARCH UPDATE. ' + item.text,
            }],
          }],
          turnComplete: true,
        });
      } catch {
        assistantTurnFinishedRef.current = true;
        setStatus('listening');
        setError('The research update remains available on screen.');
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [status, flushTranscript]);
  const cancelResearch = voiceResearch.cancelAll;

  const disconnect = useCallback(() => {
    researchQuietRef.current = false;
    discardedTurnRef.current = false;
    invitationAudioSeenRef.current = false;
    pausedToolCallsRef.current.clear();
    setResearchVisible(false);
    setSubtitle('');
    setHeard('');
    narrationQueue.current = [];
    closeHandover();
    closeCompanyInput();
    handoverCallsRef.current.clear();
    clearVisuals();
    visualCalls.current.clear();
    cancelResearch();
    closingRef.current = true;
    assistantTurnFinishedRef.current = true;
    attemptRef.current += 1;
    startingRef.current = false;
    flushTranscript();
    greetingPendingRef.current = false;
    greetingFinishedRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (interruptCheckTimerRef.current !== null) {
      window.clearTimeout(interruptCheckTimerRef.current);
      interruptCheckTimerRef.current = null;
    }
    bargeInFramesRef.current = 0;
    bargeInUntilRef.current = 0;
    lastPlaybackEndedAtRef.current = 0;

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
    setIdleSecondsLeft(null);
    spokenRef.current = '';
  }, [flushTranscript, cancelResearch, clearVisuals, closeCompanyInput, closeHandover]);

  // Automatically close listening after sustained silence so the mic never stays open indefinitely
  useEffect(() => {
    const canCountIdle =
      status === 'listening' &&
      !muted &&
      !overlayActive &&
      !researchRunning;

    if (!canCountIdle) return;

    lastActivityAtRef.current = Date.now();

    const timer = window.setInterval(() => {
      if (
        closingRef.current ||
        overlayRef.current ||
        researchQuietRef.current ||
        microphoneMutedRef.current ||
        greetingPendingRef.current ||
        playbackRef.current.size > 0 ||
        !assistantTurnFinishedRef.current
      ) {
        lastActivityAtRef.current = Date.now();
        setIdleSecondsLeft(null);
        return;
      }

      const lastSignal = Math.max(
        lastActivityAtRef.current,
        lastUserAudio.current,
        lastOutputAtRef.current
      );
      const silentMs = Date.now() - lastSignal;

      if (silentMs >= IDLE_TIMEOUT_MS) {
        setIdleSecondsLeft(null);
        setIdleNotice(
          'Listening closed after inactivity. Click Start conversation whenever you want to continue.'
        );
        disconnect();
        return;
      }

      if (silentMs >= IDLE_WARNING_MS) {
        const remaining = Math.max(
          1,
          Math.ceil((IDLE_TIMEOUT_MS - silentMs) / 1000)
        );
        setIdleSecondsLeft(remaining);
      } else {
        setIdleSecondsLeft(null);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [status, muted, overlayActive, researchRunning, disconnect]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, []);

  function choosePrompt(
    prompt: string,
    action?: NexusSceneAction,
    targetScene?: string
  ) {
    if (action === 'open-handover') {
      openHandover();
      return;
    }
    if (action === 'open-research') {
      openCompanyInput();
      return;
    }
    const session = sessionRef.current;
    if (
      !session || closingRef.current ||
      researchQuietRef.current || discardedTurnRef.current
    ) return;

    invitationAudioSeenRef.current = false;
    assistantTurnFinishedRef.current = false;
    closeCompanyInput();
    clearVisuals();
    if (targetScene && Object.hasOwn(NEXUS_SCENES, targetScene)) {
      setScene(targetScene);
    }
    if (timerRef.current === null) return;
    playbackRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    playbackRef.current.clear();
    playTimeRef.current = outputContextRef.current?.currentTime ?? 0;
    flushTranscript();
    userTurn.current = prompt;
    setHeard(prompt);
    setSubtitle('');
    spokenRef.current = '';
    setStatus('listening');

    try {
      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: prompt }] }],
        turnComplete: true,
      });
    } catch {
      setError('Could not send that choice. Please try speaking it.');
    }
  }

  function playAudio(base64: string) {
    if (
      overlayRef.current || discardedTurnRef.current
    ) return;

    invitationAudioSeenRef.current = true;
    lastOutputAtRef.current = Date.now();
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

    const cue = pendingVisual.current;
    if (cue) {
      pendingVisual.current = null;
      const timer = window.setTimeout(() => {
        visualTimers.current.delete(timer);
        if (!closingRef.current) setScene(cue.scene === 'clear' ? '' : cue.scene);
      }, Math.max(0, (startAt - context.currentTime) * 1000));
      visualTimers.current.set(timer, cue.id);
    }

    source.start(startAt);
    playTimeRef.current = startAt + buffer.duration;

    playbackRef.current.add(source);

    source.onended = () => {
      playbackRef.current.delete(source);
      if (playbackRef.current.size === 0) {
        lastPlaybackEndedAtRef.current = Date.now();
      }

      if (playbackRef.current.size === 0 && assistantTurnFinishedRef.current) {
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
    invitationAudioSeenRef.current = false;
    assistantTurnFinishedRef.current = false;
    discardedTurnRef.current = false;
    lastOutputAtRef.current = Date.now();
    setInputRequested(false);
    const attempt = ++attemptRef.current;
    const cancelled = () => closingRef.current || attempt !== attemptRef.current;

    setStatus('connecting');
    setError('');
    setIdleNotice('');
    setIdleSecondsLeft(null);
    lastActivityAtRef.current = Date.now();
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
            if (!cancelled()) setStatus('connecting');
          },
          onmessage: (message) => {
            if (cancelled()) return;

            if (
              overlayRef.current || discardedTurnRef.current
            ) {
              const pausedContent = message.serverContent;
              const hasOutput =
                Boolean(pausedContent?.outputTranscription?.text) ||
                Boolean(pausedContent?.modelTurn?.parts?.some(
                  part => Boolean(part.inlineData?.data)
                ));

              if (hasOutput) {
                discardedTurnRef.current = true;
                assistantTurnFinishedRef.current = false;
              }

              const calls = (message.toolCall?.functionCalls ?? []).filter(
                call => call.id && !pausedToolCallsRef.current.has(call.id)
              );

              if (calls.length) {
                discardedTurnRef.current = true;
                assistantTurnFinishedRef.current = false;
                calls.forEach(call => {
                  if (call.id) pausedToolCallsRef.current.add(call.id);
                });
                try {
                  sessionRef.current?.sendToolResponse({
                    functionResponses: calls.map(call => ({
                      id: call.id,
                      name: call.name,
                      response: {
                        status: 'interaction_paused',
                        instruction:
                          'The application is collecting typed input or ' +
                          'researching. Do not speak or call further tools. ' +
                          'Wait for the next application or visitor message.',
                      },
                    })),
                  });
                } catch {}
              }

              if (pausedContent?.turnComplete || pausedContent?.interrupted) {
                discardedTurnRef.current = false;
                assistantTurnFinishedRef.current = true;
                if (!researchQuietRef.current && !overlayRef.current) {
                  streamRef.current?.getAudioTracks().forEach(track => {
                    track.enabled = !microphoneMutedRef.current;
                  });
                  setStatus('listening');
                }
              }
              return;
            }

            const cancelledVisuals = message.toolCallCancellation?.ids ?? [];
            if (pendingVisual.current && cancelledVisuals.includes(pendingVisual.current.id)) {
              pendingVisual.current = null;
            }
            visualTimers.current.forEach((id, timer) => {
              if (cancelledVisuals.includes(id)) {
                window.clearTimeout(timer);
                visualTimers.current.delete(timer);
              }
            });

            for (const call of message.toolCall?.functionCalls ?? []) {
              if (call.name !== 'present_visual' || !call.id) continue;
              if (visualCalls.current.has(call.id)) continue;
              const session = sessionRef.current;
              if (!session) continue;
              visualCalls.current.add(call.id);
              const requested = call.args?.scene;
              const valid = typeof requested === 'string' &&
                (requested === 'clear' || Object.hasOwn(NEXUS_SCENES, requested));

              if (valid) {
                if (requested === 'research' && !voiceResearch.isRunning()) {
                  invitationAudioSeenRef.current = false;
                  assistantTurnFinishedRef.current = false;
                  lastOutputAtRef.current = Date.now();
                  inputRequestedAtRef.current = Date.now();
                  setInputRequested(true);
                }
                pendingVisual.current = { id: call.id, scene: requested as string };
              }
              try {
                session.sendToolResponse({
                  functionResponses: [{
                    id: call.id,
                    name: call.name,
                    response: {
                      status: valid ? 'queued_for_next_audio' : 'invalid_scene',
                      instruction: valid
                        ? 'Continue your spoken explanation now. The approved scene will appear with the next audio.'
                        : 'Continue speaking without claiming that a visual was displayed.',
                    },
                  }],
                });
              } catch {
                pendingVisual.current = null;
              }
            }

            for (const call of message.toolCall?.functionCalls ?? []) {
              if (call.name !== 'offer_followup' || !call.id) continue;
              if (handoverCallsRef.current.has(call.id)) continue;
              const session = sessionRef.current;
              if (!session) continue;
              handoverCallsRef.current.add(call.id);

              const mode = call.args?.mode === 'open' ? 'open' : 'offer';
              const drafted =
                typeof call.args?.summary === 'string'
                  ? call.args.summary.trim().slice(0, 2000)
                  : '';
              if (drafted) setHandoverSummary(drafted);

              if (mode === 'open') {
                invitationAudioSeenRef.current = false;
                assistantTurnFinishedRef.current = false;
                lastOutputAtRef.current = Date.now();
                handoverRequestedAtRef.current = Date.now();
                setHandoverRequested(true);
              } else {
                setResearchVisible(false);
                pendingVisual.current = { id: call.id, scene: 'followup' };
                const fallbackTimer = window.setTimeout(() => {
                  visualTimers.current.delete(fallbackTimer);
                  if (!closingRef.current && !overlayRef.current) {
                    setScene('followup');
                  }
                }, 900);
                visualTimers.current.set(fallbackTimer, call.id);
              }

              try {
                session.sendToolResponse({
                  functionResponses: [{
                    id: call.id,
                    name: call.name,
                    response: {
                      status:
                        mode === 'open'
                          ? 'opening_handover_after_speech'
                          : 'followup_offered',
                      instruction:
                        mode === 'open'
                          ? 'Briefly tell the visitor you are opening the short follow-up form so they can check the summary and share their contact details, then stop speaking. Never claim a call is booked or an enquiry is saved.'
                          : 'Finish asking if they would like someone from SmartNet to contact them to discuss next steps, then pause for their choice.',
                    },
                  }],
                });
              } catch {}
            }

            voiceResearch.handle(message, sessionRef.current);
            const content = message.serverContent;

            if (content?.interrupted) {
              const interruptedExcerpt = assistantTurn.current.trim().slice(-240);
              assistantTurnFinishedRef.current = true;
              cancelPendingVisuals();
              bargeInFramesRef.current = 0;
              setSubtitle('');
              spokenRef.current = '';
              if (assistantTurn.current) assistantTurn.current += ' [interrupted]';
              flushTranscript();
              playbackRef.current.forEach((source) => {
                try { source.stop(); } catch {}
              });

              playbackRef.current.clear();
              lastPlaybackEndedAtRef.current = Date.now();
              playTimeRef.current =
                outputContextRef.current?.currentTime ?? 0;
              setStatus('listening');

              if (interruptCheckTimerRef.current !== null) {
                window.clearTimeout(interruptCheckTimerRef.current);
                interruptCheckTimerRef.current = null;
              }

              const now = Date.now();
              if (
                interruptedExcerpt &&
                now - lastInterruptPromptAtRef.current >= 8000
              ) {
                interruptCheckTimerRef.current = window.setTimeout(() => {
                  interruptCheckTimerRef.current = null;
                  const session = sessionRef.current;
                  if (
                    !session ||
                    closingRef.current ||
                    overlayRef.current ||
                    researchQuietRef.current ||
                    discardedTurnRef.current ||
                    !assistantTurnFinishedRef.current ||
                    playbackRef.current.size > 0
                  ) {
                    return;
                  }
                  // If the visitor actually spoke a real phrase, let Gemini reply normally.
                  if (userTurn.current.trim().length >= 4) return;
                  if (Date.now() - lastUserAudio.current < 850) return;

                  lastInterruptPromptAtRef.current = Date.now();
                  bargeInUntilRef.current = 0;
                  assistantTurnFinishedRef.current = false;
                  setStatus('speaking');

                  try {
                    session.sendClientContent({
                      turns: [{
                        role: 'user',
                        parts: [{
                          text:
                            'APPLICATION INTERRUPTION CHECK. You were interrupted mid-sentence while saying: "' +
                            interruptedExcerpt.replace(/"/g, "'") +
                            '". No clear visitor question followed. Politely ask in ONE brief, warm sentence whether they were about to say something or if they would like you to continue, then pause and wait.',
                        }],
                      }],
                      turnComplete: true,
                    });
                  } catch {
                    assistantTurnFinishedRef.current = true;
                    setStatus('listening');
                  }
                }, 1600);
              }
            }

            if (content?.inputTranscription?.text) {
              lastUserAudio.current = Date.now();
              lastActivityAtRef.current = Date.now();
              invitationAudioSeenRef.current = false;
              assistantTurnFinishedRef.current = false;
              const text = content.inputTranscription.text;
              userTurn.current = (userTurn.current + text).slice(-20000);
              if (
                userTurn.current.trim().length >= 4 &&
                interruptCheckTimerRef.current !== null
              ) {
                window.clearTimeout(interruptCheckTimerRef.current);
                interruptCheckTimerRef.current = null;
              }
            setHeard(userTurn.current);
              setSubtitle('');
              setTopic(topicFromText(text));
            }

            if (content?.outputTranscription?.text) {
              const text = content.outputTranscription.text;
            assistantTurn.current = (assistantTurn.current + text).slice(-20000);

              setSubtitle((previous) =>
                (previous + text).slice(-20000)
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
                assistantTurnFinishedRef.current = false;
                setStatus('speaking');
                playAudio(part.inlineData.data);
              }
            }

            if (content?.turnComplete) {
              assistantTurnFinishedRef.current = true;
              const spokenSoFar = assistantTurn.current;
              flushTranscript();
              // Safety net: if NEXUS announces opening the handover form without firing the tool
              if (
                !handoverOpenRef.current &&
                !handoverRequested &&
                /opening (?:the )?(?:short )?(?:follow-up|handover|contact) form/i.test(
                  spokenSoFar
                )
              ) {
                handoverRequestedAtRef.current = Date.now();
                setHandoverRequested(true);
              }
              // Safety net: if NEXUS invites the visitor to enter their company name/website without firing present_visual("research")
              if (
                !overlayRef.current &&
                !researchQuietRef.current &&
                !inputRequested &&
                voiceResearch.state.phase === 'idle' &&
                /(?:enter|type) your company name or website/i.test(spokenSoFar)
              ) {
                inputRequestedAtRef.current = Date.now();
                setInputRequested(true);
              }
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
              'Use present_visual with welcome before speaking. ' +
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
          greetingPendingRef.current ||
          overlayRef.current ||
          researchQuietRef.current ||
          discardedTurnRef.current ||
          microphoneMutedRef.current
        ) return;

        const samples = event.inputBuffer.getChannelData(0);
        let energy = 0;
        for (const sample of samples) energy += sample * sample;
        const rms = Math.sqrt(energy / samples.length);
        const now = Date.now();

        const assistantSpeaking =
          !assistantTurnFinishedRef.current ||
          playbackRef.current.size > 0 ||
          now - lastPlaybackEndedAtRef.current < 450;

        if (assistantSpeaking && now > bargeInUntilRef.current) {
          // Ignore speaker echo and brief ambient noise while NEXUS speaks;
          // require 2 consecutive deliberate speech frames (~256ms) to interrupt.
          if (rms > 0.068) {
            bargeInFramesRef.current += 1;
            if (bargeInFramesRef.current >= 2) {
              bargeInUntilRef.current = now + 2600;
            } else {
              return;
            }
          } else {
            bargeInFramesRef.current = 0;
            return;
          }
        } else if (!assistantSpeaking) {
          bargeInFramesRef.current = 0;
        }

        if (rms > 0.028) {
          lastUserAudio.current = now;
          lastActivityAtRef.current = now;
        }

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
    if (
      overlayRef.current || researchQuietRef.current ||
      discardedTurnRef.current
    ) return;
    microphoneMutedRef.current = !muted;
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

    lastActivityAtRef.current = Date.now();
    setMuted(!muted);
  }

  async function searchCompany(
    company: string,
    website: string,
    location: string
  ) {
    const session = sessionRef.current;
    if (!session || closingRef.current) {
      throw new Error('Start a voice conversation before searching.');
    }

    if (researchQuietRef.current) return;
    const researchAttempt = attemptRef.current;
    researchQuietRef.current = true;
    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
    closeCompanyInput();
    narrationQueue.current = [];
    // A deliberate form submission takes priority over current playback.
    clearVisuals();
    playbackRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    playbackRef.current.clear();
    playTimeRef.current = outputContextRef.current?.currentTime ?? 0;
    flushTranscript();
    setSubtitle('');
    spokenRef.current = '';
    setResearchVisible(true);
    setScene('');
    setStatus('listening');

    try {
      await voiceResearch.startManual(company, website, location, session);
    } finally {
      if (
        !closingRef.current &&
        researchAttempt === attemptRef.current
      ) {
        researchQuietRef.current = false;
        streamRef.current?.getAudioTracks().forEach(track => {
          track.enabled =
            !microphoneMutedRef.current &&
            !overlayRef.current &&
            !discardedTurnRef.current;
        });
        setStatus('listening');
      }
    }
  }

  function closeExperience() {
    disconnect();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="nx-live-dialog"
      aria-labelledby="nx-live-title"
      onCancel={(event) => {
        event.preventDefault();
        if (handoverOpen) closeHandover();
        else if (companyInputVisible) closeCompanyInput();
        else closeExperience();
      }}
    >
      <header className="nx-live-header">
        <div>
          <span>SMARTNET TECHNOLOGIES · AI CONSULTANT</span>
          <strong id="nx-live-title">NEXUS</strong>
        </div>
        <button type="button" onClick={closeExperience} aria-label="Close NEXUS">
          <X size={22} />
        </button>
      </header>

      <div className={`nx-live-body ${overlayActive ? 'nx-focus-active' : ''}`}>
        <div className="nx-scene-content" inert={overlayActive}>
        <NexusLiveStage
          state={status}
          scene={scene}
          subtitle={subtitle}
          heard={heard}
          analyser={analyserRef}
          reduced={!!reduced}
          active={status === 'listening' || status === 'speaking'}
          researching={voiceResearch.state.phase === 'running'}
          researchPhase={voiceResearch.state.phase}
          inputActive={overlayActive}
          handoverActive={handoverOpen}
          showResearch={researchVisible}
          onDismissResearch={() => {
            setResearchVisible(false);
            setScene('');
          }}
          research={
            <VoiceResearchPanel
              research={voiceResearch.state}
              onConfirmMatch={() =>
                choosePrompt(
                  'Yes, that is my company. Please briefly explain how SmartNet Technologies can assist and ask if I have any other query.'
                )
              }
              onDifferentQuery={() => {
                setResearchVisible(false);
                choosePrompt(
                  'I have a specific challenge or query for my company that I want to discuss with SmartNet.'
                );
              }}
              onOpenHandover={() => openHandover()}
            />
          }
          onChoose={choosePrompt}
        />

        <details className="nx-live-text">
          <summary>Prefer typing?</summary>
          <NexusTextConsole
            disabled={status !== 'idle' && status !== 'error'}
            onTopic={setTopic}
          />
        </details>
        </div>
        <NexusCompanySearch
          active={companyInputVisible}
          running={voiceResearch.state.phase === 'running'}
          onSearch={searchCompany}
          onCancel={voiceResearch.cancelAll}
          onDismiss={() => closeCompanyInput()}
        />
        {handoverOpen && (
          <NexusHandoverForm
            initialCompany={visitorState().company}
            initialWebsite={visitorState().website}
            initialSummary={handoverSummary || visitorState().brief}
            onDismiss={closeHandover}
            onCloseAll={closeExperience}
          />
        )}
      </div>

      <footer className="nx-live-footer">
        {error && <p className="nx-live-error" role="alert">{error}</p>}
        {!error && idleNotice && status === 'idle' && (
          <p className="nx-idle-notice" role="status">{idleNotice}</p>
        )}
        {status === 'listening' &&
          !muted &&
          !overlayActive &&
          !researchRunning &&
          idleSecondsLeft !== null && (
            <div className="nx-idle-warning" role="status" aria-live="polite">
              <span>
                No speech detected — closing mic in{' '}
                <strong>{idleSecondsLeft}s</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  lastActivityAtRef.current = Date.now();
                  lastUserAudio.current = Date.now();
                  setIdleSecondsLeft(null);
                }}
              >
                Keep listening
              </button>
            </div>
          )}
        <div className="nx-live-controls">
          {status === 'idle' || status === 'error' ? (
            <button type="button" className="nx-live-start" onClick={startConversation}>
              <Mic size={18} /> Start conversation
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleMicrophone}
                disabled={
                  status === 'connecting' ||
                  researchRunning || overlayActive
                }
                aria-pressed={muted}
              >
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
                {researchRunning || overlayActive
                  ? 'Microphone paused'
                  : muted ? 'Unmute' : 'Mute'}
              </button>
              {!researchVisible &&
                ['done', 'error', 'cancelled'].includes(voiceResearch.state.phase) &&
                !companyInputVisible && (
                  <button
                    type="button"
                    onClick={() => setResearchVisible(true)}
                  >
                    Show research
                  </button>
                )}
              {voiceResearch.state.phase === 'running' ? (
                <button type="button" onClick={voiceResearch.cancelAll}>
                  Cancel research
                </button>
              ) : (
                <button
                  type="button"
                  disabled={status !== 'listening'}
                  onClick={() => {
                    if (companyInputVisible) closeCompanyInput();
                    else openCompanyInput();
                  }}
                >
                  {companyInputVisible ? 'Dismiss input' : 'Research company'}
                </button>
              )}
              <button type="button" onClick={disconnect}>
                <PhoneOff size={18} /> End conversation
              </button>
            </>
          )}
          <button
            type="button"
            className="nx-team-trigger"
            disabled={status === 'connecting'}
            onClick={() => {
              if (handoverOpen) closeHandover();
              else openHandover();
            }}
          >
            {handoverOpen ? 'Back to NEXUS' : 'Talk to our team'}
          </button>
        </div>
        <small className="nx-live-privacy">
          Microphone access starts only when you choose to begin. Audio is processed by Google Gemini Live.
          Conversations, company lookups, and approximate location are logged to help SmartNet review enquiries.
        </small>
      </footer>
    </dialog>
  );
}
