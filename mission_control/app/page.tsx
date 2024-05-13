"use client";

import { MODEL_DATA, commandMap } from "@/lib/constants";
import { Data, GRAPH_KEYS, Orientation } from "@/lib/types";
import { GiPressureCooker } from "react-icons/gi";
import { LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";
// import { Map } from "react-offline-maps";
import { Map } from "../../../offline-map/src/index";
import { PiMountainsLight } from "react-icons/pi";
import { TbTemperaturePlus } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import Modal from "./modal";
import ThreeScene from "./scene";
import { DefaultDict } from "@/lib/defaultDict";

function colorMap(name: string) {
  if (name === "accelX") return "#FF0000";
  if (name === "accelY") return "#00FF00";
  if (name === "accelZ") return "#0000FF";
  if (name.includes("average")) return "#FFFFFF";
  return "#21b2aa";
}

function domain(numbers: number[]) {
  let min = Infinity;
  let max = -Infinity;
  for (let n of numbers) {
    if (n < min) min = n;
    if (n > max) max = n;
  }
  return [min, max];
}

function toCSV<T extends object>(array: T[]): string {
  const header = Object.keys(array[0])
    .map((key) => key.replaceAll(",", "."))
    .join(",");

  const rows = array.map((row) =>
    Object.values(row)
      .map((value) => {
        if (typeof value === "string") {
          return value.replaceAll(",", ".");
        }
        return value;
      })
      .join(","),
  );
  return [header, ...rows].join("\n");
}

const movingAverage = (
  dataMap: DefaultDict<string, number[]>,
  windowSize: number,
) => {
  const keys = dataMap.keys();
  for (let key of keys) {
    const array = dataMap.getValue(key);
    const movingAverageArray = [];
    for (let i = 0; i < array.length - windowSize; i++) {
      const sum = array.slice(i, i + windowSize).reduce((a, b) => a + b, 0);
      movingAverageArray.push(sum / windowSize);
    }
    dataMap.set(`average-${key}`, movingAverageArray);
  }
  return dataMap;
};

function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case "temperature":
      return <TbTemperaturePlus size={15} />;
    case "pressure":
      return <GiPressureCooker size={15} />;
    case "altitude":
      return <PiMountainsLight size={15} />;
    case "relativeAltitude":
      return <PiMountainsLight size={15} />;
  }
}

function useSwitch(defaultValue: boolean) {
  const [state, setState] = useState<boolean>(defaultValue);
  const switchComponent = (
    <div
      className="border-gray-500 relative h-[27px] w-[52px] cursor-pointer rounded-full border-[1px] transition-all duration-300 ease-in-out"
      style={{ background: state ? "#FFFFFF55" : "transparent" }}
      onClick={() => setState((unique) => !unique)}
    >
      <button
        className="absolute top-0 m-[1px] h-[23px] w-[23px] rounded-full border-[1px] bg-white transition-all duration-300 ease-in-out"
        style={state ? { left: "50%" } : { left: "0%" }}
      ></button>
    </div>
  );
  return [switchComponent, state];
}

const units = ["°C", "mBar", "m", "m"];

type GraphReturn = Record<(typeof GRAPH_KEYS)[number], JSX.Element>;
function Graphs({
  data,
  average,
}: {
  data: Data[];
  average: boolean;
}): GraphReturn {
  const graphs: GraphReturn = {} as GraphReturn;
  for (let index = 0; index < GRAPH_KEYS.length; index++) {
    const key = GRAPH_KEYS[index];
    const valueMap = new DefaultDict<string, number[]>([]);
    for (let point of data) {
      if (key === "altitude") {
        valueMap.getValue(key).push(point[key] + 80);
      } else if (key === "temperature") {
        valueMap.getValue(key).push(point[key] - 5);
      } else if (key === "acceleration") {
        valueMap.getValue("accelX").push(point["accelX"]);
        valueMap.getValue("accelY").push(point["accelY"]);
        valueMap.getValue("accelZ").push(point["accelZ"]);
      } else {
        valueMap.getValue(key).push(point[key]);
      }
    }

    const withMovingAverage = movingAverage(valueMap, 20);
    const keys = withMovingAverage.keys();
    let keyedValueList: Record<string, number>[] = [];
    for (let i = 0; i < keys[0]?.length; i++) {
      const obj: Record<string, number> = {};
      for (let key of keys) {
        obj[key] = withMovingAverage.getValue(key)[i];
      }
      keyedValueList.push(obj);
    }

    graphs[key] = (
      <div className="p-4">
        <div className="mb-4 flex flex-row items-center gap-2 text-base text-[#cccccc]">
          <Icon icon={key} />
          <span>
            {key.at(0)?.toUpperCase()}
            {key.slice(1).split("Altitude").join(" Altitude")}
          </span>
        </div>
        <LineChart
          key={key}
          width={440}
          height={145}
          margin={{ top: 5, left: 20, right: 0, bottom: -15 }}
          data={keyedValueList}
        >
          <XAxis dataKey="name" />
          <YAxis
            type="number"
            domain={domain(
              keys.map((k) => keyedValueList.map((v) => v[k])).flat(),
            )}
            stroke="#959696"
            tickFormatter={(value) =>
              (Math.round(value * 1000) / 1000).toString()
            }
          />
          <Tooltip
            content={({ payload: payloadList }) => {
              if (!payloadList) return;
              return (
                <div className="bg-white p-2 text-black">
                  {payloadList.map((payload) => {
                    const name = payload.name as string;
                    const value = payload.value as number;
                    if (!name || value === undefined) return;
                    if (name.includes("average")) return;
                    return (
                      <div className="flex flex-row items-center">
                        <div
                          style={{ backgroundColor: payload.color }}
                          className="mr-2 h-[10px] w-[10px]"
                        />
                        {name.at(0)?.toUpperCase()}
                        {name.slice(1)}: {Math.round(value * 1000) / 1000}
                        {units[index]}
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          {keys.map((k) => {
            if (k.includes("average") && !average) return;
            return (
              <Line
                type="monotone"
                dataKey={k}
                stroke={colorMap(k)}
                animationEasing="ease-in-out"
                animationDuration={10}
                dot={false}
                strokeWidth={k.includes("average") ? 1 : 2}
              />
            );
          })}
        </LineChart>
      </div>
    );
  }

  return graphs;
}

export default function Page() {
  // random data list
  const [data, setData] = useState<Data[]>([]);
  const websocketRef = useRef<WebSocket>();
  const [toasts, setToasts] = useState<string[]>([]);
  const [canExecute, setCanExecute] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const orientationRef = useRef<Orientation>({
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
  });

  useEffect(() => {
    const storedData = window.localStorage.getItem("data");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
    const ws = new WebSocket("ws://localhost:5001");
    websocketRef.current = ws;
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      if (newData?.type === "toast") {
        setToasts((toasts) => [...toasts, newData.data]);
        setCanExecute(true);
        setTimeout(() => {
          setToasts((toasts) => toasts.slice(1));
        }, 3000);
        return;
      }
      const { gyroX, gyroY, gyroZ } = newData;
      orientationRef.current = { gyroX, gyroY, gyroZ };

      setData((data) => {
        const newArray = [...data, newData];
        window.localStorage.setItem("data", JSON.stringify(newArray));
        return newArray;
      });
    };
  }, []);

  const [AverageSwitch, average] = useSwitch(true);
  const [RelativeSwitch, relative] = useSwitch(false);

  const {
    temperature: TemperatureGraph,
    pressure: PressureGraph,
    altitude: AltitudeGraph,
    relativeAltitude: RelativeAltitudeGraph,
    acceleration: AccelerationGraph,
  } = Graphs({ data, average: average as boolean });

  return (
    <div className="max-w-screen relative h-full min-h-screen w-full bg-gray p-5">
      {modalOpen && (
        <Modal
          setModalOpen={setModalOpen}
          handleSubmit={() => {
            const data = window.localStorage.getItem("data");
            const link = document.createElement("a");
            const file = new Blob([toCSV(JSON.parse(data!))], {
              type: "application/json",
            });
            link.href = URL.createObjectURL(file);
            const date = new Date();
            link.download = `ehcansat_data_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.csv`;
            link.click();
            window.localStorage.removeItem("data");
            setData([]);
          }}
        ></Modal>
      )}
      {toasts.length > 0 && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-4 rounded-lg bg-[#868686] p-2 shadow-lg">
          {toasts.map((toast, index) => (
            <div key={index} className="rounded-lg bg-white bg-opacity-50 p-2">
              {commandMap[parseInt(toast)]} was executed
            </div>
          ))}
        </div>
      )}
      <div className="grid h-full w-full grid-cols-5 divide-x-2 divide-[#6d6d6d] border-2 border-white border-opacity-30">
        <button
          className="absolute right-0 top-0 z-[10] m-2 transform rounded-lg bg-blue-500 p-2 shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
          onClick={() => setModalOpen(true)}
        >
          Clear Data
        </button>
        <div className="relative col-span-2 flex flex-col divide-y-2 divide-[#6d6d6d] overflow-hidden">
          <div className="absolute right-16 top-5 flex flex-row items-center gap-x-2 text-lg">
            Show average: {AverageSwitch}
          </div>

          {TemperatureGraph}
          {PressureGraph}
          {AccelerationGraph}
          <div className="relative w-full">
            <div className="absolute right-16 top-5 flex flex-row items-center gap-x-2 text-lg">
              Relative: {RelativeSwitch}
            </div>
            {relative ? RelativeAltitudeGraph : AltitudeGraph}
          </div>
        </div>
        <div className="col-span-3 grid grid-rows-2 divide-y-2 divide-[#6d6d6d] overflow-hidden">
          <Map
            config={{
              showCoordinates: true,
              showCenter: true,
            }}
            latitude={49.694747}
            longitude={-112.809986}
            zoom={4}
            className="w-full] h-full"
            mapElements={[
              {
                element: (
                  <img
                    className="translate-y-[-50%]"
                    width={40}
                    height={32}
                    src="https://upload.wikimedia.org/wikipedia/commons/9/9e/Pin-location.png"
                  />
                ),
                latitude: 49.694747,
                longitude: -112.809986,
              },
            ]}
          />
          <div className="grid h-full w-full grid-cols-2">
            <div className="relative col-span-1 h-full overflow-hidden">
              <ThreeScene orientationRef={orientationRef} />
            </div>
            <div className="grid grid-cols-3 grid-rows-4 gap-4 p-4">
              {commandMap.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!websocketRef.current || !canExecute) return;
                    setCanExecute(false);
                    websocketRef.current.send(index.toString());
                  }}
                  style={{
                    cursor: canExecute ? "pointer" : "not-allowed",
                    borderStyle: canExecute ? "solid" : "dashed",
                  }}
                  className={`h-[60px] w-full rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-5 shadow-lg transition-all hover:scale-105 hover:bg-opacity-10 ${index === 12 && "col-span-3"}`}
                >
                  {commandMap[index]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
