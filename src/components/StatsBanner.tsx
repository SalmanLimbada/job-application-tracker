interface StatsBannerProps {
  total: number;
  interviews: number;
  offers: number;
  rejected: number;
}

export default function StatsBanner({
  total,
  interviews,
  offers,
  rejected,
}: StatsBannerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Applied</p>
        <p className="text-2xl font-bold text-zinc-100 mt-1">{total}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Interviewing</p>
        <p className="text-2xl font-bold text-blue-400 mt-1">{interviews}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Offers</p>
        <p className="text-2xl font-bold text-emerald-400 mt-1">{offers}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-red-400 font-medium uppercase tracking-wider">Rejected</p>
        <p className="text-2xl font-bold text-red-400 mt-1">{rejected}</p>
      </div>
    </div>
  );
}
