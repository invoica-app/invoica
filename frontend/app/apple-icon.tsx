import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#9747E6",
          borderRadius: "36px",
        }}
      >
        <svg
          width="100"
          height="140"
          viewBox="0 0 294 502"
          fill="none"
        >
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
    ),
    { ...size }
  );
}
