import { ReadlineParser, SerialPort } from "serialport";
import { Data, DATA_KEYS } from "./types";

export class Serial {
  private parser: ReadlineParser;
  private serialport: SerialPort;
  private lastCommand: string | null = null;
  private spamInterval: Timer | null = null;
  private toastCallback: ((s: string) => void) | null = null;

  setToastCallback(callback: (s: string) => void) {
    this.toastCallback = callback;
  }

  constructor() {
    this.serialport = new SerialPort({
      path: "/dev/cu.usbserial-0001",
      baudRate: 57600,
    });

    this.serialport.on("open", () => {
      console.log("Serial port opened");
    });

    this.parser = this.serialport.pipe(
      new ReadlineParser({ delimiter: "\r\n" }),
    );
  }

  public write(data: string | number) {
    const msg = data.toString();
    if (this.lastCommand === msg) return;
    console.log("[Sending to Arduino]: ", msg);
    this.lastCommand = msg;
    let count = 0;
    this.spamInterval = setInterval(() => {
      const message = `AT+SEND=420,${msg.length},${msg}\r\n`;
      this.serialport.write(message);
      count += 1;
      if (count === 10) {
        clearInterval(this.spamInterval!);
        this.spamInterval = null;
        this.toastCallback?.(`${this.lastCommand} was executed`);
        this.lastCommand = null;
      }
    }, 150);
  }

  private extractMessage = (data: string): string | null => {
    const regex = new RegExp(`\\+RCV=(\\d+),(\\d+),(.+),(-?\\d+),(\\d+)`);
    const match = data.match(regex);
    if (!match) return null;
    return match[3];
  };

  private processData = (data: string): Data | null => {
    const match_string = DATA_KEYS.map(() => `(-?\\d+)`).join(",");
    const regex = new RegExp(`(${match_string})`);
    const match = data.match(regex);
    if (!match) return null;

    return Object.fromEntries(
      DATA_KEYS.map((key, i) => {
        const int = parseInt(match[i + 2]);
        return [key, int / 1000];
      }),
    ) as Data;
  };

  public subscribe(listener: (data: Data) => void) {
    this.parser.on("data", (data) => {
      console.log("[Received from Arduino]: ", data);
      const message = this.extractMessage(data);
      if (!message) return;
      console.log("[Received from Arduino]: ", message);
      const processed = this.processData(message);
      if (processed) {
        listener(processed);
      }
    });
  }
}
