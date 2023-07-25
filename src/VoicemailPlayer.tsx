import React from "react";
import useAudioBlob from "./hooks/useAudioBlob";
import useAudioData from "./hooks/useAudioData";
import useBlobUrl from "./hooks/useBlobUrl";
import AudioVisualization from "./AudioVisualization";
import useAudioPlayback from "./hooks/useAudioPlayback";

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
    <div>
      {playback.isPlaying ? (
        <button onClick={commands.pause}>Pause</button>
      ) : (
        <button onClick={commands.play}>Play</button>
      )}
      <div>
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
        <div>{playback.remainingTime}</div>
      </div>
      <audio ref={audioRef} src={audioBlobUrl}></audio>
    </div>
  );
}
