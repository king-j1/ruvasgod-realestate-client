
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const categories = [
  "LAND",
  "HOUSE",
  "APARTMENT",
  "COMMERCIAL",
  "INDUSTRIAL",
];

const agreementTypes = ["PURCHASE", "RENTAL", "LEASE"];

const emptyClause = {
  title: "",
  content: "",
  required: true,
};

const initialForm = {
  name: "",
  agreementType: "PURCHASE",
  propertyCategories: ["LAND"],
  clauses: [{ ...emptyClause }],
};

function StaffAgreementTemplates() {
  const [form, setForm] = useState(initialForm);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/paims/templates");

      setTemplates(response.data.templates || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load agreement templates."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCategoryChange = (category) => {
    setForm((previous) => {
      const selected = previous.propertyCategories.includes(category);

      return {
        ...previous,
        propertyCategories: selected
          ? previous.propertyCategories.filter(
              (item) => item !== category
            )
          : [...previous.propertyCategories, category],
      };
    });
  };

  const handleClauseChange = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      clauses: previous.clauses.map((clause, i) =>
        i === index
          ? { ...clause, [field]: value }
          : clause
      ),
    }));
  };

  const addClause = () => {
    setForm((previous) => ({
      ...previous,
      clauses: [
        ...previous.clauses,
        { ...emptyClause },
      ],
    }));
  };

  const removeClause = (index) => {
    setForm((previous) => ({
      ...previous,
      clauses: previous.clauses.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.propertyCategories.length === 0) {
      setError("Please select at least one property category.");
      return;
    }

    if (form.clauses.length === 0) {
      setError("Please add at least one agreement clause.");
      return;
    }

    for (const clause of form.clauses) {
      if (!clause.title.trim() || !clause.content.trim()) {
        setError("Every clause needs a title and content.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        agreementType: form.agreementType,
        propertyCategories: form.propertyCategories,
        clauses: form.clauses.map((clause) => ({
          title: clause.title.trim(),
          content: clause.content.trim(),
          required: clause.required,
        })),
      };

      const response = await api.post(
        "/paims/templates",
        payload
      );

      setSuccess(
        response.data.message ||
          "Agreement template created successfully."
      );

      setForm(initialForm);

      await loadTemplates();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create agreement template."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (templateId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this agreement template?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      setApprovingId(templateId);

      const response = await api.patch(
        `/paims/templates/${templateId}/approve`
      );

      setSuccess(
        response.data.message ||
          "Agreement template approved successfully."
      );

      await loadTemplates();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to approve agreement template."
      );
    } finally {
      setApprovingId(null);
    }
  };

  const formatType = (type) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
          PAIMS MANAGEMENT
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Agreement Templates
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Create, manage and approve reusable property
          agreement templates.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* CREATE TEMPLATE */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-gray-900">
          Create Agreement Template
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          New templates are saved as drafts until approved.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Template Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              minLength={3}
              maxLength={150}
              required
              placeholder="e.g. Residential Land Purchase Agreement"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Agreement Type
            </label>

            <select
              name="agreementType"
              value={form.agreementType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
            >
              {agreementTypes.map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Property Categories
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-amber-50"
                >
                  <input
                    type="checkbox"
                    checked={form.propertyCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="h-4 w-4 accent-amber-600"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">
                  Agreement Clauses
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add the rules and conditions for this agreement.
                </p>
              </div>

              <button
                type="button"
                onClick={addClause}
                className="rounded-lg border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
              >
                + Add Clause
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {form.clauses.map((clause, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-gray-800">
                      Clause {index + 1}
                    </h4>

                    {form.clauses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClause(index)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Clause Title
                    </label>

                    <input
                      type="text"
                      value={clause.title}
                      onChange={(event) =>
                        handleClauseChange(
                          index,
                          "title",
                          event.target.value
                        )
                      }
                      minLength={2}
                      maxLength={150}
                      required
                      placeholder="e.g. Purchase Price"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Clause Content
                    </label>

                    <textarea
                      value={clause.content}
                      onChange={(event) =>
                        handleClauseChange(
                          index,
                          "content",
                          event.target.value
                        )
                      }
                      required
                      maxLength={20000}
                      rows={5}
                      placeholder="Write the agreement condition here..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-amber-500"
                    />
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={clause.required}
                      onChange={(event) =>
                        handleClauseChange(
                          index,
                          "required",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-amber-600"
                    />

                    This clause is compulsory
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
          </div>
        </form>
      </section>

      {/* EXISTING TEMPLATES */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Existing Templates
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review and approve your agreement templates.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTemplates}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading templates...
          </p>
        ) : templates.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-medium text-gray-700">
              No templates found.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Create your first agreement template above.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {templates.map((template) => (
              <div
                key={template._id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {template.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatType(template.agreementType)} · Version{" "}
                      {template.version}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      template.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : template.status === "DRAFT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {template.status}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Property Categories
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {template.propertyCategories?.join(", ") ||
                      "All categories"}
                  </p>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {template.clauses?.length || 0} clauses
                </p>

                {template.status === "DRAFT" &&
                  template.isActive !== false && (
                    <button
                      type="button"
                      onClick={() => handleApprove(template._id)}
                      disabled={approvingId === template._id}
                      className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {approvingId === template._id
                        ? "Approving..."
                        : "Approve Template"}
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffAgreementTemplates;
