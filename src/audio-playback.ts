export interface AudioPlaybackCommands {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

// number of decimal places to consider when checking two floats for equality
const TIME_CHECK_PRECISION = 2;

/**
 * Value Object representing the state of audio playback at some point in time
 */
export class AudioPlaybackState {
  private constructor(
    public readonly duration: number,
    public readonly currentTime: number,
    public readonly isPlaying: boolean
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
      element.currentTime,
      !(element.paused || element.ended)
    );
  }

  static equal(a: AudioPlaybackState, b: AudioPlaybackState) {
    return (
      a.isPlaying === b.isPlaying &&
      areFloatsEqualWithPrecision(
        a.currentTime,
        b.currentTime,
        TIME_CHECK_PRECISION
      ) &&
      areFloatsEqualWithPrecision(a.duration, b.duration, TIME_CHECK_PRECISION)
    );
  }

  static EMPTY = new AudioPlaybackState(0, 0, false);
}

function areFloatsEqualWithPrecision(a: number, b: number, precision: number) {
  const multiplier = Math.pow(10, precision);
  return Math.round(a * multiplier) === Math.round(b * multiplier);
}
