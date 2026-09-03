import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

function PaymentCallbackSale() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState("Verifying your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference =
        searchParams.get("reference") || searchParams.get("trxref");

      if (!reference) {
        setError("Payment reference was not found.");
        return;
      }

      try {
        const response = await api.get(
          `/payments/sales/verify/${encodeURIComponent(reference)}`
        );

        if (response.data?.success) {
          setMessage("Payment successful! Your purchase is confirmed.");

          setTimeout(() => {
            navigate("/my-purchases");
          }, 2000);
        } else {
          setError(
            response.data?.message ||
              "Payment verification failed."
          );
        }
      } catch (error) {
        console.error("Sale payment verification error:", error);

        setError(
          error.response?.data?.message ||
            "We could not verify your payment."
        );
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
        {!error ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              {message}
            </h1>

            <p className="mt-3 text-slate-500">
              Please wait while we finish updating your purchase.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              !
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Payment Verification Failed
            </h1>

            <p className="mt-3 text-red-600">
              {error}
            </p>

            <button
              onClick={() => navigate("/my-purchases")}
              className="mt-6 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Back to My Purchases
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentCallbackSale;
