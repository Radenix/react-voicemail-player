export interface AudioPlaybackCommands {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

export type AudioPlaybackStatus =
  | "empty" // no source selected
  | "loading" // source selected, loading data
  | "error" // error loading the resource
  | "ready" // ready to play (paused or ended)
  | "playing"; // playing

// names of events that notify of changes in audio element state
const EVENT_NAMES = [
  "loadstart",
  "loadedmetadata",
  "canplaythrough",
  "play",
  "pause",
  "ended",
  "timeupdate",
  "durationchange",
  "error",
  "abort",
];

/**
 * Value Object representing the state of audio playback at some point in time
 */
export class AudioPlaybackState {
  private constructor(
    public readonly duration: number,
    public readonly currentTime: number,
    public readonly status: AudioPlaybackStatus,
    public readonly error: MediaError | null
  ) {}

  get isDurationUnknown() {
    // If no media data is available, the duration is NaN.
    // If the media doesn't have a known duration — such as for live media
    // streams — the value of duration is +Infinity.
    return !Number.isFinite(this.duration);
  }

  get progress() {
    if (this.isDurationUnknown) {
      return 0;
    }

    return this.duration > 0 ? this.currentTime / this.duration : 0;
  }

  static fromAudioElement(element: HTMLAudioElement) {
    return new AudioPlaybackState(
      element.duration,
      element.currentTime,
      statusFromAudioElement(element),
      element.error
    );
  }

  static equal(a: AudioPlaybackState, b: AudioPlaybackState) {
    return (
      a.status === b.status &&
      areFloatsClose(a.currentTime, b.currentTime) &&
      areDurationsEqual(a, b)
    );
  }

  static EMPTY = new AudioPlaybackState(0, 0, "empty", null);
}

export function listenForChanges(
  audioElement: HTMLAudioElement,
  callback: () => void
): () => void {
  EVENT_NAMES.forEach((name) => audioElement.addEventListener(name, callback));

  return () => {
    EVENT_NAMES.forEach((name) =>
      audioElement.removeEventListener(name, callback)
    );
  };
}

export function createCommands(audioElement: HTMLAudioElement) {
  return {
    play() {
      audioElement.play();
    },

    pause() {
      audioElement.pause();
    },

    seek(time: number) {
      if (!Number.isFinite(time) || !Number.isFinite(audioElement.duration)) {
        return;
      }
      audioElement.currentTime = clamp(time, 0, audioElement.duration);
    },
  };
}

function statusFromAudioElement(
  element: HTMLAudioElement
): AudioPlaybackStatus {
  if (element.error) return "error";

  if (
    element.networkState === HTMLMediaElement.NETWORK_EMPTY ||
    element.networkState === HTMLMediaElement.NETWORK_NO_SOURCE
  )
    return "empty";

  if (
    element.networkState === HTMLMediaElement.NETWORK_LOADING &&
    element.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA
  )
    return "loading";

  if (element.paused || element.ended) return "ready";

  return "playing";
}

function areDurationsEqual(a: AudioPlaybackState, b: AudioPlaybackState) {
  if (a.isDurationUnknown || b.isDurationUnknown) {
    // if at least one of the durations is unknown,
    // they can be equal only if both are unknown
    return a.isDurationUnknown === b.isDurationUnknown;
  }

  return areFloatsClose(a.duration, b.duration);
}

function areFloatsClose(a: number, b: number, precision: number = 2) {
  const multiplier = Math.pow(10, precision);
  return Math.round(a * multiplier) === Math.round(b * multiplier);
}

function formatTime(time: number) {
  const minutes = Math.floor(time / 60).toString();
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(Math.min(n, max), min);
}
