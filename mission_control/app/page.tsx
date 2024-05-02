"use client";

import { Data, DATA_KEYS as DATA_KEYS } from "@/lib/types";
import { useEffect, useState } from "react";
import { LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { TbTemperaturePlus } from "react-icons/tb";
import { PiMountainsLight } from "react-icons/pi";
import { GiPressureCooker } from "react-icons/gi";

function domain(numbers: number[]) {
  return [Math.min(...numbers), Math.max(...numbers)];
}

function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case "temperature":
      return <TbTemperaturePlus />;
    case "pressure":
      return <GiPressureCooker />;
    case "altitude":
      return <PiMountainsLight />;
    case "relativeAltitude":
      return <PiMountainsLight />;
  }
}

const units = ["°C", "mBar", "m", "m"];

export default function Page() {
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5001");
    ws.onmessage = (event) => {
      setData((data) => [...data, JSON.parse(event.data)]);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray p-10">
      <div className="flex h-full w-full flex-col divide-y-2 divide-divide border-2 border-divide">
        {DATA_KEYS.map((key, index) => {
          const valueList = data.map((point) => point[key]);
          return (
            <div className="p-4">
              <div className="mb-4 flex flex-row items-center gap-2 text-2xl text-[#cccccc]">
                <Icon icon={key} />
                <span>
                  {key.at(0)?.toUpperCase()}
                  {key.slice(1)}
                </span>
              </div>
              <LineChart
                key={key}
                width={800}
                height={400}
                data={valueList.map((point) => ({ [key]: point }))}
                margin={{ left: 30 }}
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
        })}
      </div>
    </div>
  );
}
