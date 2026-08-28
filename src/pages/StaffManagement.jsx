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
  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "" });
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
      const matchesRole = roleFilter === "all" || member.role === roleFilter;

      const matchesSearch =
        !search ||
        member.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.email?.toLowerCase().includes(search.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [staff, search, roleFilter]);

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
      alert(err.response?.data?.message || "Failed to update staff account.");
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading staff accounts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Staff Management
            </h1>

            <p className="mt-2 text-slate-500">
              {isAdmin
                ? "Create and manage staff accounts across departments."
                : "View staff accounts across departments."}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              + Add Staff
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 sm:w-64"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 sm:w-48"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-slate-500">No staff accounts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  {isAdmin && <th className="px-5 py-3">Actions</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => (
                  <tr key={member._id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {member.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{member.email}</td>
                    <td className="px-5 py-4 text-slate-600">{member.phone}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">
                      {member.role.replace("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          member.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {member.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    {isAdmin && (
                      <td className="px-5 py-4">
                        {member.role === "admin" ? (
                          <span className="text-xs text-slate-400">
                            Not editable here
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(member)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleStatus(member)}
                              disabled={statusUpdatingId === member._id}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                                member.isActive
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {member.isActive ? "Deactivate" : "Activate"}
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
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Add Staff Member</h2>

            {createError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Full name"
                required
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Phone"
                required
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm({ ...createForm, phone: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <input
                type="password"
                placeholder="Temporary password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ")}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateError("");
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStaff && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Edit Staff Member</h2>

            <p className="mt-2 text-slate-500">{editingStaff.email}</p>

            <form onSubmit={handleUpdateStaff} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Full name"
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Phone"
                required
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ")}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
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
