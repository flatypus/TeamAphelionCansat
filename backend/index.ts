import { ReadlineParser, SerialPort } from "serialport";

const serialport = new SerialPort({
  path: "/dev/tty.usbserial-0001",
  baudRate: 57600,
});

serialport.on("open", () => {
  console.log("Serial port opened");
});

const parser = serialport.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const queue = [];

type Data = {
  temperature: number;
  pressure: number;
  altitude: number;
};

const process = (data: string): Data | null => {
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

parser.on("data", function (_data) {
  const data = process(_data);
  console.log(data);
  queue.push(data);
});
