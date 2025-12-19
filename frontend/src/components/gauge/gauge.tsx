import React from "react";

interface GaugeProps {
  value: number;
}

const Gauge: React.FC<GaugeProps> = ({ value }) => {
  const clamped = Math.min(2000, Math.max(0, value));
  const pct = (clamped / 2000) * 100;

  let color = "bg-green-500";
  if (value > 1000) color = "bg-yellow-500";
  if (value > 1500) color = "bg-red-500";

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>0 ppm</span>
        <span>2000 ppm</span>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
          aria-label={`CO2 level gauge: ${value} ppm`}
        />
      </div>
    </div>
  );
};

export default Gauge;