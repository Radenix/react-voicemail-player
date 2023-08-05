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
  const isPlaying = playback.status === "playing";

  const onMeterClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const bbox = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - bbox.left;
    const relativeX = offsetX / bbox.width;
    commands.seek(relativeX * playback.duration);
  };

  const renderAudio = children;

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
        <div
          role="meter"
          aria-valuenow={playback.currentTime}
          aria-valuemax={playback.duration}
          aria-valuetext={formatTime(playback.currentTime)}
          aria-label="Current Time"
          onClick={onMeterClick}
        >
          <AudioPeaksBar
            audioElement={audioElement}
            progress={playback.progress}
          />
        </div>
        <span role="timer" aria-label="Remaining Time">
          {formatTime(playback.remainingTime)}
        </span>
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
  if (timeInSeconds === null) {
    return "--:--";
  }

  const minutes = Math.floor(timeInSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
