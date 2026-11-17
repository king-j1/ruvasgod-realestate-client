import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const AGREEMENT_TYPES = ["PURCHASE", "RENTAL", "LEASE"];

const emptyForm = {
  policyName: "",
  description: "",
  applicableAgreementTypes: ["PURCHASE", "RENTAL", "LEASE"],
  gracePeriodDays: 7,
  latePenalty: {
    type: "NONE",
    value: 0,
    maximumAmount: "",
    frequency: "ONCE",
  },
  reminders: {
    enabled: true,
    daysBeforeDue: "7, 3, 1",
    daysAfterDue: "1, 3, 7",
  },
  penaltyCap: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-amber-500 focus:outline-none";

const buttonClass =
  "rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function parseDays(value) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 365);
}

function toPayload(form, includeName = true) {
  const payload = {
    description: form.description.trim(),
    applicableAgreementTypes: form.applicableAgreementTypes,
    gracePeriodDays: Number(form.gracePeriodDays),
    latePenalty: {
      type: form.latePenalty.type,
      value: Number(form.latePenalty.value),
      maximumAmount:
        form.latePenalty.maximumAmount === ""
          ? null
          : Number(form.latePenalty.maximumAmount),
      frequency: form.latePenalty.frequency,
    },
    reminders: {
      enabled: form.reminders.enabled,
      daysBeforeDue: parseDays(form.reminders.daysBeforeDue),
      daysAfterDue: parseDays(form.reminders.daysAfterDue),
    },
    penaltyCap:
      form.penaltyCap === "" ? null : Number(form.penaltyCap),
  };

  if (includeName) payload.policyName = form.policyName.trim();

  return payload;
}

function policyToForm(policy) {
  return {
    ...emptyForm,
    policyName: policy.policyName || "",
    description: policy.description || "",
    applicableAgreementTypes: policy.applicableAgreementTypes || [],
    gracePeriodDays: policy.gracePeriodDays ?? 7,
    latePenalty: {
      ...emptyForm.latePenalty,
      ...policy.latePenalty,
      maximumAmount: policy.latePenalty?.maximumAmount ?? "",
    },
    reminders: {
      enabled: policy.reminders?.enabled ?? true,
      daysBeforeDue: (policy.reminders?.daysBeforeDue || []).join(", "),
      daysAfterDue: (policy.reminders?.daysAfterDue || []).join(", "),
    },
    penaltyCap: policy.penaltyCap ?? "",
  };
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function money(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export default function StaffPaymentPolicies() {
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("view");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = filter === "ALL" ? {} : { status: filter };
      const response = await api.get("/paims/policies", { params });
      const items = response.data?.policies || [];
      setPolicies(items);

      if (selected) {
        const refreshed = items.find((item) => item._id === selected._id);
        if (refreshed) setSelected(refreshed);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load payment policies."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, selected?._id]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const startCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setMode("create");
    setError("");
    setNotice("");
  };

  const selectPolicy = async (policy) => {
    setError("");
    setNotice("");

    try {
      const response = await api.get(`/paims/policies/${policy._id}`);
      setSelected(response.data.policy);
      setForm(policyToForm(response.data.policy));
      setMode("view");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load policy details."
      );
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updatePenalty = (field, value) => {
    setForm((current) => ({
      ...current,
      latePenalty: { ...current.latePenalty, [field]: value },
    }));
  };

  const updateReminders = (field, value) => {
    setForm((current) => ({
      ...current,
      reminders: { ...current.reminders, [field]: value },
    }));
  };

  const toggleAgreementType = (type) => {
    setForm((current) => {
      const exists = current.applicableAgreementTypes.includes(type);
      return {
        ...current,
        applicableAgreementTypes: exists
          ? current.applicableAgreementTypes.filter((item) => item !== type)
          : [...current.applicableAgreementTypes, type],
      };
    });
  };

  const validateForm = () => {
    if (mode === "create" && form.policyName.trim().length < 3) {
      return "Policy name must contain at least 3 characters.";
    }

    if (!form.applicableAgreementTypes.length) {
      return "Select at least one agreement type.";
    }

    if (
      !Number.isInteger(Number(form.gracePeriodDays)) ||
      Number(form.gracePeriodDays) < 0 ||
      Number(form.gracePeriodDays) > 365
    ) {
      return "Grace period must be between 0 and 365 days.";
    }

    if (
      form.latePenalty.type === "NONE" &&
      Number(form.latePenalty.value) !== 0
    ) {
      return "Penalty value must be zero when penalty type is NONE.";
    }

    if (
      form.latePenalty.type !== "NONE" &&
      Number(form.latePenalty.value) <= 0
    ) {
      return "Enter a penalty value greater than zero.";
    }

    if (
      form.latePenalty.type === "PERCENTAGE" &&
      Number(form.latePenalty.value) > 100
    ) {
      return "Percentage penalty cannot exceed 100.";
    }

    if (
      parseDays(form.reminders.daysBeforeDue).length !==
      form.reminders.daysBeforeDue.split(",").filter((v) => v.trim()).length
    ) {
      return "Check the reminder days before the due date.";
    }

    if (
      parseDays(form.reminders.daysAfterDue).length !==
      form.reminders.daysAfterDue.split(",").filter((v) => v.trim()).length
    ) {
      return "Check the reminder days after the due date.";
    }

    return "";
  };

  const savePolicy = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(form, mode === "create");

      const response =
        mode === "create"
          ? await api.post("/paims/policies", payload)
          : await api.patch(`/paims/policies/${selected._id}`, payload);

      const saved = response.data.policy;
      setSelected(saved);
      setForm(policyToForm(saved));
      setMode("view");
      setNotice(response.data.message || "Policy saved successfully.");
      await loadPolicies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save payment policy."
      );
    } finally {
      setSaving(false);
    }
  };

  const publishPolicy = async () => {
    if (!selected) return;

    const effectiveFrom = window.prompt(
      "Effective date (YYYY-MM-DD). Leave blank to publish from today:",
      ""
    );

    if (effectiveFrom === null) return;

    if (
      effectiveFrom.trim() &&
      !/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom.trim())
    ) {
      setError("Enter the effective date in YYYY-MM-DD format.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = effectiveFrom.trim()
        ? { effectiveFrom: effectiveFrom.trim() }
        : {};

      const response = await api.patch(
        `/paims/policies/${selected._id}/publish`,
        payload
      );

      setSelected(response.data.policy);
      setForm(policyToForm(response.data.policy));
      setNotice(response.data.message || "Policy published.");
      await loadPolicies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to publish policy."
      );
    } finally {
      setSaving(false);
    }
  };

  const archivePolicy = async () => {
    if (!selected) return;

    const reason = window.prompt(
      "Reason for archiving this policy:",
      "Policy archived by management."
    );

    if (reason === null) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        `/paims/policies/${selected._id}/archive`,
        { reason }
      );

      setSelected(response.data.policy);
      setForm(policyToForm(response.data.policy));
      setNotice(response.data.message || "Policy archived.");
      await loadPolicies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to archive policy."
      );
    } finally {
      setSaving(false);
    }
  };

  const isEditing = mode === "create" || mode === "edit";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Policies
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage PAIMS payment rules, late penalties and reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className={`${buttonClass} bg-amber-500 text-white hover:bg-amber-600`}
        >
          + Create policy
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.7fr)]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Filter policies
            </label>
            <select
              className={inputClass}
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setSelected(null);
                setMode("view");
              }}
            >
              <option value="ALL">All policies</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="max-h-[650px] divide-y divide-gray-100 overflow-y-auto">
            {loading ? (
              <p className="p-5 text-sm text-gray-500">Loading policies...</p>
            ) : policies.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">
                No payment policies found.
              </p>
            ) : (
              policies.map((policy) => (
                <button
                  type="button"
                  key={policy._id}
                  onClick={() => selectPolicy(policy)}
                  className={`block w-full p-4 text-left hover:bg-amber-50 ${
                    selected?._id === policy._id
                      ? "bg-amber-50"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-gray-900">
                      {policy.policyName}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {policy.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Version {policy.version} · Grace period:{" "}
                    {policy.gracePeriodDays} days
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Effective: {formatDate(policy.effectiveFrom)}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
          {mode === "view" && !selected ? (
            <div className="flex min-h-64 items-center justify-center text-center text-sm text-gray-500">
              Select a policy to view its details, or create a new policy.
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {mode === "create"
                      ? "Create payment policy"
                      : selected?.policyName}
                  </h2>
                  {selected && (
                    <p className="text-xs text-gray-500">
                      Version {selected.version} · {selected.status}
                    </p>
                  )}
                </div>

                {selected?.status === "DRAFT" && mode === "view" && (
                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-50`}
                  >
                    Edit draft
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={savePolicy} className="space-y-5">
                  {mode === "create" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Policy name *
                      </label>
                      <input
                        className={inputClass}
                        maxLength={150}
                        required
                        value={form.policyName}
                        onChange={(event) =>
                          updateField("policyName", event.target.value)
                        }
                        placeholder="e.g. Standard Residential Payment Policy"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      className={inputClass}
                      rows={3}
                      maxLength={3000}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Applicable agreement types *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {AGREEMENT_TYPES.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={form.applicableAgreementTypes.includes(type)}
                            onChange={() => toggleAgreementType(type)}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Grace period (days) *
                    </label>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      max="365"
                      required
                      value={form.gracePeriodDays}
                      onChange={(event) =>
                        updateField("gracePeriodDays", event.target.value)
                      }
                    />
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 font-semibold text-gray-800">
                      Late penalty
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm">Penalty type</label>
                        <select
                          className={inputClass}
                          value={form.latePenalty.type}
                          onChange={(event) => {
                            const type = event.target.value;
                            updatePenalty("type", type);
                            if (type === "NONE") updatePenalty("value", 0);
                          }}
                        >
                          <option value="NONE">No penalty</option>
                          <option value="FIXED">Fixed amount</option>
                          <option value="PERCENTAGE">Percentage</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">Penalty value</label>
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={form.latePenalty.type === "NONE"}
                          value={form.latePenalty.value}
                          onChange={(event) =>
                            updatePenalty("value", event.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Frequency
                        </label>
                        <select
                          className={inputClass}
                          value={form.latePenalty.frequency}
                          onChange={(event) =>
                            updatePenalty("frequency", event.target.value)
                          }
                        >
                          <option value="ONCE">Once</option>
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Maximum penalty amount
                        </label>
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.latePenalty.maximumAmount}
                          onChange={(event) =>
                            updatePenalty("maximumAmount", event.target.value)
                          }
                          placeholder="No separate maximum"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 font-semibold text-gray-800">
                      Payment reminders
                    </h3>

                    <label className="mb-3 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.reminders.enabled}
                        onChange={(event) =>
                          updateReminders("enabled", event.target.checked)
                        }
                      />
                      Enable payment reminders
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm">
                          Days before due date
                        </label>
                        <input
                          className={inputClass}
                          value={form.reminders.daysBeforeDue}
                          onChange={(event) =>
                            updateReminders("daysBeforeDue", event.target.value)
                          }
                          placeholder="7, 3, 1"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Days after due date
                        </label>
                        <input
                          className={inputClass}
                          value={form.reminders.daysAfterDue}
                          onChange={(event) =>
                            updateReminders("daysAfterDue", event.target.value)
                          }
                          placeholder="1, 3, 7"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Overall penalty cap
                    </label>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.penaltyCap}
                      onChange={(event) =>
                        updateField("penaltyCap", event.target.value)
                      }
                      placeholder="Leave blank for no cap"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`${buttonClass} bg-amber-500 text-white hover:bg-amber-600`}
                    >
                      {saving ? "Saving..." : "Save policy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("view");
                        if (selected) setForm(policyToForm(selected));
                      }}
                      className={`${buttonClass} border border-gray-300 text-gray-700`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selected ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1 text-sm text-gray-800">
                      {selected.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Agreement types</p>
                      <p className="mt-1 text-sm font-medium">
                        {(selected.applicableAgreementTypes || []).join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grace period</p>
                      <p className="mt-1 text-sm font-medium">
                        {selected.gracePeriodDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Penalty type</p>
                      <p className="mt-1 text-sm font-medium">
                        {selected.latePenalty?.type || "NONE"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Penalty value</p>
                      <p className="mt-1 text-sm font-medium">
                        {selected.latePenalty?.type === "PERCENTAGE"
                          ? `${money(selected.latePenalty.value)}%`
                          : selected.latePenalty?.type === "FIXED"
                            ? money(selected.latePenalty.value)
                            : "No penalty"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Penalty frequency</p>
                      <p className="mt-1 text-sm font-medium">
                        {selected.latePenalty?.frequency || "ONCE"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Maximum penalty</p>
                      <p className="mt-1 text-sm font-medium">
                        {money(selected.latePenalty?.maximumAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Overall penalty cap</p>
                      <p className="mt-1 text-sm font-medium">
                        {money(selected.penaltyCap)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Effective from</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatDate(selected.effectiveFrom)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-800">
                      Reminder configuration
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Reminders: {selected.reminders?.enabled ? "Enabled" : "Disabled"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Before due: {(selected.reminders?.daysBeforeDue || []).join(", ") || "—"} days
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      After due: {(selected.reminders?.daysAfterDue || []).join(", ") || "—"} days
                    </p>
                  </div>

                  <div className="grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                    <p>Created: {formatDate(selected.createdAt)}</p>
                    <p>Published: {formatDate(selected.publishedAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                    {selected.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={publishPolicy}
                        disabled={saving}
                        className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}
                      >
                        Publish policy
                      </button>
                    )}

                    {selected.status === "PUBLISHED" && (
                      <button
                        type="button"
                        onClick={archivePolicy}
                        disabled={saving}
                        className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
                      >
                        Archive policy
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
