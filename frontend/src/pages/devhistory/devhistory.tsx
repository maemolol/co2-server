import React, { useEffect, useState } from "react";
import type { Measurement } from "../../types/api";
import { isError } from "../../types/api";
import { useSearchParams, Link } from "react-router-dom";
import { apiGetDeviceMeasurements } from "../../api/client";

const History: React.FC = () => {
  const [params] = useSearchParams();
  const deviceId = params.get("device");
  const [rows, setRows] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!deviceId) {
      setRows([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    apiGetDeviceMeasurements(deviceId)
      .then((res) => {
        if (!mounted) return;
        if (isError(res)) {
          setError(res.error);
          setRows([]);
        } else {
          setRows(res.data ?? []);
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? String(e));
        setRows([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [deviceId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">History</h1>
          <Link to="/dashboard" className="text-blue-600 text-sm">
            Back
          </Link>
        </div>

        {error ? (
          <div className="text-red-600 mb-4">Error: {error}</div>
        ) : loading ? (
          <div className="text-gray-600 mb-4">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-600">No history for this device.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Time</th>
                <th className="text-center">CO₂ (ppm)</th>
                <th className="text-center">Temp (°C)</th>
                <th className="text-center">Humidity (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2">
                    {r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}
                  </td>
                  <td className="text-center">{typeof r.co2 === "number" ? r.co2 : "—"}</td>
                  <td className="text-center">
                    {typeof r.temperature === "number" ? r.temperature.toFixed(1) : "—"}
                  </td>
                  <td className="text-center">
                    {typeof r.humidity === "number" ? Math.round(r.humidity) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;