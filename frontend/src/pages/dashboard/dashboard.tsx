import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiGetUserDevices,
  apiGetDeviceMeasurements
} from "../../api/client";
import type { Device, Measurement } from "../../types/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getUserIdFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // supports BOTH shapes:
    // { id: "..." }
    // { user: { id: "..." } }
    return parsed.user_id ?? parsed.user?.user_id ?? null;
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
  const navigate = useNavigate();

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
      }
    };

    loadDevices();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;

    const loadMeasurements = async () => {
      try {
        const res = await apiGetDeviceMeasurements(selectedDevice.device_mac, 25);
        if ("data" in res) {
          const data = Array.isArray(res.data) ? res.data : [];
          setMeasurements(data);
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

  // Latest measurement for display
  const latestMeasurement = useMemo(() => {
    if (measurements.length === 0) return null;
    return measurements.reduce((latest, current) =>
      new Date(current.timestamp) > new Date(latest.timestamp)
        ? current
        : latest
    );
  }, [measurements]);

  // Prepare chart data for Recharts (latest first for plotting)
  const chartData = useMemo(() => {
    return measurements
      .slice()
      .reverse()
      .map((m) => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString(),
        co2: m.co2,
        temperature: m.temperature,
        humidity: m.humidity,
      }));
  }, [measurements]);

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

  // Units for latest measurement
  const unit = {
    co2: "ppm",
    temperature: "°C",
    humidity: "%",
  }[metric];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="border rounded-lg px-3 py-2"
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
                className={`px-4 py-2 rounded-lg border ${
                  metric === m
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {selectedDevice && (
            <button
              onClick={() => navigate(`/app/devices/${selectedDevice.device_mac}`)}
              className="px-4 py-2 rounded border bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Manage device
            </button>
          )}
        </div>
      </div>

      {/* Latest measurement display */}
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

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis
              domain={
                metric === "co2"
                  ? ["dataMin - 100", "dataMax + 100"]
                  : undefined
              }
              tickFormatter={(value) =>
                metric === "co2" ? `${value} ppm` : value
              }
              interval="preserveStartEnd"
            />
            <Tooltip
            labelStyle={{color: "#2c2828ff"}}
            formatter={(value?: number) => {
              if (value === undefined || value === null) return "-";
              if (metric === "co2") return `${value} ppm`;
              if (metric === "temperature") return `${value.toFixed(1)} °C`;
              return `${value.toFixed(1)} %`;
            }}
          />

            <Line
              type="monotone"
              dataKey={metric}
              stroke="#bb1e1eff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
