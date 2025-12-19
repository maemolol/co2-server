import { useEffect, useMemo, useRef, useState } from "react";
import {
  apiGetUserDevices,
  apiGetDeviceMeasurements,
} from "../../api/client";
import type { Device, Measurement } from "../../types/api";

function getUserIdFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.user_id ?? null;
  } catch {
    return null;
  }
}


type Metric = "co2" | "temperature" | "humidity";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [metric, setMetric] = useState<Metric>("co2");
  const [loadingDevices, setLoadingDevices] = useState(true);
  const refreshTimer = useRef<number | null>(null);

  // === Load user devices (infinite loading on error / no response) ===
  useEffect(() => {
    const userId = getUserIdFromStorage();
    if (!userId) return;

    let cancelled = false;

    const loadDevices = async () => {
      try {
        const res = await apiGetUserDevices(userId);
        if (!cancelled && "data" in res) {
          const data = Array.isArray(res.data) ? res.data : [];
          setDevices(data);
          setSelectedDevice((prev) => prev ?? data[0] ?? null);
          setLoadingDevices(false);
        }
      } catch {
        // swallow error → infinite loading
      }
    };

    loadDevices();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const userId = getUserIdFromStorage();

    if (!userId) {
      console.warn("No user cookie found, cannot load devices");
      return;
    }

    let cancelled = false;

    const loadDevices = async () => {
      try {
        const res = await apiGetUserDevices(userId);
        if (!cancelled && "data" in res) {
          const data = Array.isArray(res.data) ? res.data : [];
          setDevices(data);
          setSelectedDevice((prev) => prev ?? data[0] ?? null);
          setLoadingDevices(false);
        }
      } catch (err) {
        console.error("LookupUser failed", err);
        // infinite loading by design
      }
    };


    loadDevices();


    return () => {
      cancelled = true;
    };
  }, []);

  // === Auto-refresh measurements every 10s ===
  useEffect(() => {
    if (!selectedDevice) return;

    const loadMeasurements = async () => {
      try {
        const res = await apiGetDeviceMeasurements(selectedDevice.device_mac, 25);
        if ("data" in res && Array.isArray(res.data)) {
          setMeasurements(res.data);
        }
      } catch {
        // ignore
      }
    };

    loadMeasurements();

    refreshTimer.current = window.setInterval(loadMeasurements, 10_000);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [selectedDevice]);

  const latestMeasurement = useMemo(() => {
    if (measurements.length === 0) return null;
    return measurements.reduce((latest, current) =>
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );
  }, [measurements]);

  const chartData = useMemo(() => {
    if (measurements.length === 0) return [];

    const max = Math.max(
      ...measurements.map((m) =>
        metric === "co2"
          ? m.co2
          : metric === "temperature"
          ? m.temperature
          : m.humidity
      )
    );

    return measurements
      .slice()
      .reverse()
      .map((m, i) => ({
        x: i,
        y:
          metric === "co2"
            ? m.co2 / max
            : metric === "temperature"
            ? m.temperature / max
            : m.humidity / max,
      }));
  }, [measurements, metric]);

  const gridLines = useMemo(() => {
    const lines = [];
    if (metric === "co2") {
      const maxYppm = Math.max(
        1000,
        Math.ceil(Math.max(...measurements.map((m) => m.co2)) / 500) * 500
      );

      for (let val = 0; val <= maxYppm; val += 500) {
        const yPos = 300 - (val / maxYppm) * 280;
        lines.push({ yPos, label: `${val} ppm` });
      }
    } else {
      const maxY =
        metric === "temperature"
          ? Math.max(
              30,
              Math.ceil(Math.max(...measurements.map((m) => m.temperature)))
            )
          : Math.max(
              100,
              Math.ceil(Math.max(...measurements.map((m) => m.humidity)))
            );
      const step = maxY / 5;
      for (let i = 0; i <= 5; i++) {
        const val = i * step;
        const yPos = 300 - (val / maxY) * 280;
        lines.push({
          yPos,
          label:
            metric === "temperature"
              ? `${val.toFixed(1)} °C`
              : `${val.toFixed(1)} %`,
        });
      }
    }
    return lines;
  }, [measurements, metric]);

  // Infinite loading spinner if LookupUser fails or stalls
  if (devices.length === 0 && loadingDevices) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        You have no devices registered. Please register a device.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="border rounded px-3 py-2"
          value={selectedDevice?.device_mac}
          onChange={(e) =>
            setSelectedDevice(
              devices.find((d) => d.device_mac === e.target.value) ?? null
            )
          }
        >
          {devices.map((d) => (
            <option key={d.device_mac} value={d.device_mac}>
              {d.name ?? d.device_mac}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {(["co2", "temperature", "humidity"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-4 py-2 rounded border ${
                metric === m
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {latestMeasurement && (
        <div className="text-lg font-semibold">
          Latest:{" "}
          {metric === "co2"
            ? `${latestMeasurement.co2} ppm`
            : metric === "temperature"
            ? `${latestMeasurement.temperature.toFixed(1)} °C`
            : `${latestMeasurement.humidity.toFixed(1)} %`}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <svg viewBox="0 0 600 300" className="w-full h-64">
          {/* Grid lines */}
          {gridLines.map(({ yPos, label }, i) => (
            <g key={i}>
              <line
                x1={0}
                y1={yPos}
                x2={600}
                y2={yPos}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={5}
                y={yPos - 5}
                fontSize={12}
                fill="currentColor"
                className="select-none"
              >
                {label}
              </text>
            </g>
          ))}
          {chartData.map((p, i) => {
            if (i === 0) return null;
            const prev = chartData[i - 1];
            return (
              <line
                key={i}
                x1={(i - 1) * (600 / (chartData.length - 1))}
                y1={300 - prev.y * 280}
                x2={i * (600 / (chartData.length - 1))}
                y2={300 - p.y * 280}
                stroke="currentColor"
                strokeWidth={2}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
