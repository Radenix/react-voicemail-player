import React, { useState } from "react";
import useAudioPlayback from "./hooks/useAudioPlayback";
import AudioPeaksBar from "./components/AudioPeaksBar";
import { PlayIcon, PauseIcon } from "./components/icons";
import { AudioPlaybackStatus } from "./audio-playback";

export interface VoicemailPlayerProps {
  children: (ref: React.RefCallback<HTMLAudioElement>) => React.ReactElement;
  className?: string;
}

/**
 * Given a function that renders an audio element as `children`, renders a UI
 * to visualize and control the audio playback
 */
export default function VoicemailPlayer({
  children,
  className,
}: VoicemailPlayerProps) {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [playback, commands] = useAudioPlayback(audioElement);

  const onPeakBarClick = (relativeX: number) => {
    commands.seek(relativeX * playback.duration);
  };

  const renderAudio = children;

  const renderStatus = () => {
    if (playback.status === "error") {
      return <span title={playback.error.message}>Error</span>;
    }

    return (
      <>
        <span role="timer" aria-label="Current Time">
          {formatTime(playback.currentTime)}
        </span>
        &nbsp;/&nbsp;
        <span aria-label="Duration">{formatTime(playback.duration)}</span>
      </>
    );
  };

  return (
    <div className={rootClassName(playback.status, className)}>
      {playback.status === "playing" ? (
        <button
          aria-label="Pause"
          className={prefixClassName("playButton")}
          onClick={commands.pause}
        >
          <PauseIcon className={prefixClassName("playButton-icon")} />
        </button>
      ) : (
        <button
          aria-label="Play"
          className={prefixClassName("playButton")}
          onClick={commands.play}
          disabled={playback.status !== "ready"}
        >
          <PlayIcon className={prefixClassName("playButton-icon")} />
        </button>
      )}
      <div className={prefixClassName("content")}>
        <AudioPeaksBar
          audioElement={audioElement}
          progress={playback.progress}
          onClick={onPeakBarClick}
        />
        <div>{renderStatus()}</div>
      </div>
      {renderAudio(setAudioElement)}
    </div>
  );
}

function rootClassName(status: AudioPlaybackStatus, userClassName?: string) {
  return [
    prefixClassName("root"),
    prefixClassName("root--" + status),
    userClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

function prefixClassName(name: string) {
  return `VoicemailPlayer-${name}`;
}

function formatTime(timeInSeconds: number | null) {
  const minutes = Math.floor(timeInSeconds / 60).toString();
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
