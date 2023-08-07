import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
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
        <Basic />
        <MultiSource />
        <MuteUnmute />
        <PlaybackSpeed />
        <CustomStyle />
        <LocalFileAudio />
      </div>
    </div>
  );
}

function Basic() {
  return (
    <>
      <h3>Basic</h3>

      <VoicemailPlayer>
        {(audioRef) => <audio ref={audioRef} src="/audio/long.mp3" />}
      </VoicemailPlayer>
    </>
  );
}

function MultiSource() {
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

function MuteUnmute() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      <h3>
        Controlling <code>mute</code> attribute
      </h3>
      <button onClick={() => setIsMuted((muted) => !muted)}>
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <VoicemailPlayer>
        {(audioRef) => (
          <audio ref={audioRef} src="/audio/long.mp3" muted={isMuted} />
        )}
      </VoicemailPlayer>
    </>
  );
}

function PlaybackSpeed() {
  const myAudioRef = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState<number>(1);

  useEffect(() => {
    myAudioRef.current.playbackRate = speed;
  }, [speed]);

  return (
    <>
      <h3>Controlling playback speed</h3>
      <div className="my-player-wrapper">
        <VoicemailPlayer>
          {(setAudioNode) => (
            <audio
              ref={(node) => {
                setAudioNode(node);
                myAudioRef.current = node;
              }}
              src="/audio/long.mp3"
            />
          )}
        </VoicemailPlayer>
        <select
          value={String(speed)}
          onChange={(event) => {
            setSpeed(Number(event.currentTarget.value));
          }}
        >
          <option value="0.75">0.75</option>
          <option value="1">1</option>
          <option value="1.5">1.5</option>
          <option value="2">2</option>
        </select>
      </div>
    </>
  );
}

function CustomStyle() {
  return (
    <>
      <h3>Basic</h3>

      <VoicemailPlayer className="orange-player">
        {(audioRef) => <audio ref={audioRef} src="/audio/short.mp3" />}
      </VoicemailPlayer>
    </>
  );
}

function LocalFileAudio() {
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
