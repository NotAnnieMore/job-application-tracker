"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-PT" data-theme="light" suppressHydrationWarning>
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
          <title>Erro | Job Application Tracker</title>
          <h1 style={{ fontSize: "24px", margin: 0 }}>
            Não foi possível abrir a aplicação
          </h1>
          <p
            style={{
              color: "var(--error-muted)",
              lineHeight: 1.6,
              margin: "12px 0 0",
            }}
          >
            Ocorreu um erro inesperado. Tenta carregar novamente.
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
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
