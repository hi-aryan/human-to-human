import { useState, useCallback, useRef, useEffect } from "react";
import type { TTSResponseMessage } from "@/types/messages";

type TTSState = "idle" | "loading" | "playing" | "error";

interface UseTTSOptions {
  sendMessage: (msg: { type: string; text: string; requestId: string }) => void;
}

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function useTTS({ sendMessage }: UseTTSOptions) {
  const [state, setState] = useState<TTSState>("idle");
  
  // Use refs for stable access to values that change
  const stateRef = useRef(state);
  const sendMessageRef = useRef(sendMessage);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const textByRequestIdRef = useRef<Map<string, string>>(new Map());
  
  // Cache for decoded audio buffers (per hook instance, keyed by text)
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  // Cache for prerecorded audio (keyed by URL)
  const prerecordedCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Initialize AudioContext lazily (requires user interaction)
  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error("Failed to create AudioContext:", error);
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  // Stop current playback - stable function (no dependencies)
  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (error) {
        // Source may already be stopped
      }
      currentSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Use ref instead of state in dependency
    if (stateRef.current === "playing" || stateRef.current === "loading") {
      setState("idle");
    }
    currentRequestIdRef.current = null;
  }, []); // Empty deps - stable!

  // Play audio from AudioBuffer - stable function
  const playAudio = useCallback(
    async (audioBuffer: AudioBuffer) => {
      const audioContext = getAudioContext();
      if (!audioContext) {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      // Resume context if suspended (required after user interaction)
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // Stop any currently playing audio
      stop();

      try {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
          setState("idle");
          currentSourceRef.current = null;
          currentRequestIdRef.current = null;
        };

        source.start(0);
        currentSourceRef.current = source;
        setState("playing");
      } catch (error) {
        console.error("Failed to play audio:", error);
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    },
    [getAudioContext, stop]
  );

  // Handle TTS response message - stable function
  const handleTTSResponse = useCallback(
    (msg: TTSResponseMessage) => {
      // Ignore if this isn't our request
      if (msg.requestId !== currentRequestIdRef.current) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (msg.error) {
        console.error("TTS error:", msg.error);
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        currentRequestIdRef.current = null;
        textByRequestIdRef.current.delete(msg.requestId);
        return;
      }

      // Get the text for this request to use as cache key
      const text = textByRequestIdRef.current.get(msg.requestId);
      if (!text) {
        console.warn("TTS response received but text not found for request:", msg.requestId);
        currentRequestIdRef.current = null;
        return;
      }

      // Check cache first (keyed by text)
      const cacheKey = text.trim().toLowerCase();
      const cached = audioCacheRef.current.get(cacheKey);
      if (cached) {
        playAudio(cached);
        textByRequestIdRef.current.delete(msg.requestId);
        return;
      }

      // Decode and cache
      const audioContext = getAudioContext();
      if (!audioContext) {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        currentRequestIdRef.current = null;
        textByRequestIdRef.current.delete(msg.requestId);
        return;
      }

      try {
        const arrayBuffer = base64ToArrayBuffer(msg.audio);
        audioContext.decodeAudioData(arrayBuffer).then(
          (audioBuffer) => {
            audioCacheRef.current.set(cacheKey, audioBuffer);
            playAudio(audioBuffer);
            textByRequestIdRef.current.delete(msg.requestId);
          },
          (error) => {
            console.error("Failed to decode audio:", error);
            setState("error");
            setTimeout(() => setState("idle"), 3000);
            currentRequestIdRef.current = null;
            textByRequestIdRef.current.delete(msg.requestId);
          }
        );
      } catch (error) {
        console.error("Failed to convert base64 to ArrayBuffer:", error);
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        currentRequestIdRef.current = null;
        textByRequestIdRef.current.delete(msg.requestId);
      }
    },
    [getAudioContext, playAudio]
  );

  // Play prerecorded audio from URL - stable function
  const playPrerecordedAudio = useCallback(
    async (url: string) => {
      if (!url) return;

      // Stop any current playback
      stop();

      // Check cache first
      const cached = prerecordedCacheRef.current.get(url);
      if (cached) {
        await playAudio(cached);
        return;
      }

      // Set loading state
      setState("loading");

      try {
        // Fetch audio file
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioContext = getAudioContext();
        if (!audioContext) {
          setState("error");
          setTimeout(() => setState("idle"), 3000);
          return;
        }

        // Decode and cache
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        prerecordedCacheRef.current.set(url, audioBuffer);
        await playAudio(audioBuffer);
      } catch (error) {
        console.error("Failed to play prerecorded audio:", error);
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    },
    [getAudioContext, playAudio, stop]
  );

  // Speak text - stable function
  const speak = useCallback(
    (text: string) => {
      if (!text || text.trim().length === 0) return;

      // Stop any current playback
      stop();

      // Generate request ID
      const requestId = `tts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      currentRequestIdRef.current = requestId;
      
      // Store text for this request (for caching)
      textByRequestIdRef.current.set(requestId, text);

      // Set loading state
      setState("loading");

      // Set timeout (15 seconds)
      timeoutRef.current = window.setTimeout(() => {
        if (currentRequestIdRef.current === requestId) {
          setState("error");
          setTimeout(() => setState("idle"), 3000);
          currentRequestIdRef.current = null;
          textByRequestIdRef.current.delete(requestId);
        }
        timeoutRef.current = null;
      }, 15000);

      // Send request using ref to avoid stale closure
      sendMessageRef.current({
        type: "TTS_REQUEST",
        text: text.trim(),
        requestId,
      });
    },
    [stop] // Only stop as dependency, sendMessage via ref
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Clean up request tracking
      textByRequestIdRef.current.clear();
    };
  }, [stop]);

  return {
    state,
    speak,
    stop,
    handleTTSResponse,
    playPrerecordedAudio,
  };
}
