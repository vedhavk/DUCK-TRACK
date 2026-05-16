"use client";

/**
 * DuckActivity — Manual Yearly Duck Count System
 *
 * Allows farmers to manually enter and manage their yearly duck population.
 * Architecture is intentionally data-agnostic so automation can be plugged in
 * later without structural changes (e.g. replace `upsertDuckCount` with an
 * automated pipeline that writes to the same `/farmer/duck-counts` endpoint).
 */

import { useEffect, useState } from "react";
import {
  Bird,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDuckCounts,
  upsertDuckCount,
  deleteDuckCount,
  type DuckYearlyCount,
} from "@/lib/api";

const CURRENT_YEAR = new Date().getFullYear();

export default function DuckActivity() {
  const [counts, setCounts] = useState<DuckYearlyCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add-new form state
  const [addYear, setAddYear] = useState(String(CURRENT_YEAR));
  const [addCount, setAddCount] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Inline-edit state — keyed by record id
  const [editId, setEditId] = useState<number | null>(null);
  const [editCount, setEditCount] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete in-progress
  const [deletingYear, setDeletingYear] = useState<number | null>(null);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    getDuckCounts()
      .then(setCounts)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load duck counts.")
      )
      .finally(() => setIsLoading(false));
  }, []);

  // ── Add / upsert ──────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const year = parseInt(addYear, 10);
    const cnt  = parseInt(addCount, 10);
    if (isNaN(year) || isNaN(cnt) || cnt < 0) {
      setAddError("Please enter a valid year and a non-negative duck count.");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const saved = await upsertDuckCount(year, cnt);
      setCounts((prev) => {
        const idx = prev.findIndex((r) => r.year === saved.year);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next.sort((a, b) => b.year - a.year);
        }
        return [saved, ...prev].sort((a, b) => b.year - a.year);
      });
      setAddCount("");
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setAdding(false);
    }
  }

  // ── Inline edit ───────────────────────────────────────────────────────────
  function startEdit(rec: DuckYearlyCount) {
    setEditId(rec.id);
    setEditCount(String(rec.duck_count));
  }

  async function saveEdit(year: number) {
    const cnt = parseInt(editCount, 10);
    if (isNaN(cnt) || cnt < 0) return;
    setEditSaving(true);
    try {
      const saved = await upsertDuckCount(year, cnt);
      setCounts((prev) =>
        prev.map((r) => (r.year === saved.year ? saved : r))
      );
      setEditId(null);
    } catch {
      /* silently fail – keep editing */
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(year: number) {
    setDeletingYear(year);
    try {
      await deleteDuckCount(year);
      setCounts((prev) => prev.filter((r) => r.year !== year));
    } catch {
      /* silently fail */
    } finally {
      setDeletingYear(null);
    }
  }

  // ── Derived chart data ────────────────────────────────────────────────────
  const maxCount = Math.max(...counts.map((r) => r.duck_count), 1);

  return (
    <div className="max-w-5xl space-y-6">
      {/* ── Add form ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <Bird className="w-5 h-5 text-teal-500" />
          Add / Update Yearly Duck Count
        </h3>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Year
            </label>
            <input
              type="number"
              min={2000}
              max={CURRENT_YEAR + 5}
              value={addYear}
              onChange={(e) => setAddYear(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Number of Ducks
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 250"
              value={addCount}
              onChange={(e) => setAddCount(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={adding}
              className="h-10 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {adding ? "Saving…" : "Save Entry"}
            </Button>
          </div>
        </form>

        {addError && (
          <p className="mt-3 text-sm text-rose-500">{addError}</p>
        )}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          If an entry for the selected year already exists, it will be updated.
        </p>
      </div>

      {/* ── Bar chart ────────────────────────────────────────────────────── */}
      {counts.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" />
            Yearly Duck Population Chart
          </h3>
          <div className="flex items-end gap-4 h-44 overflow-x-auto pb-2">
            {[...counts]
              .sort((a, b) => a.year - b.year)
              .map((rec) => {
                const pct = Math.round((rec.duck_count / maxCount) * 100);
                return (
                  <div
                    key={rec.year}
                    className="flex flex-col items-center gap-2 min-w-[60px] flex-1"
                  >
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {rec.duck_count.toLocaleString()}
                    </span>
                    <div className="w-full flex items-end justify-center rounded-t-lg overflow-hidden bg-slate-100 dark:bg-slate-800/60" style={{ height: "120px" }}>
                      <div
                        className="w-full bg-teal-500 dark:bg-teal-600 rounded-t-lg transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {rec.year}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Data table ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Duck Count Records
          </h3>
        </div>

        {isLoading && (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            Loading…
          </p>
        )}
        {!isLoading && error && (
          <p className="p-6 text-sm text-rose-500">{error}</p>
        )}
        {!isLoading && !error && counts.length === 0 && (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No records yet. Add your first yearly duck count above.
          </p>
        )}

        {counts.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Year</th>
                <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Duck Count</th>
                <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Last Updated</th>
                <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {counts.map((rec) => {
                const isEditing = editId === rec.id;
                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                      {rec.year}
                    </td>
                    <td className="px-6 py-4 text-teal-600 dark:text-teal-400 font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editCount}
                          onChange={(e) => setEditCount(e.target.value)}
                          autoFocus
                          className="w-32 rounded-lg border border-teal-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        rec.duck_count.toLocaleString()
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {rec.updated_at
                        ? new Date(rec.updated_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(rec.year)}
                              disabled={editSaving}
                              className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition"
                            >
                              {editSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(rec)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rec.year)}
                              disabled={deletingYear === rec.year}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            >
                              {deletingYear === rec.year ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
