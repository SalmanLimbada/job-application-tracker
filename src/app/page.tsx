"use client";
import { useState, useRef } from "react";

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

function formatUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "#" || trimmed.toLowerCase() === "n/a" || trimmed === "-") {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return null;
}

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

  function handleExportCSV() {
    const headers = ["Company", "Role", "Status", "Date Applied", "Posting URL", "Notes"];

    function escapeCSV(val: string) {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }

    const rows = jobList.map((job) => [
      escapeCSV(job.company),
      escapeCSV(job.role),
      escapeCSV(job.status),
      escapeCSV(job.appliedDate),
      escapeCSV(job.url),
      escapeCSV(job.notes),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = `job-applications-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

      if (lines.length < 2) {
        alert("The selected CSV file appears to be empty or missing data rows.");
        return;
      }

      function parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === "," && !inQuotes) {
            result.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      }

      const validStatuses: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected", "Other"];
      const newJobsMap: Record<string, JobApplication> = {};
      let count = 0;

      // Skip header row at index 0
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const company = cols[0] || "";
        const role = cols[1] || "";
        if (!company || !role) continue;

        const rawStatus = (cols[2] || "Applied") as ApplicationStatus;
        const status: ApplicationStatus = validStatuses.includes(rawStatus) ? rawStatus : "Applied";
        const appliedDate = cols[3] || new Date().toISOString().split("T")[0];
        const url = cols[4] || "#";
        const notes = cols[5] || "";

        const id = `${Date.now()}-${count}`;
        newJobsMap[id] = {
          id,
          company,
          role,
          status,
          appliedDate,
          url,
          notes,
        };
        count++;
      }

      if (count === 0) {
        alert("No valid job applications were found in this CSV.");
        return;
      }

      setJobs((prevJobs) => ({
        ...prevJobs,
        ...newJobsMap,
      }));

      alert(`Successfully imported ${count} job application${count === 1 ? "" : "s"}!`);
    } catch {
      alert("Failed to read CSV file. Please make sure it is a valid format.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
      {/* Add Application Form */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Add New Application
        </h2>
        <form onSubmit={handleAddJob} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Search & Status Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center flex-1 max-w-md">
          <div className="relative flex-1">
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
          <button
            type="button"
            onClick={handleExportCSV}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-2 rounded transition-colors cursor-pointer whitespace-nowrap"
            title="Download applications as CSV"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-2 rounded transition-colors cursor-pointer whitespace-nowrap"
            title="Upload applications from CSV"
          >
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
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

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-900/90 text-zinc-400 text-xs uppercase font-medium border-b border-zinc-800">
            <tr>
              <th className="p-3.5">Company</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date Applied</th>
              <th className="p-3.5">Posting URL</th>
              <th className="p-3.5">Notes</th>
              <th className="p-3.5">Actions</th>
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
                  <tr key={job.id} className="border-b border-zinc-800/80 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 font-medium text-zinc-100">{job.company}</td>
                    <td className="p-3 text-zinc-300">{job.role}</td>
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
                    <td className="p-3 text-zinc-400 text-xs">{job.appliedDate}</td>
                    <td className="p-3">
                      {(() => {
                        const validUrl = formatUrl(job.url);
                        return validUrl ? (
                          <a
                            href={validUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline text-xs inline-flex items-center gap-1 font-medium"
                          >
                            View Post ↗
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-xs font-mono">—</span>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-zinc-400 text-xs max-w-xs truncate" title={job.notes}>
                      {job.notes || <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEditing(job)}
                        className="text-zinc-400 hover:text-zinc-100 text-xs px-2.5 py-1 rounded hover:bg-zinc-800 transition-colors mr-1.5 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-zinc-500 hover:text-red-400 text-xs px-2.5 py-1 rounded hover:bg-red-950/30 transition-colors cursor-pointer"
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
      </div>
    </main>
  );
}