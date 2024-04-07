import { ReadlineParser, SerialPort } from "serialport";
import { Data } from "./types";

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
    console.log(data);
    const regex =
      /\+RCV=(\d+),(\d+),\{temperature:(\d+\.\d+),pressure:(\d+\.\d+),altitude:(\d+\.\d+)\},(-?\d+),(\d+)/;
    const match = data.match(regex);

    if (!match) {
      return null;
    }

    const [_, address, length, temperature, pressure, altitude, bruh, moment] =
      match;

    return {
      temperature: parseFloat(temperature),
      pressure: parseFloat(pressure),
      altitude: parseFloat(altitude),
    };
  };

  public subscribe(listener: (data: Data) => void) {
    this.parser.on("data", (data) => {
      const processed = this.process(data);
      if (!processed) return;
      listener(processed);
    });
  }
}
