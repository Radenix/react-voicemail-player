import React from "react";
import { createRoot } from "react-dom/client";
import VoicemailPlayer from "../dist/react-voicemail-player.esm";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <VoicemailPlayer>
      {(ref) => <audio ref={ref} src="../example/audio/long.mp3"></audio>}
    </VoicemailPlayer>
  );
} else {
  console.error(`Failed to render app, element with id="root" was not found.`);
}
