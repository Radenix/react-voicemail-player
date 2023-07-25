import { useState, useEffect } from "react";

/**
 * Downloads the resource at the given `url` as a `Blob`
 */
export default function useAudioBlob(url: string): Blob | null {
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    fetch(url, { signal: abortController.signal })
      .then((response) => response.blob())
      .then(setBlob)
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("[react-voicemail-player]: loading audio cancelled");
          return;
        }
        console.error(
          "[react-voicemail-player]: failed to load audio at " + url,
          error
        );
      });

    return () => abortController.abort();
  }, [url]);

  return blob;
}
