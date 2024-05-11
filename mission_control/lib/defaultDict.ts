export class DefaultDict<K extends string | number | symbol, V> {
  private defaultValue;
  private dict: Record<K, V> = {} as Record<K, V>;

  constructor(defaultValue: V) {
    this.defaultValue = defaultValue;
  }

  keys() {
    return Object.keys(this.dict);
  }

  set(key: K, value: V) {
    this.dict[key] = value;
  }

  getValue(key: K) {
    if (!(key in this.dict)) {
      this.dict[key] = this.defaultValue;
    }
    return this.dict[key];
  }

  get() {
    return this.dict;
  }
}
