import { performanceRows } from "@/lib/adminMockApi";

export default function PerformanceResults() {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
        Performance Results
      </h3>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full bg-white dark:bg-slate-900/50 text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Metric</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {performanceRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 text-slate-800 dark:text-slate-300">{row.metric}</td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {row.value}
                </td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{row.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
