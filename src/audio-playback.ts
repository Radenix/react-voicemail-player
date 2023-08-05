export interface AudioPlaybackCommands {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

type AudioPlaybackStatus =
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

  get progress() {
    return this.duration > 0 ? this.currentTime / this.duration : 0;
  }

  get remainingTime() {
    return this.duration - this.currentTime;
  }

  static fromAudioElement(element: HTMLAudioElement) {
    return new AudioPlaybackState(
      element.duration || 0,
      element.currentTime || 0,
      statusFromAudioElement(element),
      element.error
    );
  }

  static equal(a: AudioPlaybackState, b: AudioPlaybackState) {
    return (
      a.status === b.status &&
      areFloatsClose(a.currentTime, b.currentTime) &&
      areFloatsClose(a.duration, b.duration)
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
      audioElement.currentTime = time;
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

function areFloatsClose(a: number, b: number, precision: number = 2) {
  const multiplier = Math.pow(10, precision);
  return Math.round(a * multiplier) === Math.round(b * multiplier);
}
