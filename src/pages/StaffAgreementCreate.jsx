
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const initialForm = {
  agreementType: "PURCHASE",
  property: "",
  customer: "",
  template: "",
  currency: "GHS",
  propertyPrice: "",
  agreedAmount: "",
  depositAmount: "",
  purchasePaymentMethod: "",
  installmentAmount: "",
  installmentFrequency: "MONTHLY",
  totalInstallments: "",
  rentalPeriod: "MONTHLY",
  advanceRent: "",
  securityDeposit: "",
  startDate: "",
  endDate: "",
};

const money = (value) => Number(value);

function StaffAgreementCreate() {
  const [form, setForm] = useState(initialForm);
  const [properties, setProperties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const isPurchase = form.agreementType === "PURCHASE";
  const isRentalOrLease = !isPurchase;

  const requiredListingType = isPurchase ? "SALE" : "RENT";

  const eligibleProperties = useMemo(
    () =>
      properties.filter(
        (property) =>
          property.listingType === requiredListingType &&
          property.verificationStatus === "VERIFIED" &&
          property.listingStatus === "PUBLISHED"
      ),
    [properties, requiredListingType]
  );

  const selectedProperty = eligibleProperties.find(
    (property) => property._id === form.property
  );

  const acceptedPaymentMethods = useMemo(() => {
    if (!isPurchase || !selectedProperty) return [];

    const methods = Array.isArray(selectedProperty.acceptedPaymentMethods)
      ? selectedProperty.acceptedPaymentMethods
      : [];

    return methods.filter((method) =>
      ["FULL_PAYMENT", "INSTALLMENTS"].includes(method)
    );
  }, [isPurchase, selectedProperty]);

  const installmentSummary = useMemo(() => {
    const agreed = Number(form.agreedAmount);
    const deposit = Number(form.depositAmount);
    const installment = Number(form.installmentAmount);
    const count = Number(form.totalInstallments);

    const valid =
      form.agreedAmount !== "" &&
      form.depositAmount !== "" &&
      form.installmentAmount !== "" &&
      form.totalInstallments !== "" &&
      Number.isFinite(agreed) &&
      Number.isFinite(deposit) &&
      Number.isFinite(installment) &&
      Number.isInteger(count) &&
      agreed > 0 &&
      deposit >= 0 &&
      deposit < agreed &&
      installment > 0 &&
      count >= 1 &&
      count <= 1200;

    if (!valid) {
      return { ready: false };
    }

    const remainingCents = Math.round((agreed - deposit) * 100);
    const scheduledCents = Math.round(installment * 100) * count;
    const differenceCents = remainingCents - scheduledCents;

    return {
      ready: true,
      remaining: remainingCents / 100,
      scheduled: scheduledCents / 100,
      difference: differenceCents / 100,
      balanced: differenceCents === 0,
    };
  }, [
    form.agreedAmount,
    form.depositAmount,
    form.installmentAmount,
    form.totalInstallments,
  ]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: form.currency,
      maximumFractionDigits: 2,
    }).format(amount);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [propertyResponse, customerResponse] = await Promise.all([
        api.get("/properties/staff/all"),
        api.get("/staff/customers"),
      ]);

      setProperties(
        Array.isArray(propertyResponse.data?.properties)
          ? propertyResponse.data.properties
          : []
      );

      setCustomers(
        Array.isArray(customerResponse.data?.customers)
          ? customerResponse.data.customers.filter(
              (customer) => customer.isActive !== false
            )
          : []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load properties or customers. Please check your access and connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    let cancelled = false;

    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true);
        setTemplates([]);

        const response = await api.get(
          `/paims/templates?agreementType=${form.agreementType}`
        );

        if (!cancelled) {
          const approved = Array.isArray(response.data?.templates)
            ? response.data.templates.filter(
                (template) => template.status === "APPROVED"
              )
            : [];

          setTemplates(approved);
        }
      } catch {
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    };

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [form.agreementType]);

  const changeAgreementType = (event) => {
    const agreementType = event.target.value;

    setForm((current) => ({
      ...initialForm,
      agreementType,
      currency: current.currency,
      startDate: current.startDate,
    }));

    setError("");
    setSuccess(null);
  };

  const changeProperty = (event) => {
    const propertyId = event.target.value;

    const property = eligibleProperties.find(
      (item) => item._id === propertyId
    );

    setForm((current) => ({
      ...current,
      property: propertyId,
      currency: property?.currency || "GHS",
      propertyPrice: isPurchase ? String(property?.price ?? "") : "",
      agreedAmount: isPurchase ? String(property?.price ?? "") : "",
      depositAmount: "",
      purchasePaymentMethod: "",
      installmentAmount: "",
      totalInstallments: "",
    }));

    setError("");
  };

  const changePurchasePaymentMethod = (event) => {
    const purchasePaymentMethod = event.target.value;

    setForm((current) => ({
      ...current,
      purchasePaymentMethod,
      depositAmount:
        purchasePaymentMethod === "FULL_PAYMENT"
          ? "0"
          : current.purchasePaymentMethod === "FULL_PAYMENT"
            ? ""
            : current.depositAmount,
      installmentAmount:
        purchasePaymentMethod === "FULL_PAYMENT"
          ? ""
          : current.installmentAmount,
      totalInstallments:
        purchasePaymentMethod === "FULL_PAYMENT"
          ? ""
          : current.totalInstallments,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!form.property || !form.customer || !form.startDate) {
      setError(
        "Please select a property, customer and agreement start date."
      );
      return;
    }

    if (!selectedProperty) {
      setError("Please select an eligible property.");
      return;
    }

    const agreedAmount = money(form.agreedAmount);
    const depositAmount = money(form.depositAmount);

    if (
      !Number.isFinite(agreedAmount) ||
      agreedAmount <= 0 ||
      !Number.isFinite(depositAmount) ||
      depositAmount < 0
    ) {
      setError("Enter a valid agreed amount and deposit amount.");
      return;
    }

    if (depositAmount > agreedAmount) {
      setError("The deposit cannot exceed the agreed amount.");
      return;
    }

    if (isPurchase) {
      if (
        !form.purchasePaymentMethod ||
        !acceptedPaymentMethods.includes(form.purchasePaymentMethod)
      ) {
        setError(
          "Please select a payment method accepted by this property."
        );
        return;
      }

      if (
        form.purchasePaymentMethod === "FULL_PAYMENT" &&
        depositAmount !== 0
      ) {
        setError(
          "Full-payment agreements must have a deposit amount of zero."
        );
        return;
      }

      if (
        form.purchasePaymentMethod === "INSTALLMENTS" &&
        depositAmount >= agreedAmount
      ) {
        setError(
          "For an instalment agreement, the deposit must be less than the agreed amount."
        );
        return;
      }

      if (!form.propertyPrice || money(form.propertyPrice) <= 0) {
        setError("Property price is required for a purchase agreement.");
        return;
      }
    }

    if (isRentalOrLease && !form.rentalPeriod) {
      setError("Please select the rental or lease payment period.");
      return;
    }

    if (form.endDate && form.endDate <= form.startDate) {
      setError("The agreement end date must be after its start date.");
      return;
    }

    const financialTerms = {
      agreedAmount,
      depositAmount,
    };

    if (isPurchase) {
      financialTerms.propertyPrice = money(form.propertyPrice);

      if (form.purchasePaymentMethod === "INSTALLMENTS") {
        if (
          form.installmentAmount === "" ||
          form.totalInstallments === ""
        ) {
          setError(
            "Please enter the instalment amount and number of instalments."
          );
          return;
        }

        const installmentAmount = money(form.installmentAmount);
        const totalInstallments = Number(form.totalInstallments);

        if (
          !Number.isFinite(installmentAmount) ||
          installmentAmount <= 0
        ) {
          setError("Enter a valid instalment amount.");
          return;
        }

        if (
          !Number.isInteger(totalInstallments) ||
          totalInstallments < 1 ||
          totalInstallments > 1200
        ) {
          setError("Enter a valid number of instalments.");
          return;
        }

        const remainingCents = Math.round(
          (agreedAmount - depositAmount) * 100
        );

        const scheduledCents =
          Math.round(installmentAmount * 100) * totalInstallments;

        if (scheduledCents !== remainingCents) {
          setError(
            scheduledCents < remainingCents
              ? "Your instalments do not cover the full outstanding balance."
              : "Your instalment schedule exceeds the outstanding balance."
          );
          return;
        }

        financialTerms.installmentAmount = installmentAmount;
        financialTerms.installmentFrequency =
          form.installmentFrequency;
        financialTerms.totalInstallments = totalInstallments;
      }
    } else {
      financialTerms.rentalPeriod = form.rentalPeriod;

      if (form.advanceRent !== "") {
        financialTerms.advanceRent = money(form.advanceRent);
      }

      if (form.securityDeposit !== "") {
        financialTerms.securityDeposit = money(form.securityDeposit);
      }
    }

    const payload = {
      agreementType: form.agreementType,
      property: form.property,
      customer: form.customer,
      currency: form.currency,
      financialTerms,
      startDate: form.startDate,
    };

    if (isPurchase) {
      payload.purchasePaymentMethod = form.purchasePaymentMethod;
    }

    if (form.template) payload.template = form.template;
    if (form.endDate) payload.endDate = form.endDate;

    try {
      setSubmitting(true);

      const response = await api.post("/paims/agreements", payload);

      setSuccess(response.data?.agreement || {});
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to create the agreement. Please check the information and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-900 outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100";

  const labelClass = "block text-sm font-semibold text-stone-700";

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7">
          <Link
            to="/staff/dashboard"
            className="text-sm font-semibold text-amber-900 hover:underline"
          >
            ← Staff dashboard
          </Link>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Property agreement management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Create Property Agreement
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Prepare a purchase, rental or lease agreement for an eligible
            property and verified customer.
          </p>
        </header>

        {error && (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5"
            role="status"
          >
            <h2 className="font-bold text-green-900">
              Agreement created successfully
            </h2>

            <p className="mt-2 text-sm text-green-800">
              Agreement number:{" "}
              <strong>{success.agreementNumber || "Created"}</strong>
            </p>

            <p className="mt-1 text-sm text-green-800">
              Initial status: {success.status || "DRAFT"}
            </p>

            <p className="mt-2 text-xs text-green-800">
              The agreement is saved as a draft and must follow the existing
              review and approval process.
            </p>

            <button
              className="mt-4 font-semibold text-green-900 underline"
              onClick={() => setSuccess(null)}
              type="button"
            >
              Create another agreement
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">
            Loading properties and customers…
          </div>
        ) : (
          <form
            className="space-y-7 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
            onSubmit={handleSubmit}
          >
            <section>
              <h2 className="text-lg font-bold text-stone-900">
                1. Agreement details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Agreement type *
                  <select
                    className={inputClass}
                    name="agreementType"
                    value={form.agreementType}
                    onChange={changeAgreementType}
                  >
                    <option value="PURCHASE">Purchase</option>
                    <option value="RENTAL">Rental</option>
                    <option value="LEASE">Lease</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Agreement template
                  <select
                    className={inputClass}
                    name="template"
                    value={form.template}
                    onChange={updateField}
                    disabled={templatesLoading}
                  >
                    <option value="">
                      {templatesLoading
                        ? "Loading templates…"
                        : "No template selected"}
                    </option>

                    {templates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name} (v{template.version})
                      </option>
                    ))}
                  </select>

                  <span className="mt-1 block text-xs font-normal text-stone-500">
                    Only approved templates for this agreement type are shown.
                  </span>
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  Eligible property *
                  <select
                    className={inputClass}
                    name="property"
                    value={form.property}
                    onChange={changeProperty}
                    required
                  >
                    <option value="">Select a property</option>

                    {eligibleProperties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.title} — {property.propertyType} —{" "}
                        {property.currency || "GHS"}{" "}
                        {Number(property.price || 0).toLocaleString("en-GH")}
                      </option>
                    ))}
                  </select>

                  <span className="mt-1 block text-xs font-normal text-stone-500">
                    Showing verified, published {requiredListingType} listings
                    only.
                  </span>

                  {!eligibleProperties.length && (
                    <span className="mt-1 block text-xs font-medium text-amber-800">
                      No eligible properties are currently available for this
                      transaction type.
                    </span>
                  )}
                </label>

                {selectedProperty && (
                  <div className="rounded-xl bg-stone-50 p-4 text-sm sm:col-span-2">
                    <p className="font-semibold text-stone-900">
                      {selectedProperty.title}
                    </p>

                    <p className="mt-1 text-stone-600">
                      {selectedProperty.propertyType} ·{" "}
                      {[
                        selectedProperty.address?.area,
                        selectedProperty.address?.city,
                        selectedProperty.address?.region,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}

                {isPurchase && selectedProperty && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:col-span-2">
                    <h3 className="font-semibold text-stone-900">
                      Accepted purchase payment methods *
                    </h3>

                    {acceptedPaymentMethods.length > 0 ? (
                      <>
                        <p className="mt-1 text-sm text-stone-600">
                          Select one of the payment methods configured for this
                          property.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {acceptedPaymentMethods.includes("FULL_PAYMENT") && (
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
                              <input
                                className="mt-1 h-4 w-4 accent-amber-800"
                                type="radio"
                                name="purchasePaymentMethod"
                                value="FULL_PAYMENT"
                                checked={
                                  form.purchasePaymentMethod === "FULL_PAYMENT"
                                }
                                onChange={changePurchasePaymentMethod}
                              />

                              <span>
                                <span className="block font-semibold text-stone-900">
                                  Full payment
                                </span>
                                <span className="mt-1 block text-xs text-stone-600">
                                  Customer pays the complete agreed amount in
                                  one payment.
                                </span>
                              </span>
                            </label>
                          )}

                          {acceptedPaymentMethods.includes("INSTALLMENTS") && (
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
                              <input
                                className="mt-1 h-4 w-4 accent-amber-800"
                                type="radio"
                                name="purchasePaymentMethod"
                                value="INSTALLMENTS"
                                checked={
                                  form.purchasePaymentMethod === "INSTALLMENTS"
                                }
                                onChange={changePurchasePaymentMethod}
                              />

                              <span>
                                <span className="block font-semibold text-stone-900">
                                  Instalment payments
                                </span>
                                <span className="mt-1 block text-xs text-stone-600">
                                  Customer pays according to an agreed
                                  instalment arrangement.
                                </span>
                              </span>
                            </label>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-red-700">
                        This property has no accepted purchase payment method
                        configured. Please ask an administrator to configure
                        its payment methods before creating an agreement.
                      </p>
                    )}
                  </div>
                )}

                <label className={`${labelClass} sm:col-span-2`}>
                  Customer *
                  <select
                    className={inputClass}
                    name="customer"
                    value={form.customer}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select a customer</option>

                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} — {customer.email}
                      </option>
                    ))}
                  </select>

                  <span className="mt-1 block text-xs font-normal text-stone-500">
                    The backend checks customer account status and verified
                    KYC before creating the agreement.
                  </span>
                </label>
              </div>
            </section>

            <div className="border-t border-stone-100" />

            <section>
              <h2 className="text-lg font-bold text-stone-900">
                2. Financial terms
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Currency
                  <select
                    className={inputClass}
                    name="currency"
                    value={form.currency}
                    onChange={updateField}
                  >
                    <option value="GHS">GHS — Ghana Cedi</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </label>

                {isPurchase && (
                  <label className={labelClass}>
                    Property price *
                    <input
                      className={inputClass}
                      type="number"
                      min="0.01"
                      step="0.01"
                      name="propertyPrice"
                      value={form.propertyPrice}
                      onChange={updateField}
                      required
                    />
                  </label>
                )}

                <label className={labelClass}>
                  Agreed amount *
                  <input
                    className={inputClass}
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="agreedAmount"
                    value={form.agreedAmount}
                    onChange={updateField}
                    required
                  />
                </label>

                {isPurchase &&
                  form.purchasePaymentMethod === "FULL_PAYMENT" && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 sm:col-span-2">
                      <p className="font-semibold text-green-900">
                        Full payment selected
                      </p>
                      <p className="mt-1 text-sm text-green-800">
                        The deposit is set to zero. The complete agreed amount
                        will be payable in one payment.
                      </p>
                    </div>
                  )}

                {(!isPurchase ||
                  form.purchasePaymentMethod !== "FULL_PAYMENT") && (
                  <label className={labelClass}>
                    Deposit amount *
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.01"
                      name="depositAmount"
                      value={form.depositAmount}
                      onChange={updateField}
                      required
                    />
                  </label>
                )}

                {isPurchase &&
                  form.purchasePaymentMethod === "INSTALLMENTS" && (
                    <>
                      <label className={labelClass}>
                        Instalment amount
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step="0.01"
                          name="installmentAmount"
                          value={form.installmentAmount}
                          onChange={updateField}
                        />
                      </label>

                      <label className={labelClass}>
                        Instalment frequency
                        <select
                          className={inputClass}
                          name="installmentFrequency"
                          value={form.installmentFrequency}
                          onChange={updateField}
                        >
                          <option value="WEEKLY">Weekly</option>
                          <option value="BIWEEKLY">Every two weeks</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="QUARTERLY">Quarterly</option>
                          <option value="CUSTOM">Custom</option>
                        </select>
                      </label>

                      <label className={labelClass}>
                        Number of instalments
                        <input
                          className={inputClass}
                          type="number"
                          min="1"
                          max="1200"
                          step="1"
                          name="totalInstallments"
                          value={form.totalInstallments}
                          onChange={updateField}
                        />
                      </label>

                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 sm:col-span-2">
                        <h3 className="font-bold text-stone-900">
                          Instalment payment summary
                        </h3>

                        {installmentSummary.ready ? (
                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between gap-3">
                              <span className="text-stone-600">
                                Remaining balance
                              </span>
                              <strong>
                                {formatMoney(installmentSummary.remaining)}
                              </strong>
                            </div>

                            <div className="flex justify-between gap-3">
                              <span className="text-stone-600">
                                Total scheduled instalments
                              </span>
                              <strong>
                                {formatMoney(installmentSummary.scheduled)}
                              </strong>
                            </div>

                            <div className="flex justify-between gap-3 border-t border-stone-200 pt-3">
                              <span className="font-semibold">
                                Unallocated balance
                              </span>
                              <strong
                                className={
                                  installmentSummary.balanced
                                    ? "text-green-700"
                                    : "text-red-700"
                                }
                              >
                                {formatMoney(installmentSummary.difference)}
                              </strong>
                            </div>

                            <div
                              className={
                                installmentSummary.balanced
                                  ? "rounded-lg bg-green-50 p-3 text-sm text-green-800"
                                  : "rounded-lg bg-red-50 p-3 text-sm text-red-800"
                              }
                            >
                              {installmentSummary.balanced
                                ? "Payment schedule is balanced. The full outstanding amount is covered."
                                : installmentSummary.difference > 0
                                  ? "Payment schedule is incomplete. More money must be allocated."
                                  : "Payment schedule exceeds the outstanding balance. Please correct the figures."}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-stone-600">
                            Enter the agreed amount, deposit, instalment amount
                            and number of instalments to see the payment
                            calculation.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                {isRentalOrLease && (
                  <>
                    <label className={labelClass}>
                      Rental / lease period *
                      <select
                        className={inputClass}
                        name="rentalPeriod"
                        value={form.rentalPeriod}
                        onChange={updateField}
                        required
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    </label>

                    <label className={labelClass}>
                      Advance rent
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        step="0.01"
                        name="advanceRent"
                        value={form.advanceRent}
                        onChange={updateField}
                      />
                    </label>

                    <label className={labelClass}>
                      Security deposit
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        step="0.01"
                        name="securityDeposit"
                        value={form.securityDeposit}
                        onChange={updateField}
                      />
                    </label>
                  </>
                )}
              </div>
            </section>

            <div className="border-t border-stone-100" />

            <section>
              <h2 className="text-lg font-bold text-stone-900">
                3. Agreement dates
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Start date *
                  <input
                    className={inputClass}
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className={labelClass}>
                  End date
                  <input
                    className={inputClass}
                    type="date"
                    name="endDate"
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={updateField}
                  />
                </label>
              </div>
            </section>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Submitting creates a draft agreement. It does not automatically
              approve, activate or sign the agreement. Existing PAIMS review
              and approval controls remain in place.
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                to="/staff/dashboard"
              >
                Cancel
              </Link>

              <button
                className="button-primary rounded-xl px-6 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={
                  submitting ||
                  !eligibleProperties.length ||
                  !customers.length
                }
              >
                {submitting ? "Creating agreement…" : "Create draft agreement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default StaffAgreementCreate;