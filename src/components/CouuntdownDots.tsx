import React from "react";

interface CountdownDotsProps {
  countdown: number | null;
  max?: number;
  gameActive: boolean;
  multiplier: number;
}

const CountdownDots: React.FC<CountdownDotsProps> = ({
  countdown,
  max = 10,
  gameActive,
  multiplier,
}) => {
  const radius = 80;
  const center = 100;
  const dotRadius = 6;

  const visibleCount = countdown !== null ? countdown : 0;

  // ✅ Rotate clockwise
  const rotationAngle = (visibleCount / max) * 360;

  const dots = Array.from({ length: visibleCount }, (_, i) => {
    const angle = (2 * Math.PI * i) / max - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const isLast = i === visibleCount - 1;

    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={dotRadius}
        fill={isLast ? "#38bdf8" : "white"}
        stroke={isLast ? "#0ea5e9" : "none"}
        strokeWidth={isLast ? 2 : 0}
      />
    );
  });

  return (
    <div className="absolute bottom-4 right-4 w-48 h-48">
      <svg width="200" height="200">
        <g
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transformOrigin: "100px 100px",
            transition: "transform 0.3s linear",
          }}
        >
          {dots}
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 text-7xl font-semibold text-white drop-shadow-lg">
        {countdown !== null
          ? countdown
          : gameActive
          ? `${multiplier.toFixed(2)}x`
          : ""}
      </div>
    </div>
  );
};

export default CountdownDots;
