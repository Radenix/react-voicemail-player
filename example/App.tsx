import React, { useState, useLayoutEffect } from "react";
import "../src/VoicemailPlayer.css";
import VoicemailPlayer from "../src/VoicemailPlayer";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <div className="theme-picker">
        <label htmlFor="theme-select">Choose a theme:</label>

        <select
          id="theme-select"
          value={theme}
          onChange={(event) =>
            setTheme(event.currentTarget.value as typeof theme)
          }
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="example-container">
        <VoicemailPlayer>
          {(ref) => <audio ref={ref} src="/audio/short.mp3" />}
        </VoicemailPlayer>
        <VoicemailPlayer>
          {(ref) => <audio ref={ref} src="/audio/medium.mp3" />}
        </VoicemailPlayer>
        <VoicemailPlayer>
          {(ref) => <audio ref={ref} src="/audio/long.mp3" />}
        </VoicemailPlayer>
      </div>
    </div>
  );
}
