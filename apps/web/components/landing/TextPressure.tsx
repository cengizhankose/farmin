"use client";

import React from "react";

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  maxFontSize?: number;
  lockOnFirstMeasure?: boolean;
}

// Simplified and more stable text animation component
const TextPressure: React.FC<TextPressureProps> = (props) => {
  const [isClient, setIsClient] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (hasError) {
    // Fallback to simple text if there's an error
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <h1
          style={{
            fontFamily: props.fontFamily || "Inter var",
            textTransform: "uppercase",
            fontSize: props.minFontSize || 24,
            lineHeight: 1,
            margin: 0,
            textAlign: "center",
            userSelect: "none",
            whiteSpace: "nowrap",
            fontWeight: 100,
            width: "100%",
            color: props.textColor || "#FFFFFF",
          }}
        >
          {props.text || "FarmIN"}
        </h1>
      </div>
    );
  }

  if (!isClient) {
    // Render fallback during SSR
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <h1
          style={{
            fontFamily: props.fontFamily || "Inter var",
            textTransform: "uppercase",
            fontSize: props.minFontSize || 24,
            lineHeight: 1,
            margin: 0,
            textAlign: "center",
            userSelect: "none",
            whiteSpace: "nowrap",
            fontWeight: 100,
            width: "100%",
            color: props.textColor || "#FFFFFF",
          }}
        >
          {props.text || "FarmIN"}
        </h1>
      </div>
    );
  }

  // Full client-side implementation with error boundary
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        >
          <h1
            style={{
              fontFamily: props.fontFamily || "Inter var",
              textTransform: "uppercase",
              fontSize: props.minFontSize || 24,
              lineHeight: 1,
              margin: 0,
              textAlign: "center",
              userSelect: "none",
              whiteSpace: "nowrap",
              fontWeight: 100,
              width: "100%",
              color: props.textColor || "#FFFFFF",
            }}
          >
            {props.text || "FarmIN"}
          </h1>
        </div>
      }
    >
      <TextPressureImpl {...props} onError={() => setHasError(true)} />
    </React.Suspense>
  );
};

const TextPressureImpl: React.FC<
  TextPressureProps & { onError?: () => void }
> = ({
  text = "FarmIN",
  fontFamily = "Inter var",
  fontUrl = "https://rsms.me/inter/font-files/InterVariable.woff2?v=3.19",
  // width = false, // Disabled for stability - unused variable
  weight = true,
  // italic = false, // Disabled for stability - unused variable
  // alpha = false, // Disabled for stability - unused variable
  flex = false,
  stroke = false,
  scale = false,
  textColor = "#FFFFFF",
  strokeColor = "#FF0000",
  className = "",
  minFontSize = 24,
  maxFontSize,
  lockOnFirstMeasure = true,
  onError,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const spansRef = React.useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef = React.useRef({ x: 0, y: 0 });
  const cursorRef = React.useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = React.useState(minFontSize);
  const [scaleY, setScaleY] = React.useState(1);
  const [lineHeight, setLineHeight] = React.useState(1);
  const hasLockedRef = React.useRef(false);

  const chars = React.useMemo(() => (text || "").split("") as string[], [text]);

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    if (containerRef.current) {
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const setSize = React.useCallback(() => {
    if (lockOnFirstMeasure && hasLockedRef.current) return;
    if (!containerRef.current || !titleRef.current) return;
    const el = containerRef.current;
    // Use layout-based measurements to avoid ancestor CSS transforms affecting size
    const containerW = el.clientWidth || el.offsetWidth || 0;
    const containerH = el.clientHeight || el.offsetHeight || 0;
    if (process.env.NODE_ENV !== "production") {
      const rect = el.getBoundingClientRect();
      // Debug: compare transformed vs layout sizes
      console.log("[TextPressure] size check", {
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        rectWidth: rect.width,
        rectHeight: rect.height,
      });
    }
    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);
    if (typeof maxFontSize === "number") {
      newFontSize = Math.min(newFontSize, maxFontSize);
    }
    setFontSize((prev) => (prev !== newFontSize ? newFontSize : prev));
    setScaleY(1);
    setLineHeight(1);
    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();
      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
      if (lockOnFirstMeasure) hasLockedRef.current = true;
    });
  }, [chars.length, minFontSize, maxFontSize, scale, lockOnFirstMeasure]);

  React.useEffect(() => {
    try {
      setSize();
      window.addEventListener("resize", setSize);
      return () => window.removeEventListener("resize", setSize);
    } catch {
      onError?.();
    }
  }, [scale, text, setSize, onError]);

  // ResizeObserver to respond only to container size changes, decoupled from re-renders
  React.useEffect(() => {
    if (!containerRef.current || !("ResizeObserver" in window)) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      hasLockedRef.current = false; // allow one recalculation on actual size change
      setSize();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setSize]);

  React.useEffect(() => {
    let rafId: number;
    try {
      const animate = () => {
        mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
        mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

        if (titleRef.current) {
          const titleRect = titleRef.current.getBoundingClientRect();
          const maxDist = Math.max(1, titleRect.width / 2);

          spansRef.current.forEach((span) => {
            if (!span) return;

            const rect = span.getBoundingClientRect();
            const charCenter = {
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2,
            };
            const d = dist(mouseRef.current, charCenter);

            // Simplified animation - only weight variation
            if (weight) {
              const distanceFactor = Math.max(0, 1 - d / maxDist);
              const wght = Math.floor(100 + 900 * distanceFactor); // 100-900 range
              span.style.fontVariationSettings = `'wght' ${wght}`;
            }
          });
        }

        rafId = requestAnimationFrame(animate);
      };
      animate();
    } catch {
      onError?.();
    }
    return () => cancelAnimationFrame(rafId);
  }, [weight, chars.length, onError]);

  const dynamicClassName = [
    className,
    flex ? "flex" : "",
    stroke ? "stroke" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@font-face {
  font-family: '${fontFamily}';
  src: url('${fontUrl}') format('woff2');
  font-style: normal;
  font-display: swap;
}
.flex { display: flex; justify-content: space-between; }
.stroke span { position: relative; color: ${textColor}; }
.stroke span::after { content: attr(data-char); position: absolute; left:0; top:0; color: transparent; z-index:-1; -webkit-text-stroke-width: 3px; -webkit-text-stroke-color: ${strokeColor}; }
.text-pressure-title { color: ${textColor}; }
     `,
        }}
      />
      <h1
        ref={titleRef}
        className={`text-pressure-title ${dynamicClassName}`}
        style={{
          fontFamily,
          textTransform: "uppercase",
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: "center top",
          margin: 0,
          textAlign: "center",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontWeight: 400, // Base font weight
          width: "100%",
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{
              display: "inline-block",
              color: stroke ? undefined : textColor,
              transition: "font-variation-settings 0.1s ease",
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default React.memo(TextPressure);
