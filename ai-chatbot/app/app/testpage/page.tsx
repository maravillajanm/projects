'use client';

import React, { createContext, useContext } from "react";

type User = {
  name: string;
  role: string;
};

const AuthContext = createContext<User | null>(null);

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthContext.Provider");
  }

  return context;
}

function Navbar() {
  const user = useAuth();

  return (
    <nav style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
      👋 Hello, {user.name}
    </nav>
  );
}

function Dashboard() {
  const user = useAuth();

  return (
    <section style={{ padding: 10 }}>
      <h2>Dashboard</h2>
      <p>Role: {user.role}</p>
    </section>
  );
}

export default function App() {
  const user: User = {
    name: "Jan",
    role: "Frontend Developer",
  };

  return (
    <AuthContext.Provider value={user}>
      <Navbar />
      <Dashboard />
    </AuthContext.Provider>
  );
}
