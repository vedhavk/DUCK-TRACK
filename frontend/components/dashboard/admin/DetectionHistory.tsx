import { useState, useEffect } from "react";
import { 
  FileText, Calendar, Filter, Loader2, Download, 
  MapPin, AlertTriangle, CheckCircle, Search, Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminGetHistory, AdminHistoryRecord } from "@/lib/api";

export default function DetectionHistory() {
  const [history, setHistory] = useState<AdminHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await adminGetHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load global scan history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownloadReport = (record: AdminHistoryRecord) => {
    const content = `
=============================================
         DUCKTRACK AI DIAGNOSIS REPORT
=============================================
Scan ID:       ${record.id}
Generated At:  ${new Date(record.created_at).toLocaleString()}
Reporter Name: ${record.user}
Role Class:    ${record.user_type}

---------------------------------------------
DIAGNOSIS RESULTS
---------------------------------------------
Classification: ${record.prediction.toUpperCase()}
Confidence:     ${(record.confidence * 100).toFixed(2)}%
Media Type:     ${record.file_type}

---------------------------------------------
GEOLOCATION INFO
---------------------------------------------
Postal PIN Code: ${record.pin_code}
Coordinates:     Lat ${record.latitude}, Lng ${record.longitude}

=============================================
This is a secure system-generated report.
=============================================
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DuckTrack_Report_${record.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.user.toLowerCase().includes(search.toLowerCase()) || 
                          item.pin_code.includes(search);
    const matchesResult = filterResult === "all" || item.prediction === filterResult;
    const matchesUser = filterUserType === "all" || item.user_type === filterUserType;
    return matchesSearch && matchesResult && matchesUser;
  });

  return (
    <div className="space-y-6">
      
      {/* Filters block */}
      <section className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            
            {/* Filter by Result */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold px-2 text-slate-400">Result:</span>
              <select
                value={filterResult}
                onChange={e => setFilterResult(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none p-1.5 px-2"
              >
                <option value="all">All Predictions</option>
                <option value="healthy">Healthy Only</option>
                <option value="diseased">Diseased Only</option>
              </select>
            </div>

            {/* Filter by User Type */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold px-2 text-slate-400">Reporter:</span>
              <select
                value={filterUserType}
                onChange={e => setFilterUserType(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none p-1.5 px-2"
              >
                <option value="all">All Roles</option>
                <option value="Farmer">Farmers</option>
                <option value="Veterinarian">Veterinarians</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search user or PIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      </section>

      {/* Uploads History Table */}
      <section className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Loading detection records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 px-6">ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Result</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right px-6">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm text-slate-700 dark:text-slate-300">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">No detection history matching filters</td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 px-6 font-mono text-xs text-slate-400">{item.id}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{item.user}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          item.user_type === "Farmer"
                            ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                            : "bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400"
                        }`}>
                          {item.user_type}
                        </span>
                      </td>
                      <td className="p-4 capitalize text-xs font-semibold text-slate-500 dark:text-slate-400">{item.file_type}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          item.prediction === "diseased"
                            ? "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                            : "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        }`}>
                          {item.prediction === "diseased" ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Diseased
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Healthy
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">{(item.confidence * 100).toFixed(1)}%</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-xs font-medium flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        {item.pin_code}
                      </td>
                      <td className="p-4 text-right px-6">
                        <button 
                          onClick={() => handleDownloadReport(item)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition" 
                          title="Download full text report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
