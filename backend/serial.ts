import { ReadlineParser, SerialPort } from "serialport";
import { Data, DATA_KEYS } from "./types";

export class Serial {
  private parser: ReadlineParser;
  private serialport: SerialPort;
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
    const message = `AT+SEND=420,${msg.length},${msg}\r\n`;
    this.serialport.write(message);
  }

  private process = (data: string): Data | null => {
    const match_string = DATA_KEYS.map(() => `(-?\\d+\\.\\d+)`).join(",");
    const regex = new RegExp(
      `\\+RCV=(\\d+),(\\d+),${match_string},(-?\\d+),(\\d+)`,
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
      console.log("Received data", JSON.stringify(processed));
      listener(processed);
    });
  }
}
