"use client";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96 text-center">
        <h2 className="text-2xl font-semibold text-[#274060]">Регистрация в SnapLearn</h2>
        {message && <p className="text-red-500">{message}</p>}
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Имя" className="w-full p-3 border rounded-md" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" className="w-full p-3 border rounded-md" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль" className="w-full p-3 border rounded-md" />
          <button className="w-full bg-[#274060] text-white py-2 rounded-md hover:bg-gray-700 transition">
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}
