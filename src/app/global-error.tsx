"use client";

import { useEffect, useSyncExternalStore } from "react";
import ptMessages from "../../messages/pt-PT.json";
import enMessages from "../../messages/en-GB.json";
import { defaultLocale, isAppLocale, localeCookieName } from "@/i18n/config";

// The root error boundary replaces the layout, so no translation provider is available.
function subscribe() {
  return () => {};
}
function readLocale() {
  try {
    const value = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(localeCookieName + "="))
      ?.split("=")[1];
    return isAppLocale(value) ? value : defaultLocale;
  } catch {
    return defaultLocale;
  }
}
function serverLocale() {
  return defaultLocale;
}

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = useSyncExternalStore(subscribe, readLocale, serverLocale);
  const messages = locale === "en-GB" ? enMessages.Errors : ptMessages.Errors;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var theme=localStorage.getItem("job-tracker-theme")==="dark"?"dark":"light";document.documentElement.dataset.theme=theme}catch(e){}',
          }}
        />
        <style>{`:root{--error-background:#f7f9fc;--error-foreground:#172033;--error-surface:#fff;--error-border:#e5eaf1;--error-muted:#64748b}[data-theme="dark"]{color-scheme:dark;--error-background:#080d17;--error-foreground:#e7edf6;--error-surface:#111927;--error-border:#2a3548;--error-muted:#94a3b8}`}</style>
      </head>
      <body
        style={{
          alignItems: "center",
          background: "var(--error-background)",
          color: "var(--error-foreground)",
          display: "flex",
          fontFamily: "Arial, Helvetica, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <main
          style={{
            background: "var(--error-surface)",
            border: "1px solid var(--error-border)",
            borderRadius: "16px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            maxWidth: "480px",
            padding: "32px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <title>{messages.errorTitle}</title>
          <h1 style={{ fontSize: "24px", margin: 0 }}>
            {messages.globalHeading}
          </h1>
          <p
            style={{
              color: "var(--error-muted)",
              lineHeight: 1.6,
              margin: "12px 0 0",
            }}
          >
            {messages.globalDescription}
          </p>
          <button
            type="button"
            onClick={unstable_retry}
            style={{
              background: "#2563eb",
              border: 0,
              borderRadius: "12px",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 700,
              marginTop: "20px",
              minHeight: "44px",
              padding: "0 18px",
            }}
          >
            {messages.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
