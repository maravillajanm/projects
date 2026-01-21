'use client';

import React from "react";

type User = {
  name: string;
  role: string;
};

function Navbar({ user }: { user: User }) {
  return (
    <nav style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
      👋 Hello, {user.name}
    </nav>
  );
}

function Dashboard({ user }: { user: User }) {
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
    <>
      <Navbar user={user} />
      <Dashboard user={user} />
    </>
  );
}
