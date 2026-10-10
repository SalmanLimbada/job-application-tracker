"use client";
import { useState } from "react";
import type { ApplicationStatus } from "@/types/job";

export interface NewJobPayload {
  company: string;
  role: string;
  status: ApplicationStatus;
  url: string;
  notes: string;
}

interface JobFormProps {
  onAddJob: (payload: NewJobPayload) => void;
}

export default function JobForm({ onAddJob }: JobFormProps) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    onAddJob({
      company: company.trim(),
      role: role.trim(),
      status,
      url: url.trim() || "#",
      notes: notes.trim(),
    });

    setCompany("");
    setRole("");
    setUrl("");
    setStatus("Applied");
    setNotes("");
  }

  return (
    <section className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-8 shadow-sm">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Add New Application
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Company (e.g. Amazon)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-zinc-500 transition-colors"
          required
        />

        <input
          type="text"
          placeholder="Role (e.g. Engineer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-zinc-500 transition-colors"
          required
        />

        <input
          type="text"
          placeholder="Posting URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-zinc-500 transition-colors"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-zinc-500 transition-colors cursor-pointer"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-zinc-500 transition-colors"
        />

        <button
          type="submit"
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
        >
          + Add Job
        </button>
      </form>
    </section>
  );
}
