import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface Measurement {
  co2: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

interface MetricChartProps {
  data: Measurement[];
  dataKey: keyof Omit<Measurement, "timestamp">; // "ppm" | "temperature" | "humidity"
  unit: string;
  color?: string;
}

const defaultColor = "#2563eb"; // Tailwind blue-600

const MetricChart: React.FC<MetricChartProps> = ({
  data,
  dataKey,
  unit,
  color = defaultColor,
}) => {
  return (
    <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) =>
                    new Date(t).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    }
                />
                <YAxis />
                <Tooltip
                    formatter={(value) =>
                        value === undefined
                        ? ["", dataKey]
                        : [`${value} ${unit}`, dataKey]
                    }
                    labelFormatter={(t) => new Date(t).toLocaleString()}
                />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default MetricChart;
