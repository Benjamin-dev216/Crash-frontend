import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

interface AirplaneAnimationProps {
  multiplier: number;
  threshold: number;
  countdown: number | null;
  gameActive: boolean;
  onExplode?: () => void;
}

const AirplaneAnimation: React.FC<AirplaneAnimationProps> = ({
  multiplier,
  threshold,
  countdown,
  gameActive,
  onExplode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1000, height: 400 });
  const [showExplosion, setShowExplosion] = useState(false);
  const [hasExploded, setHasExploded] = useState(false);
  const [hidePlane, setHidePlane] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const controls = useAnimation();

  const DURATION = 12;
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setSize({ width, height });

      // Restart animation on resize
      if (gameActive) {
        setAnimationKey((k) => k + 1);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [gameActive]);

  // Animate path
  useEffect(() => {
    if (gameActive) {
      controls.set({ pathLength: 0 });
      controls.start({
        pathLength: [0, 1],
        transition: { duration: DURATION, ease: "linear" },
      });

      startTimeRef.current = Date.now();
      setHasExploded(false);
      setShowExplosion(false);
      setHidePlane(false);

      // Track time to compute current progress
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
        const p = Math.min(elapsed / DURATION, 1);
        setProgress(p);
      }, 50);
    } else {
      clearInterval(intervalRef.current!);
      controls.stop();
      setTimeout(() => {
        controls.set({ pathLength: 0 });
      }, 800);
    }

    return () => clearInterval(intervalRef.current!);
  }, [gameActive, animationKey, controls]);

  // Handle explosion logic
  useEffect(() => {
    if (multiplier >= threshold && !hasExploded && gameActive) {
      setHasExploded(true);
      setShowExplosion(true);
      onExplode?.();

      // Hide plane after 1 second
      controls.stop();
      setTimeout(() => {
        clearInterval(intervalRef.current!);
        setHidePlane(true);
        setShowExplosion(false);
      }, 800);
    }
  }, [multiplier, threshold, hasExploded, gameActive, onExplode, controls]);

  const pathD = useMemo(() => {
    const { width, height } = size;
    const points: string[] = [];

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = t * width;
      const y = height + 80 - t * t * height;
      points.push(`${x},${y}`);
    }

    return `M${points.join(" L")}`;
  }, [size]);

  const offsetDistance = `${(progress * 100).toFixed(2)}%`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-4/5 overflow-hidden bg-transparent pr-20 pt-20"
    >
      <svg className="absolute inset-0 w-full h-full">
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#goldenGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={controls}
        />
        <defs>
          <linearGradient
            id="goldenGradient"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor="#FFD700"
              floodOpacity="1"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor="#FACC15"
              floodOpacity="0.9"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="12"
              floodColor="#FBBF24"
              floodOpacity="0.5"
            />
          </filter>
        </defs>
      </svg>

      {!hidePlane && gameActive && !hasExploded && (
        <motion.div
          key={`plane-${animationKey}`}
          className="absolute"
          style={{ offsetPath: `path('${pathD}')`, offsetRotate: "auto" }}
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: DURATION, ease: "linear" }}
        >
          {/* This wrapper keeps sun+plane together */}
          <div className="relative w-[200px] h-[132px]">
            {/* Rotating sun behind the plane */}
            <div className="absolute inset-0 flex items-center justify-center z-0 translate-y-[-60%]">
              <img
                src="/airplane-shine.aa885f9c2127.png"
                alt="shine"
                className="w-[200px] h-[200px] rotating-sun"
              />
            </div>

            {/* Plane on top */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animated-plane z-10"></div>
          </div>
        </motion.div>
      )}

      {showExplosion && (
        <motion.div
          className="absolute"
          style={{ offsetPath: `path('${pathD}')`, offsetDistance }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: [1, 1.8], opacity: [1, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="explosion translate-y-[-30%] translate-x-[20%]" />
        </motion.div>
      )}

      <div className="absolute bottom-4 right-4 text-7xl font-semibold text-white drop-shadow-lg">
        {countdown !== null ? (
          <span key={countdown} className="slide-down-strong">
            {countdown}
          </span>
        ) : gameActive ? (
          `${multiplier.toFixed(2)}x`
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default AirplaneAnimation;
