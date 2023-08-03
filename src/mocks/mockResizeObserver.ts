global.window.ResizeObserver = class {
  observe(_target: Element, _options?: ResizeObserverOptions): void {}
  disconnect(): void {}
  unobserve(_target: Element): void {}
};
