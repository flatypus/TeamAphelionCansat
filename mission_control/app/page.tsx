"use client";

import { commandMap } from "@/lib/constants";
import { Data, GRAPH_KEYS, Orientation } from "@/lib/types";
import { GiPressureCooker } from "react-icons/gi";
import { LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { Map } from "react-offline-maps";
import { PiMountainsLight } from "react-icons/pi";
import { TbTemperaturePlus } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import ThreeScene from "./scene";

// import { Map } from "../../../offline-map/src/index";

function domain(numbers: number[]) {
  return [Math.min(...numbers), Math.max(...numbers)];
}

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

function useSwitch() {
  const [state, setState] = useState<boolean>(false);
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
function Graphs({ data }: { data: Data[] }): GraphReturn {
  const graphs: GraphReturn = {} as GraphReturn;
  for (let index = 0; index < GRAPH_KEYS.length; index++) {
    const key = GRAPH_KEYS[index];
    const valueList = data.map((point) => point[key]);
    // const valueList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
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
          height={200}
          margin={{ top: 5, left: 20, right: 0, bottom: -15 }}
          data={valueList.map((point) => ({ [key]: point }))}
        >
          <XAxis dataKey="name" />
          <YAxis
            type="number"
            domain={domain(valueList)}
            stroke="#959696"
            tickFormatter={(value) =>
              (Math.round(value * 1000) / 1000).toString()
            }
          />
          <Tooltip
            content={({ payload }) => {
              const value = payload?.[0]?.value as number;
              if (value === undefined) return null;
              return (
                <div className="bg-white p-2 text-black">
                  <div>
                    {key.at(0)?.toUpperCase()}
                    {key.slice(1)}: {Math.round(value * 1000) / 1000}
                    {units[index]}
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey={key}
            stroke="#21b2aa"
            animationEasing="ease-in-out"
            animationDuration={10}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </div>
    );
  }

  return graphs;
}

export default function Page() {
  const [data, setData] = useState<Data[]>([]);
  const websocketRef = useRef<WebSocket>();
  const [toasts, setToasts] = useState<string[]>([]);
  const [canExecute, setCanExecute] = useState<boolean>(true);
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

  const {
    temperature: TemperatureGraph,
    pressure: PressureGraph,
    altitude: AltitudeGraph,
    relativeAltitude: RelativeAltitudeGraph,
  } = Graphs({ data });

  const [RelativeSwitch, relative] = useSwitch();

  return (
    <div className="max-w-screen relative h-full min-h-screen w-full bg-gray p-5">
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
        <div className="relative col-span-2 flex flex-col divide-y-2 divide-[#6d6d6d] overflow-hidden">
          <button
            className="absolute right-0 top-0 m-2 transform rounded-lg bg-blue-500 p-2 shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
            onClick={() => {
              window.localStorage.removeItem("data");
              setData([]);
            }}
          >
            Clear Data
          </button>
          {TemperatureGraph}
          {PressureGraph}
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
            latitude={49.541125}
            longitude={-112.15398}
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
                latitude: 49.541125,
                longitude: -112.15398,
              },
            ]}
            mapLines={[
              {
                coordinates: data.map((point) => [
                  point.latitude,
                  point.longitude,
                ]),
              },
            ]}
          />
          <div className="grid h-full w-full grid-cols-2">
            <div className="relative col-span-1 h-full overflow-hidden">
              <ThreeScene orientationRef={orientationRef} />
            </div>
            <div className="grid grid-cols-3 grid-rows-3 gap-4 p-4">
              {[...Array(9)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!websocketRef.current || !canExecute) return;
                    setCanExecute(false);
                    websocketRef.current.send(index.toString());
                  }}
                  style={{ cursor: canExecute ? "pointer" : "not-allowed" }}
                  className="h-full w-full rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-5 shadow-lg transition-all hover:scale-105 hover:bg-opacity-10"
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
