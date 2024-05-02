import { ReadlineParser, SerialPort } from "serialport";
import { Data, DATA_KEYS } from "./types";

export class Serial {
  private parser: ReadlineParser;

  constructor() {
    const serialport = new SerialPort({
      path: "/dev/tty.usbserial-0001",
      baudRate: 57600,
    });

    serialport.on("open", () => {
      console.log("Serial port opened");
    });

    const parser = serialport.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    this.parser = parser;
  }

  private process = (data: string): Data | null => {
    const match_string = DATA_KEYS.map((key) => `${key}:(-?\\d+\\.\\d+)`).join(
      ",",
    );
    const regex = new RegExp(
      `\\+RCV=(\\d+),(\\d+),\\{${match_string}\\},(-?\\d+),(\\d+)`,
    );

    const match = data.match(regex);
    if (!match) {
      return null;
    }

    return Object.fromEntries(
      DATA_KEYS.map((key, i) => [key, parseFloat(match[i + 3])]),
    ) as Data;
  };

  public subscribe(listener: (data: Data) => void) {
    this.parser.on("data", (data) => {
      const processed = this.process(data);
      if (!processed) return;
      listener(processed);
    });
  }
}
