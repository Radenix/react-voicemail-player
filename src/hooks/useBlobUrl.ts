import { useEffect, useState } from "react";
/**
 * Creates a URL for the given `blob`
 */
export default function useBlobUrl(blob: Blob | null): string {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      return;
    }

    const url = window.URL.createObjectURL(blob);
    setUrl(url);
    return () => window.URL.revokeObjectURL(url);
  }, [blob]);

  return url;
}
