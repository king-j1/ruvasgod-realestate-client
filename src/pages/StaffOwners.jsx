import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function StaffOwners() {
  const [ownerId, setOwnerId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const openOwner = (event) => {
    event.preventDefault();
    const id = ownerId.trim();
    if (!/^[a-f\d]{24}$/i.test(id)) {
      setError("Enter a valid 24-character owner record ID.");
      return;
    }
    navigate(`/staff/owners/${id}`);
  };

  return (
    <main className="staff-page min-h-[calc(100vh-4rem)] bg-[#fffdf8] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">Property owners</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Create owner records, review identity documents, and manage staff access using the existing protected APIs.
          </p>
        </header>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Create an owner record</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">After creation, this workflow uses the existing owner-access API to assign the record to your admin account for verification.</p>
            <Link className="button-primary mt-5 inline-flex min-h-11 items-center rounded-xl px-5 py-3 text-sm font-bold" to="/staff/owners/new">Create owner</Link>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Open an assigned owner record</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">The backend does not provide an owner directory. You must already have the record ID and authorization to view it.</p>
            {error && <p className="mt-4 text-sm text-red-800" role="alert">{error}</p>}
            <form className="mt-4" onSubmit={openOwner}>
              <label className="block text-sm font-semibold text-stone-700" htmlFor="owner-record-id">
                Owner record ID
                <input className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm" id="owner-record-id" autoComplete="off" value={ownerId} onChange={(event) => setOwnerId(event.target.value)} />
              </label>
              <button className="mt-4 min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 hover:border-amber-800" type="submit">Open record</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default StaffOwners;
