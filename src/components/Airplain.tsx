import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

interface AirplaneAnimationProps {
  multiplier: number;
  threshold: number;
  countdown: number | null;
  gameActive: boolean;
  onExplode?: () => void;
}

const DURATION = 12;

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
  const [explosionOffset, setExplosionOffset] = useState("0%");

  const controls = useAnimation();
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Path animation and progress tracking
  useEffect(() => {
    if (!gameActive) {
      cancelAnimationFrame(rafRef.current!);
      controls.stop();
      setTimeout(() => controls.set({ pathLength: 0 }), 300);
      return;
    }

    controls.set({ pathLength: 0 });
    controls.start({
      pathLength: 1,
      transition: { duration: DURATION, ease: "linear" },
    });

    startTimeRef.current = performance.now();
    setHasExploded(false);
    setShowExplosion(false);
    setHidePlane(false);

    const animate = (now: number) => {
      const elapsed = (now - (startTimeRef.current || 0)) / 1000;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [gameActive]);

  // Explosion logic
  useEffect(() => {
    if (gameActive && multiplier >= threshold && !hasExploded) {
      setHasExploded(true);
      setExplosionOffset(`${(progress * 100).toFixed(2)}%`);
      setShowExplosion(true);
      controls.stop();
      onExplode?.();

      setTimeout(() => {
        setHidePlane(true);
        setShowExplosion(false);
        cancelAnimationFrame(rafRef.current!);
      }, 1500);
    }
  }, [
    multiplier,
    threshold,
    gameActive,
    hasExploded,
    progress,
    onExplode,
    controls,
  ]);

  const pathD = useMemo(() => {
    const { width, height } = size;
    return `M${[...Array(101)]
      .map((_, i) => {
        const t = i / 100;
        const x = t * width;
        const y = height + 80 - t * t * height;
        return `${x},${y}`;
      })
      .join(" L")}`;
  }, [size]);

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
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFD700" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FACC15" />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="12"
              floodColor="#FBBF24"
            />
          </filter>
        </defs>
      </svg>

      {!hidePlane && gameActive && !hasExploded && (
        <motion.div
          className="absolute"
          style={{ offsetPath: `path('${pathD}')`, offsetRotate: "auto" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: DURATION, ease: "linear" }}
        >
          <div className="relative w-[200px] h-[132px]">
            <div className="absolute inset-0 flex items-center justify-center z-0 translate-y-[-60%]">
              <img
                src="/airplane-shine.aa885f9c2127.png"
                alt="shine"
                className="w-[200px] h-[200px] rotating-sun"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animated-plane z-10" />
          </div>
        </motion.div>
      )}

      {showExplosion && (
        <motion.div
          className="absolute"
          style={{
            offsetPath: `path('${pathD}')`,
            offsetDistance: explosionOffset,
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="explosion translate-y-[-30%] translate-x-[20%]" />
        </motion.div>
      )}

      <div className="absolute bottom-4 right-4 text-7xl font-semibold text-white drop-shadow-lg">
        {countdown !== null ? (
          <span key={countdown} className="slide-down-strong text-8xl">
            {countdown}
          </span>
        ) : gameActive ? (
          `${multiplier.toFixed(2)}x`
        ) : null}
      </div>
    </div>
  );
};

export default AirplaneAnimation;
