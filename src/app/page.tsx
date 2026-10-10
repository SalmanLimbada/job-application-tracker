"use client";
import { useState } from "react";
import type { ApplicationStatus, JobApplication } from "@/types/job";
import StatsBanner from "@/components/StatsBanner";
import JobForm, { type NewJobPayload } from "@/components/JobForm";
import JobTable from "@/components/JobTable";

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

  const jobList = Object.values(jobs);
  const totalCount = jobList.length;
  const interviewCount = jobList.filter((j) => j.status === "Interview").length;
  const offerCount = jobList.filter((j) => j.status === "Offer").length;
  const rejectedCount = jobList.filter((j) => j.status === "Rejected").length;

  function handleAddJob(payload: NewJobPayload) {
    const newId = Date.now().toString();
    const newJob: JobApplication = {
      id: newId,
      company: payload.company,
      role: payload.role,
      appliedDate: new Date().toISOString().split("T")[0],
      url: payload.url,
      status: payload.status,
      notes: payload.notes,
    };

    setJobs((prevJobs) => ({
      ...prevJobs,
      [newId]: newJob,
    }));
  }

  function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    setJobs((prevJobs) => ({
      ...prevJobs,
      [id]: {
        ...prevJobs[id],
        status: newStatus,
      },
    }));
  }

  function handleSaveEdit(id: string, updated: Partial<JobApplication>) {
    setJobs((prevJobs) => ({
      ...prevJobs,
      [id]: {
        ...prevJobs[id],
        ...updated,
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

  function handleImportJobs(newJobsMap: Record<string, JobApplication>) {
    setJobs((prevJobs) => ({
      ...prevJobs,
      ...newJobsMap,
    }));
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Job Application Tracker</h1>

      <StatsBanner
        total={totalCount}
        interviews={interviewCount}
        offers={offerCount}
        rejected={rejectedCount}
      />

      <JobForm onAddJob={handleAddJob} />

      <JobTable
        jobs={jobList}
        onStatusChange={handleStatusChange}
        onSaveEdit={handleSaveEdit}
        onDeleteJob={handleDeleteJob}
        onImportJobs={handleImportJobs}
      />
    </main>
  );
}