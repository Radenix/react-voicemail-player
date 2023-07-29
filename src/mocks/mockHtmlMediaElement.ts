/**
 * Mock implementation of HTMLMediaElement, heavily inspired by
 * https://github.com/jsdom/jsdom/issues/2155#issuecomment-581862425
 */

interface HTMLMediaElement {
  _mock: {
    src: string;
    paused: boolean;
    duration: number;
    currentTime: number;
    ended: boolean;
    _resetMock: (element: HTMLMediaElement) => void;
  };
}

// Mock data and helper methods
global.window.HTMLMediaElement.prototype._mock = {
  src: undefined,
  paused: true,
  duration: NaN,
  currentTime: 0,
  ended: false,
  // Copies the mock properties from the prototype onto the instance
  _resetMock: (audio) => {
    audio._mock = Object.assign(
      {},
      global.window.HTMLMediaElement.prototype._mock
    );
  },
};

Object.defineProperties(global.window.HTMLMediaElement.prototype, {
  src: {
    get() {
      return this._mock.src;
    },
    set(value) {
      // Reset the mock state to initial (paused) when we set the src.
      this._mock._resetMock(this);
      this._mock.src = value;
      this._mock.duration = 2000;
      this.dispatchEvent(new Event("loadedmetadata"));
      this.dispatchEvent(new Event("canplaythrough"));
    },
  },

  paused: {
    get() {
      return this._mock.paused;
    },
  },
  ended: {
    get() {
      return this._mock.ended;
    },
  },
  duration: {
    get() {
      return this._mock.duration;
    },
  },
  currentTime: {
    get() {
      return this._mock.currentTime;
    },
  },
});

global.window.HTMLMediaElement.prototype.play = function playMock() {
  this._mock.paused = false;
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
};

global.window.HTMLMediaElement.prototype.pause = function pauseMock() {
  this._mock.paused = true;
  this.dispatchEvent(new Event("pause"));
};
