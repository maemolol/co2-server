import { useMemo } from "react";
import { Link } from "react-router-dom";

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Home() {
  const user = useMemo(() => getUserFromStorage(), []);

  const isLoggedIn = Boolean(user?.user_id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-800">
      <div className="max-w-xl w-full bg-zinc-600 rounded-lg shadow p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          ESP32 Sensor Dashboard
        </h1>

        <p className="text-center text-white">
          Monitor CO₂, temperature, and humidity from your ESP32 devices in
          real time.
        </p>

        {!isLoggedIn ? (
          <>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Log in or create an account to get started.
              </p>

              <div className="flex justify-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-black transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <p className="text-white">
                Welcome back{user?.username ? `, ${user.username}` : ""}!
              </p>
              <p className="text-sm text-gray-50">
                View your devices, monitor live measurements, or manage your
                sensors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/app/dashboard"
                className="flex-1 text-center px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Go to dashboard
              </Link>

              <Link
                to="/app/devices/connect"
                className="flex-1 text-center px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-black transition-colors"
              >
                Add device
              </Link>
            </div>
          </>
        )}

        <div className="pt-4 border-t text-xs text-gray-400 text-center">
          ESP32 · SCD41 · CO₂ / Temperature / Humidity
        </div>
      </div>
    </div>
  );
}
