"use client";

export function NothingDey({ className }: { className?: string }) {
  return (
    <svg
      width="248"
      height="280"
      viewBox="0 0 248 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.05); }
        }
        @keyframes smile-wiggle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .eye-left {
          transform-origin: 58.8px 105px;
          animation: blink 4s ease-in-out infinite;
        }
        .eye-right {
          transform-origin: 182.7px 105px;
          animation: blink 4s ease-in-out 0.15s infinite;
        }
        .smile {
          animation: smile-wiggle 6s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <rect
        x="29.9996"
        width="187.69"
        height="279.228"
        rx="20"
        className="fill-primary/15"
      />

      {/* Decorative shine shapes */}
      <path
        d="M216.921 57.0154C193.041 60.1069 148.465 78.6567 157.221 118.46C137.321 83.2945 165.181 33.0566 216.921 57.0154Z"
        className="fill-card"
      />
      <path
        d="M12.3075 98.8449C23.0766 69.3068 56.025 56.025 70.7684 53.4609C53.5378 44.8456 35.5124 51.9224 28.8458 56.9223C10.9999 66.7684 10.2563 89.486 12.3075 98.8449Z"
        className="fill-card"
      />

      {/* Glasses frames */}
      <circle
        cx="194.229"
        cy="92.6913"
        r="45.9609"
        className="stroke-primary"
        strokeWidth="15"
      />
      <circle
        cx="53.4609"
        cy="92.6913"
        r="45.9609"
        className="stroke-primary"
        strokeWidth="15"
      />

      {/* Bridge */}
      <line
        x1="95.3835"
        y1="90.9604"
        x2="152.306"
        y2="90.9604"
        className="stroke-primary"
        strokeWidth="15"
      />

      {/* Smile */}
      <path
        className="smile stroke-primary"
        d="M88.4606 173.459C95.2554 180.895 115.922 191.305 144.229 173.459"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Eyes (with blink animation) */}
      <circle
        className="eye-left fill-primary"
        cx="58.8454"
        cy="104.999"
        r="11.9229"
      />
      <circle
        className="eye-right fill-primary"
        cx="182.69"
        cy="104.999"
        r="11.9229"
      />
    </svg>
  );
}
