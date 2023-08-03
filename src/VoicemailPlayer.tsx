import React, { useState } from "react";
import useAudioPlayback from "./hooks/useAudioPlayback";
import AudioPeaksBar from "./AudioPeaksBar";
import PlayIcon from "./components/PlayIcon";
import PauseIcon from "./components/PauseIcon";

import "./VoicemailPlayer.css";

export interface VoicemailPlayerProps {
  children: (ref: React.RefCallback<HTMLAudioElement>) => React.ReactElement;
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
  return (
    <div className="rvmp-root">
      <button
        aria-label={playback.isPlaying ? "Pause" : "Play"}
        className="rvmp-play-pause-btn"
        onClick={playback.isPlaying ? commands.pause : commands.play}
      >
        {playback.isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="rvmp-main-content">
        <div
          role="meter"
          aria-valuenow={playback.currentTime}
          aria-valuemax={playback.duration}
          aria-valuetext={formatTime(playback.currentTime)}
          aria-label="Current time"
          onClick={onMeterClick}
        >
          <AudioPeaksBar
            audioElement={audioElement}
            progress={playback.progress}
          />
        </div>
        <span role="timer" aria-label="Remaining time">
          {formatTime(playback.remainingTime)}
        </span>
      </div>
      {renderAudio(setAudioElement)}
    </div>
  );
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
