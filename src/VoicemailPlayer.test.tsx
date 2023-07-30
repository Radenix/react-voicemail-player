import React from "react";
import { describe, expect, test } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VoicemailPlayer from "./VoicemailPlayer";

import "./mocks/mockAudioContext";
import "./mocks/mockHtmlMediaElement";

let fetchMock;

beforeAll(() => {
  fetchMock = jest.spyOn(window, "fetch");
});

describe("<VoicemailPlayer />", () => {
  test("starts playing", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      blob: async () => new global.window.Blob([], { type: "audio/mpeg" }),
    });

    render(
      <VoicemailPlayer>
        {(ref) => (
          <audio ref={ref} src={"http://example.coom/fake-audio.wav"}></audio>
        )}
      </VoicemailPlayer>
    );

    const playPauseBtn = await screen.findByLabelText(/Play/);

    userEvent.click(playPauseBtn);
    waitFor(async () =>
      expect(await screen.findByLabelText(/Pause/)).toBeInTheDocument()
    );
  });
});
