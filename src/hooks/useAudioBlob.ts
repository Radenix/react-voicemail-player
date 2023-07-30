import { useState, useEffect } from "react";

/**
 * Downloads the source of the `audioElement` as a `Blob`
 */
export default function useAudioBlob(
  audioElement: HTMLAudioElement | null
): Blob | null {
  const audioUrl = useAudioSourceUrl(audioElement);
  const [result, setResult] = useState<Blob | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      return;
    }

    const abortController = new AbortController();
    fetch(audioUrl, { signal: abortController.signal })
      .then((response) => response.blob())
      .then((blob) => setResult(blob))
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("[react-voicemail-player]: loading audio cancelled");
          return;
        }
        console.error(
          "[react-voicemail-player]: failed to load audio at " + audioUrl,
          error
        );
      });

    return () => abortController.abort();
  }, [audioUrl]);

  return result;
}

/**
 * Returns the value of the audioElement's `currentSrc` property when and if
 * it becomes available AND if it is a URL that can be `fetch`ed
 */
function useAudioSourceUrl(audioElement: HTMLAudioElement | null) {
  const [result, setResult] = useState<string | null>(audioElement?.currentSrc);

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    const onLoadStart = () => {
      const url = tryParseUrl(audioElement.currentSrc);
      if (url && ["https:", "http:", "blob:"].includes(url.protocol)) {
        setResult(url.href);
      }
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
