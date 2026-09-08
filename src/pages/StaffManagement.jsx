
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const STAFF_ROLES = [
  "manager",
  "sales",
  "rental",
  "finance",
  "vehicle_manager",
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "manager",
};

function RoleBadge({ role }) {
  const styles = {
    manager: "border-purple-400/20 bg-purple-400/10 text-purple-300",
    sales: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    rental: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    finance: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    vehicle_manager:
      "border-orange-400/20 bg-orange-400/10 text-orange-300",
    admin: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        styles[role] || "border-white/10 bg-white/[0.05] text-slate-400"
      }`}
    >
      {role?.replaceAll("_", " ") || "unknown"}
    </span>
  );
}

function ActiveBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-red-400/20 bg-red-400/10 text-red-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-400" : "bg-red-400"
        }`}
      />

      {isActive ? "Active" : "Deactivated"}
    </span>
  );
}

function StaffManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "",
  });
  const [saving, setSaving] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/staff");

      setStaff(response.data.staff || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesRole =
        roleFilter === "all" || member.role === roleFilter;

      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        member.name?.toLowerCase().includes(normalizedSearch) ||
        member.email?.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [staff, search, roleFilter]);

  const activeStaffCount = staff.filter((member) => member.isActive).length;

  const managerCount = staff.filter(
    (member) => member.role === "manager",
  ).length;

  const departmentCount = new Set(
    staff
      .filter((member) => member.role !== "admin")
      .map((member) => member.role),
  ).size;

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      await api.post("/staff", createForm);

      setCreateForm(emptyForm);
      setShowCreateForm(false);

      await fetchStaff();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create staff account.",
      );
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (member) => {
    setEditingStaff(member);

    setEditForm({
      name: member.name || "",
      phone: member.phone || "",
      role: member.role,
    });
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.put(`/staff/${editingStaff._id}`, editForm);

      setEditingStaff(null);

      await fetchStaff();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update staff account.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (member) => {
    try {
      setStatusUpdatingId(member._id);

      await api.put(`/staff/${member._id}/status`, {
        isActive: !member.isActive,
      });

      await fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080d]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

          <p className="text-sm text-slate-500">
            Loading staff accounts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Administration
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Staff Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {isAdmin
                  ? "Create, manage, and control staff access across Ruvasgod Auto departments."
                  : "View staff accounts and department assignments."}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setCreateError("");
                  setShowCreateForm(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
              >
                <span className="text-lg leading-none">+</span>
                Add Staff
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Total Staff
            </p>

            <p className="mt-3 text-2xl font-bold text-white">
              {staff.length}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Staff accounts
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Active
            </p>

            <p className="mt-3 text-2xl font-bold text-emerald-300">
              {activeStaffCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Currently enabled
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Managers
            </p>

            <p className="mt-3 text-2xl font-bold text-purple-300">
              {managerCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Management accounts
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Departments
            </p>

            <p className="mt-3 text-2xl font-bold text-cyan-300">
              {departmentCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Operational roles
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/30 focus:bg-white/[0.05]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0a0f16] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-cyan-400/30 lg:w-56"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>

            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-sm text-red-300">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-200">
                  Unable to load staff
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            {filteredStaff.length} result
            {filteredStaff.length === 1 ? "" : "s"}
          </p>

          {(search || roleFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
              }}
              className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Staff table */}
        {filteredStaff.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-500"
              >
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <path d="M16 11a3 3 0 1 0 0-6" />
                <path d="M18 14c1.8.8 3 2.7 3 6" />
              </svg>
            </div>

            <p className="mt-5 text-sm font-semibold text-white">
              No staff accounts found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Staff Member</th>
                    <th className="px-5 py-4 font-semibold">Phone</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Created</th>

                    {isAdmin && (
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.05]">
                  {filteredStaff.map((member) => (
                    <tr
                      key={member._id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-sm font-bold text-cyan-300">
                            {member.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-200">
                              {member.name || "Unnamed staff"}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-slate-400">
                        {member.phone || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <RoleBadge role={member.role} />
                      </td>

                      <td className="px-5 py-5">
                        <ActiveBadge isActive={member.isActive} />
                      </td>

                      <td className="px-5 py-5 text-xs text-slate-500">
                        {member.createdAt
                          ? new Date(
                              member.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {isAdmin && (
                        <td className="px-5 py-5">
                          {member.role === "admin" ? (
                            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                              Protected
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(member)}
                                className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.1]"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => toggleStatus(member)}
                                disabled={
                                  statusUpdatingId === member._id
                                }
                                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  member.isActive
                                    ? "border-red-400/20 bg-red-400/[0.05] text-red-300 hover:border-red-400/40 hover:bg-red-400/[0.1]"
                                    : "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-400/[0.1]"
                                }`}
                              >
                                {statusUpdatingId === member._id
                                  ? "Updating..."
                                  : member.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer status */}
        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Ruvasgod Auto · Administration</p>

            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Staff access workspace active
            </p>
          </div>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0f16] p-6 shadow-2xl shadow-black/50 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    New Account
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white">
                  Add Staff Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an operational staff account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError("");
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {createError && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
                <p className="text-sm font-semibold text-red-200">
                  Unable to create account
                </p>

                <p className="mt-1 text-sm text-red-300/70">
                  {createError}
                </p>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Phone
                </label>

                <input
                  type="text"
                  placeholder="Phone"
                  required
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Temporary Password
                </label>

                <input
                  type="password"
                  placeholder="Temporary password"
                  required
                  minLength={12}
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                />

                <p className="mt-2 text-xs text-slate-600">
                  Use at least 12 characters. The account can change its
                  password later.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Department Role
                </label>

                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 py-3 text-sm capitalize text-slate-300 outline-none focus:border-cyan-400/30"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateError("");
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0f16] p-6 shadow-2xl shadow-black/50 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Staff Account
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white">
                  Edit Staff Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingStaff.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Phone
                </label>

                <input
                  type="text"
                  placeholder="Phone"
                  required
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Department Role
                </label>

                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 py-3 text-sm capitalize text-slate-300 outline-none focus:border-cyan-400/30"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
