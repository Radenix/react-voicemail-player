import { useCallback, useMemo, useSyncExternalStore } from "react";
import { AudioPlaybackState, AudioPlaybackCommands } from "../audio-playback";

/**
 * Starts listening to changes to the audio element, making a new snapshot of
 * the state whenever they occur. Returns the latest snapshot taken and a
 * `AudioPlaybackCommands` object that has methods to control the playback
 */
export default function useAudioPlayback(
  audioElement: HTMLAudioElement | null
): [AudioPlaybackState, AudioPlaybackCommands] {
  const subscribeToAudio = useCallback(
    (callback) => {
      if (!audioElement) {
        return () => {};
      }

      const eventNames = [
        "loadedmetadata",
        "play",
        "pause",
        "ended",
        "timeupdate",
        "durationchange",
      ];
      eventNames.forEach((name) =>
        audioElement.addEventListener(name, callback)
      );

      return () => {
        eventNames.forEach((name) =>
          audioElement.removeEventListener(name, callback)
        );
      };
    },
    [audioElement]
  );

  // gets a snapshot of internal state of the audio element
  const getPlaybackState = useMemo(() => {
    if (!audioElement) {
      return () => AudioPlaybackState.EMPTY;
    }

    let prev = null;
    return () => {
      const next = AudioPlaybackState.fromAudioElement(audioElement);
      if (prev && AudioPlaybackState.equal(prev, next)) {
        return prev;
      }
      return (prev = next);
    };
  }, [audioElement]);

  // subscribes to the audio element's events and triggers `getPlaybackState`
  // whenever audio element's internal state changes. `getPlaybackState` then
  // computes a snapshot of the state and makes it available in react.
  // (this makes the audio element a single source of truth)
  const state = useSyncExternalStore(
    subscribeToAudio,
    getPlaybackState,
    () => AudioPlaybackState.EMPTY
  );

  const commands = useMemo(() => {
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
  }, [audioElement]);

  return [state, commands];
}
