import { useEffect, useState } from "react";
import { FIELD_CATALOG } from "@jobsmith/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.ok ? "API connected" : "API error"))
      .catch(() => setStatus("API unreachable"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-900">
      <h1 className="text-4xl font-bold text-white">Jobsmith</h1>
      <p className="text-slate-300">{status}</p>
      <p className="text-slate-400 text-sm">
        {FIELD_CATALOG.length} fields in the shared catalog
      </p>
    </div>
  );
}