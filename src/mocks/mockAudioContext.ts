// this duration only affects the length of the AudioBuffer
// that is created by `decodeAudioData` below
const MOCK_ADUIO_DURATION = 10; // seconds
const MOCK_AUDIO_SAMPLE_RATE = 8000; // per second
const MOCK_AUDIO_BUFFER_LENGTH = MOCK_ADUIO_DURATION * MOCK_AUDIO_SAMPLE_RATE;

global.window.AudioContext = jest.fn().mockImplementation(() => {
  return {
    decodeAudioData(_buffer: ArrayBuffer): Promise<AudioBuffer> {
      return Promise.resolve({
        duration: MOCK_ADUIO_DURATION,
        length: MOCK_AUDIO_BUFFER_LENGTH,
        sampleRate: MOCK_AUDIO_SAMPLE_RATE,
        numberOfChannels: 1,
        getChannelData: (_i: number) =>
          randomAudioData(MOCK_AUDIO_BUFFER_LENGTH),
        copyFromChannel: () => {
          throw new Error("Not implemented");
        },
        copyToChannel: () => {
          throw new Error("Not implemented");
        },
      });
    },

    close() {},
  };
});

function randomAudioData(length: number): Float32Array {
  const data = [];
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return new Float32Array(data);
}
