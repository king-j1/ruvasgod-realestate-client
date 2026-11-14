import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function CustomerAccount() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
            Ruvasgod Real Estate
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {t("myAccount")}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Review the account details returned by your authenticated session.
          </p>
        </header>

        <section
          className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          aria-labelledby="account-details"
        >
          <h2
            className="text-xl font-semibold text-stone-900"
            id="account-details"
          >
            Account details
          </h2>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            {[
              ["Name", user?.name],
              [t("email"), user?.email],
              ["Phone", user?.phone],
              ["Account type", user?.role],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {label}
                </dt>

                <dd className="mt-1 break-words text-sm font-medium text-stone-900">
                  {value || "Not provided"}
                </dd>
              </div>
            ))}
          </dl>

          {/* ACCOUNT ACTIONS */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/forgot-password"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-800 hover:bg-amber-50 hover:text-amber-900"
            >
              Reset password
            </Link>

            <Link
              to="/account/kyc"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Identity verification
            </Link>

            <Link
              to="/account/agreements"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-800 hover:bg-amber-50 hover:text-amber-900"
            >
              My property agreements
            </Link>
            <Link
              to="/account/installments"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              My Installments
            </Link>
          </div>
        </section>

        <section
          className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8"
          aria-labelledby="account-capabilities"
        >
          <h2
            className="text-lg font-semibold text-amber-950"
            id="account-capabilities"
          >
            Property account services
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-950/85">
            Property enquiries, viewing requests, saved properties, and
            real-estate transaction history are not currently available through
            the connected backend.
          </p>

          <Link
            className="mt-4 inline-flex text-sm font-bold text-amber-950 underline underline-offset-4"
            to="/properties"
          >
            Browse published properties
          </Link>
        </section>
      </div>
    </main>
  );
}

export default CustomerAccount;
