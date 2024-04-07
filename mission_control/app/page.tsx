"use client";

import { Data } from "@/lib/types";
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
  }
}

export default function Page() {
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5001");
    ws.onmessage = (event) => {
      setData((data) => [...data, JSON.parse(event.data)]);
    };
  }, []);

  return (
    <div className="bg-gray min-h-screen w-full p-10">
      <div className="divide-divide border-divide flex h-full w-full flex-col divide-y-2 border-2">
        {(["temperature", "pressure", "altitude"] as const).map((key) => {
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
                <Tooltip />
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
