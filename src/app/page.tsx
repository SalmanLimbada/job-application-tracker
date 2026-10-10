"use client";
import { useState } from "react";

type ApplicationStatus = "Applied" | "Rejected" | "Interview" | "Offer" | "Other";

interface JobApplication {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  url: string;
  status: ApplicationStatus;
  notes: string;
}

const initialJobsMap: Record<string, JobApplication> = {
  "1": {
    id: "1",
    company: "Google",
    role: "Frontend Engineer",
    appliedDate: "2026-09-25",
    url: "https://careers.google.com",
    status: "Interview",
    notes: "I wish bro",
  },
  "2": {
    id: "2",
    company: "Stripe",
    role: "Software Engineer",
    appliedDate: "2026-09-26",
    url: "https://stripe.com/jobs",
    status: "Applied",
    notes: "In my dreams",
  },
};

export default function Home() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [notes, setNotes] = useState("");

  const [jobs, setJobs] = useState<Record<string, JobApplication>>(initialJobsMap);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "All">("All");

  const jobList = Object.values(jobs);
  const totalCount = jobList.length;
  const interviewCount = jobList.filter((j) => j.status === "Interview").length;
  const offerCount = jobList.filter((j) => j.status === "Offer").length;
  const rejectedCount = jobList.filter((j) => j.status === "Rejected").length;

  const filteredJobs = jobList.filter((job) => {
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      job.company.toLowerCase().includes(query) ||
      job.role.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JobApplication>>({});

  function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    setJobs((prevJobs) => ({
      ...prevJobs,
      [id]: {
        ...prevJobs[id],
        status: newStatus,
      },
    }));
  }

  function startEditing(job: JobApplication) {
    setEditingId(job.id);
    setEditForm({
      company: job.company,
      role: job.role,
      status: job.status,
      appliedDate: job.appliedDate,
      url: job.url,
      notes: job.notes,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({});
  }

  function saveEditing(id: string) {
    if (!editForm.company?.trim() || !editForm.role?.trim()) return;

    setJobs((prevJobs) => ({
      ...prevJobs,
      [id]: {
        ...prevJobs[id],
        company: editForm.company!.trim(),
        role: editForm.role!.trim(),
        status: editForm.status || prevJobs[id].status,
        appliedDate: editForm.appliedDate || prevJobs[id].appliedDate,
        url: editForm.url?.trim() || "#",
        notes: editForm.notes?.trim() || "",
      },
    }));

    setEditingId(null);
    setEditForm({});
  }

  function handleDeleteJob(id: string) {
    const job = jobs[id];
    if (job && !confirm(`Delete application for ${job.company} (${job.role})?`)) {
      return;
    }
    setJobs((prevJobs) => {
      const updatedJobs = { ...prevJobs };
      delete updatedJobs[id];
      return updatedJobs;
    });
    if (editingId === id) {
      cancelEditing();
    }
  }

  function handleAddJob(e: React.SubmitEvent) {
    e.preventDefault();

    if (!company.trim() || !role.trim()) return;

    const newId = Date.now().toString();

    const newJob: JobApplication = {
      id: newId,
      company: company.trim(),
      role: role.trim(),
      appliedDate: new Date().toISOString().split("T")[0],
      url: url.trim() || "#",
      status: status,
      notes: notes.trim(),
    };

    setJobs((prevJobs) => ({
      ...prevJobs,
      [newId]: newJob,
    }));

    setCompany("");
    setRole("");
    setUrl("");
    setStatus("Applied");
    setNotes("");
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Job Application Tracker</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Applied</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{totalCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Interviewing</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{interviewCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Offers</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{offerCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-red-400 font-medium uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{rejectedCount}</p>
        </div>
      </div>
      <form onSubmit={handleAddJob} className="mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Company (e.g. Amazon)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm rounded px-3 py-2 outline-none focus:border-zinc-400"
          required
        />

        <input
          type="text"
          placeholder="Role (e.g. Software Engineer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm rounded px-3 py-2 outline-none focus:border-zinc-400"
          required
        />

        <input
          type="text"
          placeholder="Posting URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm rounded px-3 py-2 outline-none focus:border-zinc-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-2 outline-none focus:border-zinc-400 cursor-pointer"
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
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm rounded px-3 py-2 outline-none focus:border-zinc-400"
        />
        <button
          type="submit"
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-sm px-4 py-2 rounded transition-colors cursor-pointer"
        >
          + Add Job
        </button>
      </form>

      {/* Search & Status Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm rounded px-3 py-2 outline-none focus:border-zinc-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {(["All", "Applied", "Interview", "Offer", "Rejected", "Other"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer ${
                filterStatus === s
                  ? "bg-zinc-100 text-zinc-900 font-semibold"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full text-left border border-zinc-800">
        <thead className="bg-zinc-800 text-zinc-300 text-xs uppercase font-semibold">
          <tr>
            <th className="p-3">Company</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date Applied</th>
            <th className="p-3">Posting URL</th>
            <th className="p-3">Notes</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredJobs.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-zinc-500 text-sm">
                No job applications found matching your criteria.
                {(searchQuery || filterStatus !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("All");
                    }}
                    className="block mx-auto mt-2 text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    Clear search and filters
                  </button>
                )}
              </td>
            </tr>
          ) : (
            filteredJobs.map((job) => {
              const isEditing = editingId === job.id;

              if (isEditing) {
                return (
                  <tr key={job.id} className="border-b border-zinc-700 bg-zinc-900/60">
                    <td className="p-3">
                      <input
                        type="text"
                        value={editForm.company ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
                        className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:border-zinc-400 w-full"
                        required
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={editForm.role ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                        className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:border-zinc-400 w-full"
                        required
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={editForm.status ?? job.status}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as ApplicationStatus }))}
                        className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={editForm.appliedDate ?? job.appliedDate}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, appliedDate: e.target.value }))}
                        className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:border-zinc-400"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={editForm.url ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="Posting URL"
                        className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:border-zinc-400 w-full"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={editForm.notes ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes"
                        className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:border-zinc-400 w-full"
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => saveEditing(job.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded transition-colors mr-1.5 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={job.id} className="border-b border-zinc-800">
                  <td className="p-3 font-medium">{job.company}</td>
                  <td className="p-3 text-zinc-400">{job.role}</td>
                  <td className="p-3">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value as ApplicationStatus)}
                      className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded border border-zinc-700 outline-none cursor-pointer hover:border-zinc-500 transition-colors"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="p-3 text-zinc-400">{job.appliedDate}</td>
                  <td className="p-3">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View Post ↗
                    </a>
                  </td>
                  <td className="p-3 text-zinc-400">{job.notes}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEditing(job)}
                      className="text-zinc-400 hover:text-zinc-100 text-xs px-2 py-1 rounded hover:bg-zinc-800 transition-colors mr-1.5 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-zinc-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </main>
  );
}