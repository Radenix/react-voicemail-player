import React from "react";

export interface VoiceMessagePlayerProps {
  src: string;
}

export default function VoiceMessagePlayer(props: VoiceMessagePlayerProps) {
  return <audio src={props.src} controls></audio>;
}
