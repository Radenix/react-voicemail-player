import React, { useCallback, useState, useMemo } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { AudioPlaybackState, AudioPlaybackCommands } from "../audio-playback";

/**
 * Returns an array with 3 elements:
 * 1. Callback to set as `ref` on html audio element
 * 2. An object that represents current audio playback state
 * 3. An object with methods you can call to control the audio playback
 */
export default function useAudioPlayback(): [
  React.RefCallback<HTMLAudioElement>,
  AudioPlaybackState,
  AudioPlaybackCommands,
] {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const setRefCallback = useCallback(
    (node: HTMLAudioElement) => setAudioElement(node),
    []
  );

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

  return [setRefCallback, state, commands];
}
