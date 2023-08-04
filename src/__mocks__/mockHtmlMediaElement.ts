/**
 * Mock implementation of HTMLMediaElement, inspired by
 * https://github.com/jsdom/jsdom/issues/2155#issuecomment-581862425
 */

interface HTMLMediaElement {
  _mock: {
    // mocked properties of media element
    paused: boolean;
    duration: number;
    currentTime: number;
    ended: boolean;

    // mock helpers
    _timeUpdateIntervalId?: number;
    _simulateLoad: (element: HTMLMediaElement) => void;
    _startTimeUpdate: (element: HTMLMediaElement) => void;
    _stopTimeUpdate: (element: HTMLMediaElement) => void;
    _onEnded: (element: HTMLMediaElement) => void;
  };
}

global.window.HTMLMediaElement.prototype._mock = {
  paused: true,
  duration: NaN,
  currentTime: 0,
  ended: false,
  // Copies the mock properties from the prototype onto the instance,
  // and dispatches events that fire during data load in a browser
  _simulateLoad: (audio) => {
    audio._mock = Object.assign(
      {},
      global.window.HTMLMediaElement.prototype._mock
    );
    const url = new URL(audio.src);
    audio._mock.duration = Number(url.searchParams.get("duration") || 0);
    audio.dispatchEvent(new Event("loadstart"));
    audio.dispatchEvent(new Event("loadedmetadata"));
    audio.dispatchEvent(new Event("canplaythrough"));
  },
  // Schedules dispatching "timeupdate" event and updating the `currentTime`
  // property every second
  _startTimeUpdate: (audio) => {
    const update = () => {
      audio._mock.currentTime = Math.min(
        audio._mock.currentTime + 1,
        audio._mock.duration
      );
      audio.dispatchEvent(new Event("timeupdate"));

      if (Math.abs(audio._mock.duration - audio._mock.currentTime) < 1) {
        audio._mock._onEnded(audio);
      }
    };
    audio._mock._timeUpdateIntervalId = Number(setInterval(update, 1000));
  },

  // Stops dispatching "timeupdate" events
  _stopTimeUpdate(audio) {
    clearInterval(audio._mock._timeUpdateIntervalId);
  },

  // Updates the state of audio after the playback has ended and dispatches
  // the "ended" event
  _onEnded(audio) {
    audio._mock._stopTimeUpdate(audio);
    audio._mock.ended = true;
    audio._mock.paused = true;
    audio.dispatchEvent(new Event("ended"));
  },
};

Object.defineProperties(global.window.HTMLMediaElement.prototype, {
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
    set(val) {
      this._mock.currentTime = val;
      this.dispatchEvent(new Event("timeupdate"));
    },
  },
});

global.window.HTMLMediaElement.prototype.play = async function () {
  if (this._mock.ended) {
    this._mock.ended = false;
    this._mock.currentTime = 0;
  }

  if (this._mock.paused) {
    this._mock.paused = false;
  }

  this.dispatchEvent(new Event("play"));
  this._mock._startTimeUpdate(this);
};

global.window.HTMLMediaElement.prototype.pause = function () {
  this._mock.paused = true;
  this._mock._stopTimeUpdate(this);
  this.dispatchEvent(new Event("pause"));
};

interface Window {
  simulateLoadAudioElements: () => void;
}

/**
 * Helper used in tests to mock all audio elements in the current document,
 * and simulate loading their data
 */
global.window.simulateLoadAudioElements = () => {
  const elements = document.querySelectorAll("audio");
  for (let element of elements) {
    element._mock._simulateLoad(element);
  }
};
