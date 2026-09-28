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

const sampleJobs: JobApplication[] = [
  {
    id: "1",
    company: "Google",
    role: "Frontend Engineer",
    appliedDate: "2026-09-25",
    url: "https://careers.google.com",
    status: "Interview",
    notes: "I wish bro ",
  },
  {
    id: "2",
    company: "Stripe",
    role: "Software Engineer",
    appliedDate: "2026-09-26",
    url: "https://stripe.com/jobs",
    status: "Applied",
    notes: "In my dreams",
  },
];

export default function Home() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Resume Tracker</h1>
      <table className="w-full text-left border border-zinc-800">
        <thead className="bg-zinc-800 text-zinc-300 text-xs uppercase font-semibold">
          <tr>
            <th className="p-3">Company</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date Applied</th>
            <th className="p-3">Posting URL</th>
            <th className="p-3">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sampleJobs.map((job) => (
            <tr key={job.id} className="border-b border-zinc-800">
              <td className="p-3 font-medium">{job.company}</td>
              <td className="p-3 text-zinc-400">{job.role}</td>
              <td className="p-3">{job.status}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}