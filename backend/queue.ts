export class MQueue<T> {
  listeners: ((data: T) => void)[];

  constructor() {
    this.listeners = [];
  }

  publish(data: T) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  subscribe(listener: (data: T) => void) {
    this.listeners.push(listener);
  }
}
