import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate,  } from "react-router-dom";
import { login } from "../api";
import { connectSocket } from "../socket";

const Login = (onAuth) => {
  const [loginData, setLoginData] = React.useState({
    email: "",
    password: "",
  });
  const [isLoading, setLoading] = useState(false);
  const handleOnChanges = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const res = await login(loginData);

    alert(res?.data?.message);

    localStorage.setItem("token", res?.data?.token);
    localStorage.setItem("user", JSON.stringify(res?.data?.user));
    connectSocket(res?.data?.token, res?.data?.user?.fullName);
    navigate("/");
    onAuth(res?.data?.user);
    window.location.reload();
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message;
    alert(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6"
        aria-label="login form"
      >
        <h1 className="text-2xl font-semibold text-gray-800">Login</h1>

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleOnChanges}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleOnChanges}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full inline-flex items-center justify-center rounded-md bg-yellow-500 ${isLoading && "bg-yellow-500/20"} px-4 py-2 text-white font-medium shadow-sm hover:bg-yelllow-800 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
        >
          {isLoading == true ? <Loader2 className="animate-spin" /> : "Login"}
        </button>

        <p className="text-sm text-gray-600 text-center">
          If you're not registered,{" "}
          <Link to="/register" className="text-yellow-500 hover:underline">
            Register now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
