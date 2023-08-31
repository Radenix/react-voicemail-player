import { useEffect, useState } from "react";

// the decoded audio is only used for visualization,
// so the lowest sample rate is enough
const SAMPLE_RATE = 8000;

/**
 * Loads the audio source and decodes the data into an `AudioBuffer`.
 * Since we only fetch the data after the browser has started loading it,
 * no new network request is actually being send.
 */
export default function useAudioData(
  audioElement: HTMLAudioElement | null
): [AudioBuffer | null, Error | null] {
  const audioUrl = useAudioSourceUrl(audioElement);
  const [result, setResult] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      return;
    }

    const abortController = new AbortController();
    fetch(audioUrl, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load audio at ${audioUrl}. The server responded with ${response.status}: ${response.statusText}`
          );
        }

        return response.arrayBuffer();
      })
      .then((buffer) => {
        abortController.signal.throwIfAborted();
        return decodeAudioData(buffer);
      })
      .then((audioBuffer) => {
        abortController.signal.throwIfAborted();
        setResult(audioBuffer);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.debug(
            "[react-voicemail-player]: audio loading/decoding cancelled"
          );
          return;
        }
        console.error(`[react-voicemail-player]: ${err.message}`, err);
        setError(err);
      });

    return () => abortController.abort();
  }, [audioUrl]);

  return [result, error];
}

/**
 * Returns the value of the audioElement's `currentSrc` property when and if
 * it becomes available AND it is a URL that can be `fetch`ed
 */
function useAudioSourceUrl(audioElement: HTMLAudioElement | null) {
  const [result, setResult] = useState<string | null>();

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    const trySetUrl = () => {
      const url = tryParseUrl(audioElement.currentSrc);
      if (url && ["https:", "http:", "blob:"].includes(url.protocol)) {
        setResult(url.href);
        return true;
      }
      return false;
    };

    if (trySetUrl()) {
      return;
    }

    const onLoadStart = () => {
      trySetUrl();
    };
    audioElement.addEventListener("loadstart", onLoadStart);
    return () => audioElement.removeEventListener("loadstart", onLoadStart);
  }, [audioElement]);

  return result;
}

function tryParseUrl(str: string): URL | null {
  try {
    return new URL(str);
  } catch (error) {
    return null;
  }
}

function decodeAudioData(buffer: ArrayBuffer): Promise<AudioBuffer> {
  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
  return ctx.decodeAudioData(buffer).finally(() => ctx.close());
}
