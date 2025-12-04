import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { Route, Routes, useNavigate } from "react-router-dom";

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      document.title = `Chat App - @${user.fullName}`;
      navigate("/");
    } else {
      document.title = "Chat App";
      navigate("/login");
    }
  }, []);

  return (
        <Routes>
           <Route path="/" element={<Chat />}/>
           <Route path="/login" element={<Login onAuth={setUser} />} />
           <Route path="/register" element={<Register onAuth={setUser} />} />
        </Routes>
  );
}
