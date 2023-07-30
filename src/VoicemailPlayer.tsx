import React, { useState } from "react";
import useAudioData from "./hooks/useAudioData";
import useAudioPlayback from "./hooks/useAudioPlayback";
import AudioVisualization from "./AudioVisualization";
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
  const [audioData, _audioError] = useAudioData(audioElement);
  const [playback, commands] = useAudioPlayback(audioElement);

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
          onClick={(event) => {
            const relativeX =
              event.nativeEvent.offsetX / event.currentTarget.clientWidth;
            commands.seek(relativeX * playback.duration);
          }}
        >
          <AudioVisualization
            audioData={audioData}
            progress={playback.progress}
          />
        </div>
        <span>{formatTime(playback.remainingTime)}</span>
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
