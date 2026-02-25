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
          position: "relative",
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(151,71,230,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

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
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#9747E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="40" viewBox="0 0 294 502" fill="none">
              <path
                d="M34.1359 160H222.425C285.465 160 315.657 249.085 53.2138 245.113C14.2289 252.915 -2.36039 350.795 231.135 317.459C292.93 324.551 296.414 388.67 53.2138 398.316C-0.286908 391.932 6.76345 518.183 264.313 459.313"
                stroke="white"
                strokeWidth="53"
                strokeLinecap="round"
              />
              <path
                d="M146.541 0.5C169.509 0.5 188.041 17.3352 188.041 38C188.041 58.6648 169.509 75.5 146.541 75.5C123.572 75.5 105.041 58.6648 105.041 38C105.041 17.3352 123.572 0.5 146.541 0.5Z"
                fill="white"
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
          9 currencies · PDF export · Works on any device · Free
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "20px",
            color: "#71717a",
          }}
        >
          invoica.co
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
