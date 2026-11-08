import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const STATUSES = [
  "NEW",
  "CONTACTED",
  "VIEWING_SCHEDULED",
  "CONVERTED",
  "CLOSED",
];

function StaffPropertyEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [staff, setStaff] = useState([]);

  const loadEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/property-enquiries");
      setEnquiries(
        Array.isArray(response.data?.enquiries)
          ? response.data.enquiries
          : []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load property enquiries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await api.get("/staff");
        setStaff(
          (Array.isArray(response.data?.staff) ? response.data.staff : [])
            .filter((member) => member.isActive && member.role !== "admin")
        );
      } catch (requestError) {
        console.error("Unable to load staff assignment options:", requestError);
      }
    };

    loadStaff();
  }, []);

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enquiries.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.property?.title?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, search, statusFilter]);

  const updateAssignment = async (id, assignedTo) => {
    try {
      setBusyId(id);
      setError("");
      setNotice("");

      const response = await api.patch(`/property-enquiries/${id}`, {
        assignedTo: assignedTo || null,
      });

      setEnquiries((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, ...response.data.enquiry }
            : item
        )
      );

      setNotice("Enquiry assignment updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to assign this enquiry."
      );
      await loadEnquiries();
    } finally {
      setBusyId("");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setBusyId(id);
      setError("");
      setNotice("");

      const response = await api.patch(`/property-enquiries/${id}`, {
        status,
      });

      setEnquiries((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, ...response.data.enquiry }
            : item
        )
      );

      setNotice("Enquiry status updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update enquiry status."
      );
      await loadEnquiries();
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Customer operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Property enquiries
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Review customer enquiries and manage their progress.
          </p>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {STATUSES.slice(0, 3).map((status) => (
            <div
              key={status}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {status.replaceAll("_", " ")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">
                {enquiries.filter((item) => item.status === status).length}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_240px]">
          <label className="text-sm font-semibold text-stone-700">
            Search enquiries
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Customer, email, phone or property"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5"
            />
          </label>

          <label className="text-sm font-semibold text-stone-700">
            Filter by status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5"
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        {notice && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadEnquiries}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <p role="status" className="py-8 text-sm text-stone-600">
            Loading property enquiries…
          </p>
        )}

        {!loading && !error && filteredEnquiries.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="font-semibold text-stone-900">
              {enquiries.length
                ? "No enquiries match your search"
                : "No property enquiries yet"}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              New customer enquiries will appear here.
            </p>
          </div>
        )}

        {!loading && filteredEnquiries.length > 0 && (
          <div className="space-y-4">
            {filteredEnquiries.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                      Property enquiry
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-stone-900">
                      {item.property?.title || "Property record unavailable"}
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      Received{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <label className="text-sm font-semibold text-stone-700">
                    Enquiry status
                    <select
                      value={item.status}
                      disabled={busyId === item._id}
                      onChange={(event) =>
                        updateStatus(item._id, event.target.value)
                      }
                      className="mt-1 block min-h-10 w-full rounded-lg border border-stone-300 bg-white px-3 disabled:opacity-60"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 max-w-sm">
                  <label className="block text-sm font-semibold text-stone-700">
                    Assign to staff member
                    <select
                      value={item.assignedTo?._id || item.assignedTo || ""}
                      disabled={busyId === item._id}
                      onChange={(event) =>
                        updateAssignment(item._id, event.target.value)
                      }
                      className="mt-1.5 min-h-10 w-full rounded-lg border border-stone-300 bg-white px-3 disabled:opacity-60"
                    >
                      <option value="">Unassigned</option>
                      {staff.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">
                      Customer
                    </p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {item.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">
                      Email
                    </p>
                    <a
                      href={`mailto:${item.email}`}
                      className="mt-1 block break-all text-sm text-amber-900 underline"
                    >
                      {item.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">
                      Phone
                    </p>
                    <a
                      href={`tel:${item.phone}`}
                      className="mt-1 block text-sm text-amber-900 underline"
                    >
                      {item.phone}
                    </a>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    Customer message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">
                    {item.message}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-5 text-xs text-stone-500">
          Showing {filteredEnquiries.length} of {enquiries.length} enquiries.
        </p>
      </div>
    </main>
  );
}

export default StaffPropertyEnquiries;
