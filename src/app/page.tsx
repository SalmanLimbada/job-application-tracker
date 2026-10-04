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
  const [jobs, setJobs] = useState<Record<string, JobApplication>>(initialJobsMap);

  function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    setJobs((prevJobs) => ({
      ...prevJobs,
      [id]: {
        ...prevJobs[id],
        status: newStatus,
      },
    }));
  }

  function handleDeleteJob(id: string) {
    setJobs((prevJobs) => {
      const updatedJobs = { ...prevJobs };
      delete updatedJobs[id];
      return updatedJobs;
    });
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Job Application Tracker</h1>
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
          {Object.values(jobs).map((job) => (
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
              <td className="p-3">
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="text-zinc-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-950/30 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}