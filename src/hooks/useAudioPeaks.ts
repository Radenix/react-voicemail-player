import { useMemo } from "react";

/**
 * Pair of numbers in the range from 0 to 1, representing audio amplitude peaks
 * for two audio channels. If the audio has only one channel, both values will
 * be the same.
 */
type AudioPeak = [number, number];

/**
 * Computes `sampleCount` amplitude peaks of the sound represented by `audioData`
 */
export default function useAudioPeaks(
  audioData: AudioBuffer | null,
  sampleCount: number
): AudioPeak[] {
  const peaks = useMemo(() => {
    if (!audioData) {
      return Array.from({ length: sampleCount }).fill([0, 0]) as AudioPeak[];
    }

    return calculatePeaks(audioData, sampleCount);
  }, [audioData, sampleCount]);

  return peaks;
}

/**
 * Computes the {@link AudioPeak} for each of the `sampleCount` samples of the
 * given audio
 */
function calculatePeaks(
  audioData: AudioBuffer,
  sampleCount: number
): AudioPeak[] {
  const result: AudioPeak[] = [];
  const sampleSize = Math.floor(audioData.length / sampleCount);
  const channels = [audioData.getChannelData(0)];
  // we currently support up to two channels
  if (audioData.numberOfChannels > 1) {
    channels.push(audioData.getChannelData(1));
  }

  const topChannel = channels[0];
  const bottomChannel = channels[1] || channels[0];

  for (let i = 0; i < sampleCount; i++) {
    let maxTop = 0;
    let maxBottom = 0;

    for (let j = 0; j < sampleSize; j++) {
      maxTop = Math.max(Math.abs(topChannel[i * sampleSize + j] || 0), maxTop);
      maxBottom = Math.max(
        Math.abs(bottomChannel[i * sampleSize + j] || 0),
        maxBottom
      );
    }

    result.push([maxTop, maxBottom]);
  }

  return result;
}
