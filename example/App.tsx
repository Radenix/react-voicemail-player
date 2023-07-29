import React from "react";
import VoicemailPlayer from "../src/VoicemailPlayer";

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
      }}
    >
      <VoicemailPlayer src="/audio/short.mp3" />
      <hr />
      <VoicemailPlayer src="/audio/medium.mp3" />
      <hr />
      <VoicemailPlayer src="/audio/long.mp3" />
    </div>
  );
}
