import React, { useState, useLayoutEffect, useEffect } from "react";
import VoicemailPlayer from "../src/VoicemailPlayer";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <div className="theme-picker">
        <label htmlFor="theme-select">Choose a theme:</label>

        <select
          id="theme-select"
          value={theme}
          onChange={(event) =>
            setTheme(event.currentTarget.value as typeof theme)
          }
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="example-container">
        <ExampleWithSrc />
        <ExampleWithMultipleSources />
        <ExampleWithDynamicallyLoadedAudio />
        <ExampleWithLocalFileAudio />
      </div>
    </div>
  );
}

function ExampleWithSrc() {
  return (
    <>
      <h3>
        Audio with <code>src</code> attribute
      </h3>

      <VoicemailPlayer>
        {(audioRef) => <audio ref={audioRef} src="/audio/long.mp3" />}
      </VoicemailPlayer>
    </>
  );
}

function ExampleWithMultipleSources() {
  return (
    <>
      <h3>
        Audio with multiple <code>&lt;source&gt;</code> tags
      </h3>
      <VoicemailPlayer>
        {(audioRef) => (
          <audio ref={audioRef}>
            <source src="/audio/medium.mp3"></source>
            <source src="/audio/medium.wav"></source>
          </audio>
        )}
      </VoicemailPlayer>
    </>
  );
}

function ExampleWithDynamicallyLoadedAudio() {
  const remoteBlobUrl = useBlobUrl(useRemoteBlob("/audio/short.mp3"));

  return (
    <>
      <h3>Dynamically loaded audio</h3>
      <VoicemailPlayer className="orange-player">
        {(audioRef) => <audio ref={audioRef} src={remoteBlobUrl} />}
      </VoicemailPlayer>
    </>
  );
}

function ExampleWithLocalFileAudio() {
  const [localFile, setLocalFile] = useState<File | null>(null);
  const localFileUrl = useBlobUrl(localFile);

  return (
    <>
      <h3>Audio from local file</h3>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setLocalFile(e.target.files[0])}
      />

      <VoicemailPlayer>
        {(audioRef) => <audio ref={audioRef} src={localFileUrl} />}
      </VoicemailPlayer>
    </>
  );
}

function useRemoteBlob(source: string): Blob | null {
  const [remoteBlob, setRemoteBlob] = useState<Blob | null>(null);
  useEffect(() => {
    fetch(source)
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error(
          `Failed to fetch from ${source}. Response was ${response.status} ${response.statusText}`
        );
      })
      .then((blob) => {
        setRemoteBlob(blob);
      });
  }, [source]);

  return remoteBlob;
}

function useBlobUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>();
  useEffect(() => {
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      setUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [blob]);
  return url;
}
