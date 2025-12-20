import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiLogin } from "../../api/client";
import type { LoginDTO } from "../../types/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginDTO>({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiLogin(form);

      if ("error" in res) {
        setError(res.error);
      } else if (res.data) {
        // Persist user
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/app/dashboard");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-zinc-600 rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Login</h1>

        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        <input
          type="text"
          placeholder="Username"
          required
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        <div className="text-sm text-center text-white">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-300 hover:underline">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
