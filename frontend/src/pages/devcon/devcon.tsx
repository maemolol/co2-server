import { useState } from "react";
import { apiRegisterDevice } from "../../api/client";
import type { DeviceRegisterDTO } from "../../types/api";

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

export default function DeviceConnect() {
  const [mac, setMac] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const userId = getUserIdFromStorage();

  if (!userId) {
    return (
      <div className="p-6 text-center text-red-600">
        User not logged in. Please log in first.
      </div>
    );
  }

  const isValidMac = (mac: string) =>
    /^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$/.test(mac.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidMac(mac)) {
      setError("Invalid MAC address format. Use AA:BB:CC:DD:EE:FF");
      return;
    }

    setLoading(true);

    const payload: DeviceRegisterDTO = {
      device_mac: mac.trim().toUpperCase(),
      name: name.trim() || null,
      location: location.trim() || null,
      user_id: userId,
    };

    try {
      const res = await apiRegisterDevice(payload);
      if ("error" in res) {
        setError(res.error);
      } else {
        setSuccess("Device registered successfully!");
        setMac("");
        setName("");
        setLocation("");
      }
    } catch (err) {
      setError("Failed to register device. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-zinc-600 rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-semibold">Add a new device</h1>

      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="text-green-600 bg-green-100 p-2 rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block font-medium mb-1">Device MAC *</span>
          <input
            type="text"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            className="w-full border rounded px-3 py-2"
            disabled={loading}
            required
          />
        </label>

        <label className="block">
          <span className="block font-medium mb-1">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional device name"
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </label>

        <label className="block">
          <span className="block font-medium mb-1">Location</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Optional location"
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading || !isValidMac(mac)}
          className={`w-full py-2 rounded text-white ${
            loading || !isValidMac(mac)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 transition-colors hover:bg-red-600"
          }`}
        >
          {loading ? "Registering..." : "Register Device"}
        </button>
      </form>
    </div>
  );
}
