import type { ApplicationStatus, JobApplication } from "@/types/job";

const VALID_STATUSES: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected", "Other"];

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function parseCSVLine(line: string): string[] {
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

export function exportApplicationsToCSV(jobs: JobApplication[]): void {
  const headers = ["Company", "Role", "Status", "Date Applied", "Posting URL", "Notes"];

  const rows = jobs.map((job) => [
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

export function parseApplicationsFromCSV(csvText: string): {
  jobs: Record<string, JobApplication>;
  count: number;
} {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV file is empty or missing data rows.");
  }

  const newJobsMap: Record<string, JobApplication> = {};
  let count = 0;

  // Skip header row at index 0
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const company = cols[0] || "";
    const role = cols[1] || "";
    if (!company || !role) continue;

    const rawStatus = (cols[2] || "Applied") as ApplicationStatus;
    const status: ApplicationStatus = VALID_STATUSES.includes(rawStatus) ? rawStatus : "Applied";
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
    throw new Error("No valid job applications were found in the CSV.");
  }

  return { jobs: newJobsMap, count };
}
