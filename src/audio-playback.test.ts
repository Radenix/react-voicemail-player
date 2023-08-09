import { expect, test } from "@jest/globals";
import { AudioPlaybackState, createCommands } from "./audio-playback";

test("get state from empty audio", () => {
  const audio = new Audio();
  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBeFalsy();
  expect(result.duration).toBe(NaN);
  expect(result.isDurationUnknown).toBe(true);
  expect(result.currentTime).toBe(0);
  expect(result.progress).toBe(0);
  expect(result.status).toBe("empty");
});

test("get state from errored audio", () => {
  const audio = new Audio();
  const expectedError = new Error();
  Object.defineProperty(audio, "error", { value: expectedError });

  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBe(expectedError);
  expect(result.duration).toBe(NaN);
  expect(result.isDurationUnknown).toBe(true);
  expect(result.currentTime).toBe(0);
  expect(result.progress).toBe(0);
  expect(result.status).toBe("error");
});

test("get state from loading audio", () => {
  const audio = new Audio();
  Object.defineProperties(audio, {
    readyState: {
      value: HTMLMediaElement.HAVE_NOTHING,
    },
    networkState: {
      value: HTMLMediaElement.NETWORK_LOADING,
    },
  });

  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBeFalsy();
  expect(result.duration).toBe(NaN);
  expect(result.isDurationUnknown).toBe(true);
  expect(result.currentTime).toBe(0);
  expect(result.progress).toBe(0);
  expect(result.status).toBe("loading");
});

test("get state from loading audio that can play through", () => {
  const audio = new Audio();
  Object.defineProperties(audio, {
    readyState: {
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
    },
    networkState: {
      value: HTMLMediaElement.NETWORK_LOADING,
    },
    duration: { value: 60 },
  });

  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBeFalsy();
  expect(result.duration).toBe(60);
  expect(result.isDurationUnknown).toBe(false);
  expect(result.currentTime).toBe(0);
  expect(result.progress).toBe(0);
  expect(result.status).toBe("ready");
});

test("get state from playing audio", () => {
  const audio = new Audio();
  Object.defineProperties(audio, {
    readyState: {
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
    },
    networkState: {
      value: HTMLMediaElement.NETWORK_IDLE,
    },
    duration: { value: 60 },
    currentTime: { value: 15 },
    paused: { value: false },
    ended: { value: false },
  });

  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBeFalsy();
  expect(result.duration).toBe(60);
  expect(result.currentTime).toBe(15);
  expect(result.progress).toBeCloseTo(0.25);
  expect(result.status).toBe("playing");
});

test("get state from paused audio", () => {
  const audio = new Audio();
  Object.defineProperties(audio, {
    readyState: {
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
    },
    networkState: {
      value: HTMLMediaElement.NETWORK_IDLE,
    },
    duration: { value: 60 },
    currentTime: { value: 45 },
    paused: { value: true },
    ended: { value: false },
  });

  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBeFalsy();
  expect(result.duration).toBe(60);
  expect(result.isDurationUnknown).toBe(false);
  expect(result.currentTime).toBe(45);
  expect(result.progress).toBeCloseTo(0.75);
  expect(result.status).toBe("ready");
});

test("get state from ended audio", () => {
  const audio = new Audio();
  Object.defineProperties(audio, {
    readyState: {
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
    },
    networkState: {
      value: HTMLMediaElement.NETWORK_IDLE,
    },
    duration: { value: 60 },
    currentTime: { value: 60 },
    paused: { value: false },
    ended: { value: true },
  });

  const result = AudioPlaybackState.fromAudioElement(audio);
  expect(result.error).toBeFalsy();
  expect(result.duration).toBe(60);
  expect(result.currentTime).toBe(60);
  expect(result.progress).toBeCloseTo(1);
  expect(result.status).toBe("ready");
});

test("command play", () => {
  const audio = new Audio();
  Object.defineProperty(audio, "play", { value: jest.fn() });

  const commands = createCommands(audio);
  commands.play();

  expect(audio.play).toHaveBeenCalled();
});

test("command pause", () => {
  const audio = new Audio();
  Object.defineProperty(audio, "pause", { value: jest.fn() });

  const commands = createCommands(audio);
  commands.pause();

  expect(audio.pause).toHaveBeenCalled();
});

test("command seek", () => {
  const audio = new Audio();
  const setCurrentTimeMock = jest.fn();
  Object.defineProperties(audio, {
    currentTime: { set: setCurrentTimeMock },
    duration: { value: 60 },
  });

  const commands = createCommands(audio);
  commands.seek(42);

  expect(setCurrentTimeMock).toHaveBeenCalledWith(42);
});

test("command seek with unknown duration", () => {
  const audio = new Audio();
  const setCurrentTimeMock = jest.fn();
  Object.defineProperties(audio, {
    currentTime: { set: setCurrentTimeMock },
    duration: { value: Number.POSITIVE_INFINITY },
  });

  const commands = createCommands(audio);
  commands.seek(42);

  expect(setCurrentTimeMock).not.toHaveBeenCalled();
});
