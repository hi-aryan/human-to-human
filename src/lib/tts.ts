const HUME_API_URL = "https://api.hume.ai/v0/tts";

interface TTSResponse {
  generations: Array<{
    audio: string; // base64 encoded audio
    duration: number; // duration in seconds
  }>;
}

// Check if string is a UUID format
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function textToSpeech(
  text: string,
  voiceId: string,
  apiKey?: string
): Promise<{ audio: string; durationMs: number }> {
  const key = apiKey ?? process.env.HUME_API_KEY;

  if (!key) {
    throw new Error("Hume API key is required. Set HUME_API_KEY env var or pass apiKey parameter.");
  }

  // Determine voice format: UUID or name
  // If it's a UUID, use id field. Otherwise, assume it's a Voice Library name and use name/provider
  const voiceSpec = isUUID(voiceId)
    ? { id: voiceId }
    : { name: voiceId, provider: "HUME_AI" };

  const response = await fetch(HUME_API_URL, {
    method: "POST",
    headers: {
      "X-Hume-Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "2",
      utterances: [
        {
          text,
          voice: voiceSpec,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[TTS API] Error response:", errorText);
    throw new Error(`Hume TTS API error (${response.status}): ${errorText}`);
  }

  const data: TTSResponse = await response.json();

  if (!data.generations || data.generations.length === 0) {
    throw new Error("No audio generated from Hume TTS API");
  }

  const { audio, duration } = data.generations[0];

  return {
    audio, // Pass base64 string directly
    durationMs: duration * 1000, // Convert seconds to milliseconds
  };
}
