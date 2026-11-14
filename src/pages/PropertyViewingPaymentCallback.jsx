import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

function PropertyViewingPaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Verifying your viewing payment...");

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const reference =
        searchParams.get("reference") || searchParams.get("trxref");

      if (!reference) {
        if (active) {
          setStatus("error");
          setMessage("No payment reference was provided.");
        }
        return;
      }

      if (searchParams.get("status") === "cancelled") {
        if (active) {
          setStatus("error");
          setMessage("The payment process was cancelled. Your viewing request may still be awaiting payment.");
        }
        return;
      }

      const storageKey = `ruva:viewing-payment:${reference}`;
      const paymentAccessToken = sessionStorage.getItem(storageKey);

      if (!paymentAccessToken) {
        if (active) {
          setStatus("error");
          setMessage("We could not find the secure payment session in this browser. Please contact our team with your payment reference.");
        }
        return;
      }

      try {
        const { data } = await api.post("/property-viewings/payment/verify", {
          reference,
          paymentAccessToken,
        });

        if (!active) return;

        if (data?.success && data?.paymentStatus === "PAID") {
          sessionStorage.removeItem(storageKey);
          setStatus("success");
          setMessage("Your viewing payment has been verified successfully. Our team will contact you to confirm your appointment.");
        } else {
          setStatus("error");
          setMessage(data?.message || "We could not verify this payment.");
        }
      } catch (error) {
        if (!active) return;

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "We could not verify your payment at this time. Please contact our team with your payment reference."
        );
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <main className="min-h-[65vh] bg-[#fffdf8] px-5 py-16">
      <section className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
          {status === "checking" ? "…" : status === "success" ? "✓" : "!"}
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-stone-900">
          {status === "checking"
            ? "Checking payment"
            : status === "success"
              ? "Payment confirmed"
              : "Payment not confirmed"}
        </h1>

        <p
          className="mt-3 text-sm leading-6 text-stone-600"
          role="status"
        >
          {message}
        </p>

        <Link
          to="/properties"
          className="mt-7 inline-flex rounded-lg bg-amber-700 px-5 py-3 font-semibold text-white hover:bg-amber-800"
        >
          Return to properties
        </Link>
      </section>
    </main>
  );
}

export default PropertyViewingPaymentCallback;
