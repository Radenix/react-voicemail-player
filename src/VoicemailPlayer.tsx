import React from "react";
import useAudioBlob from "./hooks/useAudioBlob";
import useAudioData from "./hooks/useAudioData";
import useBlobUrl from "./hooks/useBlobUrl";
import useAudioPlayback from "./hooks/useAudioPlayback";
import AudioVisualization from "./AudioVisualization";
import PlayIcon from "./components/PlayIcon";
import PauseIcon from "./components/PauseIcon";

import "./VoicemailPlayer.css";

export interface VoicemailPlayerProps {
  src: string;
}

/**
 * Downloads the audio file at the url specified by the `src` prop, and renders
 * a UI to visualize and control the audio playback
 */
export default function VoicemailPlayer(props: VoicemailPlayerProps) {
  const audioBlob = useAudioBlob(props.src);
  const audioBlobUrl = useBlobUrl(audioBlob);
  const audioData = useAudioData(audioBlob);
  const [audioRef, playback, commands] = useAudioPlayback();

  return (
    <div className="rvmp-root">
      <button
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
      <audio ref={audioRef} src={audioBlobUrl}></audio>
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
