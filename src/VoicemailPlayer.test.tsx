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

  global.window.URL.createObjectURL = jest
    .fn()
    .mockImplementation((obj) => `blob:http://example.com/fake-audio.wav`);
  global.window.URL.revokeObjectURL = jest.fn();
});

describe("<VoicemailPlayer />", () => {
  test("starts playing", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      blob: async () => new global.window.Blob([], { type: "audio/mpeg" }),
    });

    const component = render(
      <VoicemailPlayer src={"http://example.coom/fake-audio.wav"} />
    );
    const audio = component.container.getElementsByTagName("audio")[0];
    expect(audio).toBeDefined();

    const playPauseBtn = await screen.findByText(/Play/);
    await waitFor(
      () =>
        expect(audio.getAttribute("src")).toBe(
          "blob:http://example.com/fake-audio.wav"
        ),
      { mutationObserverOptions: { attributes: true } }
    );

    userEvent.click(playPauseBtn);
    expect(await screen.findByText(/Pause/)).toBeInTheDocument();
  });
});
