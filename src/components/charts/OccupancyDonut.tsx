"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";

interface OccupancyDonutProps {
  occupied: number;
  reserved: number;
  vacant: number;
}

export function OccupancyDonut({ occupied, reserved, vacant }: OccupancyDonutProps) {
  const total = occupied + reserved + vacant;
  const data = [
    { name: "Occupied", value: occupied, color: "var(--emerald)" },
    { name: "Reserved", value: reserved, color: "var(--gold)" },
    { name: "Vacant", value: vacant, color: "#E5E7EB" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Split</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="value" strokeWidth={0}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[15px] font-black text-gray-900">{((occupied / total) * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-gray-400">Occupied</div>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                <span className="text-[11.5px] text-gray-600 flex-1">{item.name}</span>
                <span className="text-[12px] font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
