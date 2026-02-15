import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Invoica - Invoice clients in minutes, not hours";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1025 0%, #0f0a18 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "52",
              height: "52",
              borderRadius: "12px",
              background: "#9747E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 512 512" fill="none">
              <path
                d="M80 128h352M80 256h352M80 384h200"
                stroke="white"
                strokeWidth="48"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            invoica
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Invoice clients in minutes,</span>
          <span>
            not{" "}
            <span style={{ color: "#9747E6" }}>hours</span>.
          </span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            lineHeight: 1.5,
          }}
        >
          9 currencies. PDF export. Works on any device. Free.
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #9747E6 0%, #7c3aed 50%, #9747E6 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
