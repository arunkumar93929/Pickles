
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { adminLogin } from "../services/adminService";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await adminLogin({
        email: form.email.trim(),
        password: form.password
      });

      navigate("/admin", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F2E9] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#8E2922]/10">
            <ShieldCheck size={28} className="text-[#8E2922]" />
          </div>

          <h1 className="text-2xl font-bold text-[#33251F]">
            Shadruchulu Admin
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your store.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#33251F]"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter admin email"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#8E2922]"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#33251F]"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#8E2922]"
                required
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#8E2922] py-3 font-semibold text-white transition hover:bg-[#70201B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 transition hover:text-[#8E2922]"
          >
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
