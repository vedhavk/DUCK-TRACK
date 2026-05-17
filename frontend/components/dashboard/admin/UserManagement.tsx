import { useState, useEffect } from "react";
import { 
  Users, Trash2, Edit, Plus, Search, Loader2, 
  MapPin, CheckCircle, ShieldAlert, X, Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  adminGetFarmers, adminDeleteFarmer, adminCreateFarmer, adminUpdateFarmer,
  adminGetVets, adminDeleteVet, adminCreateVet, adminUpdateVet,
  FarmerOut, VetOut
} from "@/lib/api";

type TabType = "farmers" | "vets";

export default function UserManagement() {
  const [tab, setTab] = useState<TabType>("farmers");
  const [farmers, setFarmers] = useState<FarmerOut[]>([]);
  const [vets, setVets] = useState<VetOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog States
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pin_code: "",
    district: "",
    state: "",
    password: ""
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [farmersData, vetsData] = await Promise.all([
        adminGetFarmers(),
        adminGetVets()
      ]);
      setFarmers(farmersData);
      setVets(vetsData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number, type: TabType) => {
    if (!confirm(`Are you sure you want to remove this ${type === "farmers" ? "farmer" : "veterinarian"}?`)) return;
    try {
      if (type === "farmers") {
        await adminDeleteFarmer(id);
      } else {
        await adminDeleteVet(id);
      }
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      if (tab === "farmers") {
        await adminCreateFarmer(formData);
      } else {
        await adminCreateVet(formData);
      }
      setShowAddDialog(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to create user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      const updatePayload = {
        name: formData.name,
        pin_code: formData.pin_code,
        district: formData.district,
        state: formData.state
      };
      if (tab === "farmers") {
        await adminUpdateFarmer(selectedUser.id, updatePayload);
      } else {
        await adminUpdateVet(selectedUser.id, updatePayload);
      }
      setShowEditDialog(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      pin_code: user.pin_code,
      district: user.district,
      state: user.state,
      password: "" // Don't expose passwords
    });
    setShowEditDialog(true);
  };

  const openProfile = (user: any) => {
    setSelectedUser(user);
    setShowProfileDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      pin_code: "",
      district: "",
      state: "",
      password: ""
    });
    setFormError(null);
    setSelectedUser(null);
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVets = vets.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Search and Action Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50 w-fit shrink-0 select-none">
          <button
            onClick={() => { setTab("farmers"); setSearch(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === "farmers" 
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Farmers ({farmers.length})
          </button>
          <button
            onClick={() => { setTab("vets"); setSearch(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === "vets" 
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Veterinarians ({vets.length})
          </button>
        </div>

        {/* Inputs */}
        <div className="flex gap-3 w-full sm:max-w-md items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <Button 
            onClick={() => { resetForm(); setShowAddDialog(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-5 flex gap-2 shrink-0 rounded-xl shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Main Content Table */}
      <section className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Retrieving system accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 px-6">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">District / State</th>
                  <th className="p-4 text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm text-slate-700 dark:text-slate-300">
                {tab === "farmers" ? (
                  filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">No farmers registered</td>
                    </tr>
                  ) : (
                    filteredFarmers.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 px-6 font-mono text-xs text-slate-400">F-{f.id}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{f.name}</td>
                        <td className="p-4">{f.email}</td>
                        <td className="p-4 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          {f.pin_code}
                        </td>
                        <td className="p-4">{f.district}, {f.state}</td>
                        <td className="p-4 text-right px-6 space-x-1">
                          <button onClick={() => openProfile(f)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(f)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" title="Edit details">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(f.id, "farmers")} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition" title="Remove account">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  filteredVets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">No veterinarians registered</td>
                    </tr>
                  ) : (
                    filteredVets.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 px-6 font-mono text-xs text-slate-400">V-{v.id}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{v.name}</td>
                        <td className="p-4">{v.email}</td>
                        <td className="p-4 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-teal-500" />
                          {v.pin_code}
                        </td>
                        <td className="p-4">{v.district}, {v.state}</td>
                        <td className="p-4 text-right px-6 space-x-1">
                          <button onClick={() => openProfile(v)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(v)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" title="Edit details">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v.id, "vets")} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition" title="Remove account">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Add User Dialog ────────────────────────────────────────────────── */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white">
              <h4 className="font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New {tab === "farmers" ? "Farmer" : "Veterinarian"}
              </h4>
              <button onClick={() => setShowAddDialog(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400 text-xs">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                  <Input required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="dark:bg-slate-950" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Postal PIN Code</label>
                  <Input required placeholder="682020" value={formData.pin_code} onChange={e => setFormData({...formData, pin_code: e.target.value})} className="dark:bg-slate-950" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                <Input required type="email" placeholder="user@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="dark:bg-slate-950" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
                  <Input required placeholder="Ernakulam" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="dark:bg-slate-950" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
                  <Input required placeholder="Kerala" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="dark:bg-slate-950" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                <Input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="dark:bg-slate-950" />
              </div>
              <Button type="submit" disabled={actionLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-5 mt-2 rounded-xl">
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Create ${tab === "farmers" ? "Farmer" : "Vet"} Account`}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Dialog ───────────────────────────────────────────────── */}
      {showEditDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white">
              <h4 className="font-bold flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Account Profile
              </h4>
              <button onClick={() => setShowEditDialog(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400 text-xs">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="dark:bg-slate-950" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email (ReadOnly)</label>
                <Input disabled value={formData.email} className="bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PIN Code</label>
                  <Input required value={formData.pin_code} onChange={e => setFormData({...formData, pin_code: e.target.value})} className="dark:bg-slate-950" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
                  <Input required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="dark:bg-slate-950" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
                  <Input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="dark:bg-slate-950" />
                </div>
              </div>
              <Button type="submit" disabled={actionLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-5 mt-2 rounded-xl">
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── View Profile Dialog ─────────────────────────────────────────────── */}
      {showProfileDialog && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-3xl mb-3 shadow-inner">
                {selectedUser.name.substring(0, 2).toUpperCase()}
              </div>
              <h4 className="font-bold text-xl text-slate-800 dark:text-white text-center">{selectedUser.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize font-medium mt-1">
                {tab === "farmers" ? "👨🌾 Registered Farmer" : "🩺 Licensed Veterinarian"}
              </p>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                <span className="text-slate-400 font-medium">Account ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{tab === "farmers" ? "F" : "V"}-{selectedUser.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                <span className="text-slate-400 font-medium">PIN Code</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.pin_code}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-2">
                <span className="text-slate-400 font-medium">Region</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.district}, {selectedUser.state}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-400 font-medium">Status</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              </div>
              <Button onClick={() => setShowProfileDialog(false)} className="w-full mt-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white py-4 rounded-xl">
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
