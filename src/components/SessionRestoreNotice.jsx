function SessionRestoreNotice({ message, onRetry, onSignOut }) {
  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-[#fffdf8] px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-sm" aria-labelledby="session-restore-title">
        <h1 className="text-xl font-semibold text-stone-900" id="session-restore-title">Session verification unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600" role="alert">{message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="button-primary min-h-11 rounded-xl px-4 py-2 text-sm font-bold" onClick={onRetry} type="button">Try again</button>
          <button className="min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50" onClick={onSignOut} type="button">Sign out</button>
        </div>
      </section>
    </main>
  );
}

export default SessionRestoreNotice;
