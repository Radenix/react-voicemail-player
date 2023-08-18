import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  AudioPlaybackState,
  AudioPlaybackCommands,
  createCommands,
  listenForChanges,
} from "../audio-playback";
import useAudioData from "./useAudioData";

/**
 * Starts listening to changes to the audio element, making a new snapshot of
 * the state whenever they occur. Returns the latest snapshot taken and a
 * `AudioPlaybackCommands` object that has methods to control the playback
 */
export default function useAudioPlayback(
  audioElement: HTMLAudioElement | null
): [AudioPlaybackState, AudioPlaybackCommands] {
  const [data] = useAudioData(audioElement);

  const subscribeToAudio = useCallback(
    (callback: () => void) => {
      if (!audioElement) {
        return () => {};
      }

      return listenForChanges(audioElement, callback);
    },
    [audioElement, data]
  );

  // gets a snapshot of internal state of the audio element
  const getPlaybackState = useMemo(() => {
    if (!audioElement) {
      return () => AudioPlaybackState.EMPTY;
    }

    let prev: AudioPlaybackState | null = null;
    return () => {
      let next = AudioPlaybackState.fromAudioElementAndData(audioElement, data);
      if (prev && AudioPlaybackState.equal(prev, next)) {
        return prev;
      }
      return (prev = next);
    };
  }, [audioElement, data]);

  // subscribes to the audio element's events and triggers `getPlaybackState`
  // whenever audio element's internal state changes. `getPlaybackState` then
  // computes a snapshot of the state and makes it available in react.
  // (this makes the audio element a single source of truth)
  const playback = useSyncExternalStore<AudioPlaybackState>(
    subscribeToAudio,
    getPlaybackState,
    () => AudioPlaybackState.EMPTY
  );

  const commands = useMemo(() => createCommands(audioElement), [audioElement]);

  return [playback, commands];
}
