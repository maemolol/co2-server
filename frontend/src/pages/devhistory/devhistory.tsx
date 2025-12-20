import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  apiGetDevice,
  apiGetDeviceMeasurements,
  apiDeleteDevice
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

export default function DeviceHistory() {
    const { deviceMac } = useParams<{ deviceMac: string }>();

    const [device, setDevice] = useState<Device | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const refreshTimer = useRef<number | null>(null);
    const [visible, setVisible] = useState({
    co2: true,
    temperature: true,
    humidity: true,
    });
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);



    // === Load device info ===
    useEffect(() => {
        if (!deviceMac) return;

        const loadDevice = async () => {
            const res = await apiGetDevice(deviceMac);
            if ("data" in res && res.data) {
            setDevice(res.data);
            }
        };

        loadDevice();
    }, [deviceMac]);

    // === Load measurements (auto-refresh every 10s) ===
    useEffect(() => {
        if (!deviceMac) return;

        const loadMeasurements = async () => {
            const res = await apiGetDeviceMeasurements(deviceMac, 25);
            if ("data" in res && Array.isArray(res.data)) {
            setMeasurements(res.data);
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
    }, [deviceMac]);

    const handleDelete = async () => {
        if (!device) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${device.name ?? device.device_mac}"?\n\n` +
            "This action cannot be undone and will permanently remove the device and its measurements."
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            const res = await apiDeleteDevice(device.device_mac);

            // success = no error returned
            if (!("error" in res)) {
            navigate("/app/dashboard");
            }
        } catch (err) {
            alert("Failed to delete device. Please try again.");
        } finally {
            setDeleting(false);
        }
    };


    // === Latest measurement ===
    const latest = useMemo(() => {
        if (measurements.length === 0) return null;
        return measurements.reduce((a, b) =>
            new Date(a.timestamp) > new Date(b.timestamp) ? a : b
        );
    }, [measurements]);

    // === Chart data ===
    const chartData = useMemo(() => {
        return measurements
            .slice()
            .reverse()
            .map((m) => ({
            time: new Date(m.timestamp).toLocaleTimeString(),
            co2: m.co2,
            temperature: m.temperature,
            humidity: m.humidity,
            }));
    }, [measurements]);

    if (!device) {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
    );
    }

    return (
    <div className="p-6 space-y-6">
        {/* === Device info === */}
        <div className="border rounded-lg p-4 space-y-1">
        <h1 className="text-xl font-semibold">
            {device.name ?? "Unnamed device"}
        </h1>
        <div className="text-sm text-white">MAC: {device.device_mac}</div>
        {device.location && (
            <div className="text-sm text-white">
            Location: {device.location}
            </div>
        )}
        </div>

        <button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-3 inline-flex items-center px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
            {deleting ? "Deleting…" : "Delete device"}
        </button>


        {/* === Latest measurements === */}
        {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricBox label="CO2" value={`${latest.co2} ppm`} />
            <MetricBox
            label="Temperature"
            value={`${latest.temperature.toFixed(1)} °C`}
            />
            <MetricBox
            label="Humidity"
            value={`${latest.humidity.toFixed(1)} %`}
            />
        </div>
        )}

        {/* === Graph === */}
        <div className="border rounded-lg p-4">
        <div className="mb-2 font-medium">
            Last 25 measurements
        </div>

        <div className="flex gap-2 mb-2">
            {(["co2", "temperature", "humidity"] as const).map((key) => (
                <button
                key={key}
                onClick={() =>
                    setVisible((v) => ({ ...v, [key]: !v[key] }))
                }
                className={`px-3 py-1 rounded border text-sm ${
                    visible[key]
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
                >
                {key.toUpperCase()}
                </button>
            ))}
        </div>


        <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                yAxisId="co2"
                orientation="left"
                tickFormatter={(v) => `${v} ppm`}
                domain={["dataMin - 100", "dataMax + 100"]}
                />
                <YAxis
                yAxisId="env"
                orientation="right"
                tickFormatter={(v) => v}
                domain={[0, 100]}
                />
                <Tooltip
                labelStyle={{ color: "#111827" }}
                formatter={(value, _name, props) => {
                    if (value == null) return "-";

                    switch (props.dataKey) {
                        case "co2":
                            return `${value} ppm`;
                        case "temperature":
                            return `${value.toFixed(1)} °C`;
                        case "humidity":
                            return `${value.toFixed(1)} %`;
                        default:
                            return value;
                    }
                }}
                />
                {visible.co2 && (
                <Line
                    type="monotone"
                    dataKey="co2"
                    stroke="#2563eb"
                    dot={false}
                    name="CO2"
                    yAxisId={"co2"}
                />
                )}

                {visible.temperature && (
                <Line
                type="monotone"
                dataKey="temperature"
                stroke="#dc2626"
                dot={false}
                name="Temperature"
                yAxisId={"env"}
                />
                )}

                {visible.humidity && (
                <Line
                type="monotone"
                dataKey="humidity"
                stroke="#16a34a"
                dot={false}
                name="Humidity"
                yAxisId={"env"}
                />
                )}
            </LineChart>
            </ResponsiveContainer>
        </div>


        </div>
    </div>
    );
}

/* === Small metric card === */
function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm text-white">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
