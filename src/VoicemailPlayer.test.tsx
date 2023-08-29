import React from "react";
import { expect, test, vi, SpyInstance } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VoicemailPlayer from "./VoicemailPlayer";

import "./__mocks__/mockAudioContext";
import "./__mocks__/mockHtmlMediaElement";
import "./__mocks__/mockResizeObserver";

let fetchMock: SpyInstance<Parameters<typeof fetch>, ReturnType<typeof fetch>>;

beforeAll(() => {
  global.fetch = fetchMock = vi.fn();
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  fetchMock.mockClear();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

afterAll(() => {
  fetchMock.mockReset();
});

function setup(audioDuration: number) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    headers: new Headers(),
    status: 200,
    statusText: "OK",
    blob: async () => new global.window.Blob([], { type: "audio/mpeg" }),
  } as Response);

  render(
    <VoicemailPlayer>
      {(ref) => (
        <audio
          ref={ref}
          // mock HTMLMediaElement will read the duration from query string
          // and set it as a property
          src={`http://example.com/fake-audio.wav?duration=${audioDuration}`}
        ></audio>
      )}
    </VoicemailPlayer>
  );

  act(() => {
    global.window.simulateLoadAudioElements();
  });

  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

test("render", async () => {
  const DURATION = 10;
  setup(DURATION);
  expect(
    screen.getByLabelText("Play", { selector: "button" })
  ).toBeInTheDocument();

  expect(screen.queryByRole("timer")).toBeInTheDocument();
  expect(screen.getByRole("timer").textContent).toEqual("0:00");

  expect(screen.queryByText(`0:${DURATION}`)).toBeInTheDocument();
});

test("render with unknown duration", async () => {
  setup(NaN);
  expect(screen.queryByLabelText("Duration")).not.toBeInTheDocument();
});

test("render with rounded duration (2 seconds)", async () => {
  setup(1.5);
  expect(screen.queryByText("0:02")).toBeInTheDocument();
});

test("render with rounded duration (1 minute)", async () => {
  setup(59.5);
  expect(screen.queryByText("1:00")).toBeInTheDocument();
});

test("render with rounded duration (2 minutes)", async () => {
  setup(119.5);
  expect(screen.queryByText("2:00")).toBeInTheDocument();
});

test("play", async () => {
  const SECONDS_TO_PLAY = 5;
  const DURATION = 20;
  const user = setup(DURATION);

  await user.click(
    screen.getByLabelText("Play", {
      selector: "button",
    })
  );

  act(() =>
    // mock audio element sends "timeupdate" events once a second;
    // +1 is there to advance to the time just after expected number
    // of events is fired
    vi.advanceTimersByTime(SECONDS_TO_PLAY * 1000 + 1)
  );

  expect(screen.getByRole("timer").textContent).toBe(`0:0${SECONDS_TO_PLAY}`);
});

test("pause", async () => {
  const SECONDS_TO_PLAY = 5;
  const SECONDS_TO_PAUSE_FOR = 10;
  const DURATION = 20;
  const user = setup(DURATION);

  await user.click(
    screen.getByLabelText("Play", {
      selector: "button",
    })
  );

  act(() =>
    // mock audio element sends "timeupdate" events once a second;
    // +1 is there to advance to the time just after expected number
    // of events is fired
    vi.advanceTimersByTime(SECONDS_TO_PLAY * 1000 + 1)
  );

  await user.click(
    screen.getByLabelText("Pause", {
      selector: "button",
    })
  );

  act(() => vi.advanceTimersByTime(SECONDS_TO_PAUSE_FOR * 1000 + 1));

  expect(screen.getByRole("timer").textContent).toBe(`0:0${SECONDS_TO_PLAY}`);
});

test("stop when ended", async () => {
  const DURATION = 10;
  const SECONDS_TO_WAIT_AFTER_END = 5;
  const user = setup(DURATION);

  await user.click(
    screen.getByLabelText("Play", {
      selector: "button",
    })
  );

  act(() =>
    // mock audio element sends "timeupdate" events once a second;
    // +1 is there to advance to the time just after expected number
    // of events is fired
    vi.advanceTimersByTime((DURATION + SECONDS_TO_WAIT_AFTER_END) * 1000 + 1)
  );

  expect(
    screen.queryByLabelText("Pause", { selector: "button" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("Play", { selector: "button" })
  ).toBeInTheDocument();
  expect(screen.getByRole("timer").textContent).toBe(`0:${DURATION}`);
});

test("play after ended", async () => {
  const DURATION = 10;
  const user = setup(DURATION);

  await user.click(
    screen.getByLabelText("Play", {
      selector: "button",
    })
  );

  act(() =>
    // mock audio element sends "timeupdate" events once a second;
    // +1 is there to advance to the time just after expected number
    // of events is fired
    vi.advanceTimersByTime(DURATION * 1000 + 1)
  );

  await user.click(
    screen.getByLabelText("Play", {
      selector: "button",
    })
  );

  expect(
    screen.queryByLabelText("Pause", { selector: "button" })
  ).toBeInTheDocument();
  expect(screen.getByRole("timer").textContent).toBe("0:00");
});

test("seek while paused", async () => {
  const DURATION = 20;
  const WIDTH = 200;
  const user = setup(DURATION);

  const peaksBar = screen.getByTestId("rvmp-peaks-bar");
  peaksBar.getBoundingClientRect = vi.fn().mockReturnValue({
    left: 0,
    top: 0,
    width: WIDTH,
    height: 40,
  });

  await user.pointer({
    keys: "[MouseLeft>]",
    target: peaksBar,
    coords: { clientX: WIDTH / 2 },
  });

  act(() => {
    document.dispatchEvent(new MouseEvent("pointerup"));
  });

  expect(screen.getByRole("timer").textContent).toBe(`0:${DURATION / 2}`);
});

test("seek while playing", async () => {
  const DURATION = 20;
  const SECONDS_TO_PLAY = 15;
  const WIDTH = 200;
  const user = setup(DURATION);

  await user.click(
    screen.getByLabelText("Play", {
      selector: "button",
    })
  );

  act(() =>
    // mock audio element sends "timeupdate" events once a second;
    // +1 is there to advance to the time just after expected number
    // of events is fired
    vi.advanceTimersByTime(SECONDS_TO_PLAY * 1000 + 1)
  );

  const peaksBar = screen.getByTestId("rvmp-peaks-bar");
  peaksBar.getBoundingClientRect = vi.fn().mockReturnValue({
    left: 0,
    top: 0,
    width: WIDTH,
    height: 40,
  });

  await user.pointer({
    keys: "[MouseLeft>]",
    target: peaksBar,
    coords: { clientX: WIDTH / 2 },
  });

  act(() => {
    document.dispatchEvent(new MouseEvent("pointerup"));
  });

  expect(screen.getByRole("timer").textContent).toBe(`0:${DURATION / 2}`);
});

test("seek by gragging", async () => {
  const DURATION = 20;
  const WIDTH = 200;
  const user = setup(DURATION);

  const peaksBar = screen.getByTestId("rvmp-peaks-bar");
  peaksBar.getBoundingClientRect = vi.fn().mockReturnValue({
    left: 0,
    top: 0,
    width: WIDTH,
    height: 40,
  });

  await user.pointer({
    keys: "[MouseLeft>]",
    target: peaksBar,
    coords: { clientX: 0 },
  });

  act(() => {
    document.dispatchEvent(
      new MouseEvent("pointermove", { clientX: WIDTH / 2 })
    );
  });

  act(() => {
    document.dispatchEvent(new MouseEvent("pointerup"));
  });

  expect(screen.getByRole("timer").textContent).toBe(`0:${DURATION / 2}`);
});
