import { useEffect, useState } from "react";
import useAudioBlob from "./useAudioBlob";

// the decoded audio will only be used for visualization,
// so the lowest sample rate is enough (unless we try to
// render > 8000 bars in the visualization and the audio
// is less than a second long)
const SAMPLE_RATE = 8000;

/**
 * Loads the audio source (from disk cache because the browser has already
 * started loading it) and decodes the data into an `AudioBuffer`
 */
export default function useAudioData(
  audioElement: HTMLAudioElement | null
): AudioBuffer | null {
  const blob = useAudioBlob(audioElement);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (blob == null) {
      return;
    }

    blob
      .arrayBuffer()
      .then(decodeAudioData)
      .then((rawAudio) => {
        setAudioBuffer(rawAudio);
      })
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
