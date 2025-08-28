"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "1234") {
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ padding: 20 }}>
      <h1>Admin Login</h1>
      <input type="text" placeholder="Username" onChange={(e) => setUser(e.target.value)} /><br/><br/>
      <input type="password" placeholder="Password" onChange={(e) => setPass(e.target.value)} /><br/><br/>
      <button type="submit">Login</button>
    </form>
  );
}
