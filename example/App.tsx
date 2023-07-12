import React from "react";
import VoiceMessagePlayer from "src/VoiceMessagePlayer";

export default function App() {
  return (
    <div
      style={{
        width: "600px",
        height: "400px",
        margin: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "lemonchiffon",
      }}
    >
      <VoiceMessagePlayer src="/audios/long.mp3" />
    </div>
  );
}
