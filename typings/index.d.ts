import * as React from "react";

export interface VoicemailPlayerProps {
  children: (ref: React.RefCallback<HTMLAudioElement>) => React.ReactElement;
  className?: string;
}

export default function VoicemailPlayer(
  props: VoicemailPlayerProps
): React.ReactElement;
