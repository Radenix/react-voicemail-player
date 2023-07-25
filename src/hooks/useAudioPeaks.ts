import { useMemo } from "react";

/**
 * numbers in the range from 0 to 1, representing audio amplitude peaks
 */
type AudioPeaks = number[];

/**
 * Computes `sampleCount` amplitude peaks of the sound represented by `audioData`
 */
export default function useAudioPeaks(
  audioData: AudioBuffer | null,
  sampleCount: number
): AudioPeaks {
  const peaks = useMemo(() => {
    if (!audioData) {
      return Array.from({ length: sampleCount }).fill(0) as AudioPeaks;
    }

    return calculatePeaks(audioData, sampleCount);
  }, [audioData, sampleCount]);

  return peaks;
}

/**
 * Computes the maximum amplitude for each of the `sampleCount` samples of the
 * given audio
 */
function calculatePeaks(
  audioData: AudioBuffer,
  sampleCount: number
): AudioPeaks {
  const result = [];
  const sampleSize = Math.floor(audioData.length / sampleCount);
  const channels = Array.from({ length: audioData.numberOfChannels }, (_, i) =>
    audioData.getChannelData(i)
  );

  for (let i = 0; i < sampleCount; i++) {
    // maximum amplitude in the current sample
    let max = 0;

    for (let j = 0; j < sampleSize; j++) {
      // average amplitude across all channels
      const avg =
        channels.reduce(
          (acc, channel) => acc + Math.abs(channel[i * sampleSize + j] || 0),
          0
        ) / channels.length;

      max = Math.max(max, avg);
    }

    result.push(max);
  }

  return result;
}
