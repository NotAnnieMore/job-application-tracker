"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function SuccessToast({
  message,
  queryParam = "estado",
}: {
  message?: string;
  queryParam?: string;
}) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return;

    const showTimeout = window.setTimeout(() => setVisible(true), 0);

    const url = new URL(window.location.href);
    url.searchParams.delete(queryParam);
    window.history.replaceState(window.history.state, "", url);

    const timeout = window.setTimeout(() => setVisible(false), 6000);
    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(timeout);
    };
  }, [message, queryParam]);

  if (!message || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-20 right-4 left-4 z-40 flex items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 shadow-lg sm:left-auto sm:w-full sm:max-w-sm"
    >
      <CheckCircle2
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-emerald-600"
      />
      <span className="min-w-0 flex-1 leading-5">{message}</span>
      <button
        type="button"
        className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        aria-label="Fechar mensagem"
        onClick={() => setVisible(false)}
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
