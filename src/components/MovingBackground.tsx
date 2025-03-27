import React, { useRef, useEffect } from "react";

const layers = [
  { src: "/layers/mountain-5.svg", speed: 150, height: 60 }, // background
  { src: "/layers/mountain-4.svg", speed: 120, height: 50 },
  { src: "/layers/mountain-3.svg", speed: 90, height: 40 },
  { src: "/layers/mountain-2.svg", speed: 60, height: 27 },
  { src: "/layers/mountain-1.svg", speed: 30, height: 20 }, // foreground
];

interface ParallaxMountainsProps {
  isMoving: boolean;
}

const ParallaxMountains: React.FC<ParallaxMountainsProps> = ({ isMoving }) => {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    layerRefs.current.forEach((layer) => {
      if (layer) {
        layer.style.animationPlayState = isMoving ? "running" : "paused";
      }
    });
  }, [isMoving]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {layers.map((layer, index) => (
        <div
          key={index}
          ref={(el) => {
            layerRefs.current[index] = el;
          }}
          className="absolute top-0 left-0 w-[200%] h-full bg-repeat-x bg-bottom"
          style={{
            backgroundImage: `url(${layer.src})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: `auto ${layer.height}%`,
            backgroundPosition: "bottom left", // Align at bottom
            animation: `moveBg ${layer.speed}s linear infinite`,
            animationPlayState: "paused",
            zIndex: index,
          }}
        />
      ))}
    </div>
  );
};

export default ParallaxMountains;
