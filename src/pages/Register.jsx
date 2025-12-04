import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { Loader2 } from "lucide-react";
import { connectSocket } from "../socket";

const Register = (onAuth) => {
  const [registerData, setRegisterData] = React.useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [isLoading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const handleOnChanges = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     setLoading(true);
     const res = await register(registerData);
     alert(res?.data?.message);

     if(res?.data?.user){
       localStorage.setItem("user", JSON.stringify(res?.data?.user));
      }
      if(res?.data?.token){
        localStorage.setItem("token", res?.data?.token);
      }
      connectSocket(res?.data?.token, res?.data?.user?.fullName);
      navigate("/");
      window.location.reload();
      onAuth(res?.data?.user);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong!";
      alert(msg);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-gray-800">Register</h1>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={registerData.fullName}
            onChange={handleOnChanges}
            placeholder="Full Name"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            required
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={registerData.email}
            onChange={handleOnChanges}
            placeholder="Email"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={registerData.password}
            onChange={handleOnChanges}
            placeholder="Password"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-2 bg-yellow-500 text-white text-center rounded-md hover:bg-yellow-700 ${isLoading && "bg-yellow-500/20 text-center flex justify-center"}`}
        >
        {isLoading=== true ? <Loader2 className="animate-spin" /> : "Register"}
        </button>
        <p className="text-sm text-gray-600 text-center">
          If you're already registered,{" "}
          <Link to="/login" className="text-yellow-500 hover:underline">
            Login now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
