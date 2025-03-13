"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Ошибка: " + res.error);
    } else {
      window.location.href = "/dashboard"; 
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96 text-center">
        <h2 className="text-2xl font-semibold text-[#274060]">Вход в SnapLearn</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" className="w-full p-3 border rounded-md" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль" className="w-full p-3 border rounded-md" />
          <button className="w-full bg-[#274060] text-white py-2 rounded-md hover:bg-gray-700 transition">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
