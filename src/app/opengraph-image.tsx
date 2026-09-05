import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Job Application Tracker";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public", "app-icon.png"),
    "base64",
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#f8fafc",
        color: "#0f172a",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 260,
          top: -250,
          right: -100,
          background: "#1447e6",
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: 180,
          bottom: -220,
          left: 220,
          background: "#1447e6",
          opacity: 0.08,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          border: "2px solid #dbe4f0",
          borderRadius: 32,
          background: "white",
          padding: "48px 54px",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {/* The Next.js OG renderer supports data URLs in img elements. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={112}
            height={112}
            style={{ borderRadius: 24 }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
              Job Application Tracker
            </div>
            <div style={{ fontSize: 25, color: "#475569" }}>
              Applications, interviews and follow-ups in one place.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 25,
          }}
        >
          <div style={{ color: "#64748b" }}>Stay organised. Move forward.</div>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              background: "#1447e6",
              color: "white",
              padding: "15px 25px",
              fontWeight: 700,
            }}
          >
            jobs.ivocamacho.com
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
