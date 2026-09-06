"use client";

import { useEffect, useSyncExternalStore } from "react";
import ptMessages from "../../messages/pt-PT.json";
import enMessages from "../../messages/en-GB.json";
import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
  localeFromAcceptLanguage,
} from "@/i18n/config";

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
    return isAppLocale(value)
      ? value
      : localeFromAcceptLanguage(window.navigator.language);
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
              'try{var root=document.documentElement;var theme=localStorage.getItem("job-tracker-theme")==="dark"?"dark":"light";var storedScale=localStorage.getItem("job-tracker-font-scale");var scale=["90","95","100","105","110"].includes(storedScale)?storedScale:"100";root.dataset.theme=theme;root.dataset.fontScale=scale;root.style.setProperty("--error-font-scale",String(Number(scale)/100))}catch(e){}',
          }}
        />
        <style>{`:root{--error-font-scale:1;--error-background:#f7f9fc;--error-foreground:#172033;--error-surface:#fff;--error-border:#e5eaf1;--error-muted:#64748b}[data-theme="dark"]{color-scheme:dark;--error-background:#080d17;--error-foreground:#e7edf6;--error-surface:#111927;--error-border:#2a3548;--error-muted:#94a3b8}`}</style>
      </head>
      <body
        style={{
          alignItems: "center",
          background: "var(--error-background)",
          color: "var(--error-foreground)",
          display: "flex",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "calc(16px * var(--error-font-scale))",
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
          <h1
            style={{
              fontSize: "calc(24px * var(--error-font-scale))",
              margin: 0,
            }}
          >
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
              fontSize: "calc(14px * var(--error-font-scale))",
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
