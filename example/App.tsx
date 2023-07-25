import React from "react";
import VoicemailPlayer from "src/VoicemailPlayer";

export default function App() {
  return (
    <div
      style={{
        width: "600px",
        height: "400px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#18222d",
      }}
    >
      <VoicemailPlayer src="/audios/short.mp3" />
      <hr />
      <VoicemailPlayer src="/audios/medium.mp3" />
      <hr />
      <VoicemailPlayer src="/audios/long.mp3" />
    </div>
  );
}
