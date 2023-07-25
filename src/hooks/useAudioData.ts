import { useEffect, useState } from "react";

// since the decoded audio will only be used for visualization,
// the lowest sample rate should be enough
const SAMPLE_RATE = 8000;

/**
 * Decodes the audio data contained in `blob` into an `AudioBuffer`
 */
export default function useAudioData(blob: Blob): AudioBuffer | null {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (blob == null) {
      return;
    }

    blob
      .arrayBuffer()
      .then(decodeAudioData)
      .then((rawAudio) => setAudioBuffer(rawAudio))
      .catch((error) => {
        console.error(
          "[react-voicemail-player]: failed to decode audio",
          error
        );
      });
  }, [blob]);

  return audioBuffer;
}

function decodeAudioData(buffer: ArrayBuffer): Promise<AudioBuffer> {
  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
  return ctx.decodeAudioData(buffer).finally(() => ctx.close());
}
