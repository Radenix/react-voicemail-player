import React, { useState } from "react";
import useAudioPlayback from "./hooks/useAudioPlayback";
import AudioPeaksBar from "./components/AudioPeaksBar";
import { PlayIcon, PauseIcon } from "./components/icons";

export interface VoicemailPlayerProps {
  children: (ref: React.RefCallback<HTMLAudioElement>) => React.ReactElement;
  className?: string;
}

/**
 * Given a function that renders an audio element as `children`, renders a UI
 * to visualize and control the audio playback
 */
export default function VoicemailPlayer(props: VoicemailPlayerProps) {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [playback, commands] = useAudioPlayback(audioElement);

  const onMeterClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const bbox = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - bbox.left;
    const relativeX = offsetX / bbox.width;
    commands.seek(relativeX * playback.duration);
  };

  const renderAudio = props.children;

  let rootClassName = prefixClassName("root");
  if (props.className) {
    rootClassName = `${rootClassName} ${props.className}`;
  }
  return (
    <div className={rootClassName}>
      <button
        aria-label={playback.isPlaying ? "Pause" : "Play"}
        className={prefixClassName("playButton")}
        onClick={playback.isPlaying ? commands.pause : commands.play}
      >
        {playback.isPlaying ? (
          <PauseIcon className={prefixClassName("playButton-icon")} />
        ) : (
          <PlayIcon className={prefixClassName("playButton-icon")} />
        )}
      </button>
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
