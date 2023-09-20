import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import VoicemailPlayer from "../src/VoicemailPlayer";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);

  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const examples = [
    Basic,
    MultiSource,
    MuteUnmute,
    PlaybackSpeed,
    CustomStyle,
    LocalFileAudio,
  ];

  const SelectedExample = examples[selectedExampleIndex];

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
        <h2 id="example-list-title">Examples</h2>
        <div
          className="example-tablist"
          role="tablist"
          aria-labelledby="example-list-title"
        >
          {examples.map((fn, index) => (
            <button
              key={fn.name}
              id={`example-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selectedExampleIndex === index}
              aria-controls="example-tabpanel"
              onClick={() => setSelectedExampleIndex(index)}
            >
              <span>{fn.name}</span>
            </button>
          ))}
        </div>
        <div
          id="example-tabpanel"
          role="tabpanel"
          aria-labelledby={`example-tab-${selectedExampleIndex}`}
        >
          <SelectedExample />
        </div>
      </div>
    </div>
  );
}

function Basic() {
  return (
    <div className="example-content">
      <h3>Basic</h3>

      <VoicemailPlayer>
        {(audioRef) => <audio ref={audioRef} src="/audio/long.mp3" />}
      </VoicemailPlayer>
    </div>
  );
}

function MultiSource() {
  return (
    <div className="example-content">
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
    </div>
  );
}

function MuteUnmute() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="example-content">
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
    </div>
  );
}

function PlaybackSpeed() {
  const myAudioRef: React.MutableRefObject<HTMLAudioElement | null> =
    useRef(null);
  const [speed, setSpeed] = useState<number>(1);

  useEffect(() => {
    if (myAudioRef.current) {
      myAudioRef.current.playbackRate = speed;
    }
  }, [speed]);

  return (
    <div className="example-content">
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
    </div>
  );
}

function CustomStyle() {
  return (
    <div className="example-content">
      <h3>Custom Style</h3>

      <VoicemailPlayer className="orange-player">
        {(audioRef) => <audio ref={audioRef} src="/audio/short.mp3" />}
      </VoicemailPlayer>
    </div>
  );
}

function LocalFileAudio() {
  const [localFile, setLocalFile] = useState<File | undefined>();
  const localFileUrl = useBlobUrl(localFile);

  return (
    <div className="example-content">
      <h3>Audio from local file</h3>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setLocalFile(e.target.files?.[0])}
      />

      <VoicemailPlayer>
        {(audioRef) => <audio ref={audioRef} src={localFileUrl} />}
      </VoicemailPlayer>
    </div>
  );
}

function useBlobUrl(blob?: Blob): string | undefined {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      setUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [blob]);
  return url;
}
