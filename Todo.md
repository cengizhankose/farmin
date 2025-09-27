Logo Loop

Customize
Speed 50px/s
Logo Height 60px
Gap 80px
Direction false
Pause on Hover true
Fade Out true
Scale on Hover true

Props
Property Type Default Description
logos
LogoItem[]

required
Array of logo items to display. Each item can be either a React node or an image src.

speed
number

120
Animation speed in pixels per second. Positive values move based on direction, negative values reverse direction.

direction
'left' | 'right'

'left'
Direction of the logo animation loop.

width
number | string

'100%'
Width of the logo loop container.

logoHeight
number

28
Height of the logos in pixels.

gap
number

32
Gap between logos in pixels.

pauseOnHover
boolean

true
Whether to pause the animation when hovering over the component.

fadeOut
boolean

false
Whether to apply fade-out effect at the edges of the container.

fadeOutColor
string

undefined
Color used for the fade-out effect. Only applies when fadeOut is true.

scaleOnHover
boolean

false
Whether to scale logos on hover.

ariaLabel
string

'Partner logos'
Accessibility label for the logo loop component.

className
string

undefined
Additional CSS class names to apply to the root element.

style
React.CSSProperties

undefined
Inline styles to apply to the root element.

CODE USAGE:

npx shadcn@latest add https://reactbits.dev/r/LogoLoop-TS-CSS
usage
import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
{ node: <SiReact />, title: "React", href: "https://react.dev" },
{ node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
{ node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
{ node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
{ src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
{ src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
{ src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

function App() {
return (

<div style={{ height: '200px', position: 'relative', overflow: 'hidden'}}>
<LogoLoop
        logos={techLogos}
        speed={120}
        direction="left"
        logoHeight={48}
        gap={40}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      />
</div>
);
}
code

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './LogoLoop.css';

export type LogoItem =
| {
node: React.ReactNode;
href?: string;
title?: string;
ariaLabel?: string;
}
| {
src: string;
alt?: string;
href?: string;
title?: string;
srcSet?: string;
sizes?: string;
width?: number;
height?: number;
};

export interface LogoLoopProps {
logos: LogoItem[];
speed?: number;
direction?: 'left' | 'right';
width?: number | string;
logoHeight?: number;
gap?: number;
pauseOnHover?: boolean;
fadeOut?: boolean;
fadeOutColor?: string;
scaleOnHover?: boolean;
ariaLabel?: string;
className?: string;
style?: React.CSSProperties;
}

const ANIMATION_CONFIG = {
SMOOTH_TAU: 0.25,
MIN_COPIES: 2,
COPY_HEADROOM: 2
} as const;

const toCssLength = (value?: number | string): string | undefined =>
typeof value === 'number' ? `${value}px` : (value ?? undefined);

const useResizeObserver = (
callback: () => void,
elements: Array<React.RefObject<Element | null>>,
dependencies: React.DependencyList
) => {
useEffect(() => {
if (!window.ResizeObserver) {
const handleResize = () => callback();
window.addEventListener('resize', handleResize);
callback();
return () => window.removeEventListener('resize', handleResize);
}

    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };

}, dependencies);
};

const useImageLoader = (
seqRef: React.RefObject<HTMLUListElement | null>,
onLoad: () => void,
dependencies: React.DependencyList
) => {
useEffect(() => {
const images = seqRef.current?.querySelectorAll('img') ?? [];

    if (images.length === 0) {
      onLoad();
      return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) {
        onLoad();
      }
    };

    images.forEach(img => {
      const htmlImg = img as HTMLImageElement;
      if (htmlImg.complete) {
        handleImageLoad();
      } else {
        htmlImg.addEventListener('load', handleImageLoad, { once: true });
        htmlImg.addEventListener('error', handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };

}, dependencies);
};

const useAnimationLoop = (
trackRef: React.RefObject<HTMLDivElement | null>,
targetVelocity: number,
seqWidth: number,
isHovered: boolean,
pauseOnHover: boolean
) => {
const rafRef = useRef<number | null>(null);
const lastTimestampRef = useRef<number | null>(null);
const offsetRef = useRef(0);
const velocityRef = useRef(0);

useEffect(() => {
const track = trackRef.current;
if (!track) return;

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        const translateX = -offsetRef.current;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };

}, [targetVelocity, seqWidth, isHovered, pauseOnHover]);
};

export const LogoLoop = React.memo<LogoLoopProps>(
({
logos,
speed = 120,
direction = 'left',
width = '100%',
logoHeight = 28,
gap = 32,
pauseOnHover = true,
fadeOut = false,
fadeOutColor,
scaleOnHover = false,
ariaLabel = 'Partner logos',
className,
style
}) => {
const containerRef = useRef<HTMLDivElement>(null);
const trackRef = useRef<HTMLDivElement>(null);
const seqRef = useRef<HTMLUListElement>(null);

    const [seqWidth, setSeqWidth] = useState<number>(0);
    const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed);
      const directionMultiplier = direction === 'left' ? 1 : -1;
      const speedMultiplier = speed < 0 ? -1 : 1;
      return magnitude * directionMultiplier * speedMultiplier;
    }, [speed, direction]);

    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const sequenceWidth = seqRef.current?.getBoundingClientRect?.()?.width ?? 0;

      if (sequenceWidth > 0) {
        setSeqWidth(Math.ceil(sequenceWidth));
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
      }
    }, []);

    useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight]);

    useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight]);

    useAnimationLoop(trackRef, targetVelocity, seqWidth, isHovered, pauseOnHover);

    const cssVariables = useMemo(
      () =>
        ({
          '--logoloop-gap': `${gap}px`,
          '--logoloop-logoHeight': `${logoHeight}px`,
          ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor })
        }) as React.CSSProperties,
      [gap, logoHeight, fadeOutColor]
    );

    const rootClassName = useMemo(
      () =>
        ['logoloop', fadeOut && 'logoloop--fade', scaleOnHover && 'logoloop--scale-hover', className]
          .filter(Boolean)
          .join(' '),
      [fadeOut, scaleOnHover, className]
    );

    const handleMouseEnter = useCallback(() => {
      if (pauseOnHover) setIsHovered(true);
    }, [pauseOnHover]);

    const handleMouseLeave = useCallback(() => {
      if (pauseOnHover) setIsHovered(false);
    }, [pauseOnHover]);

    const renderLogoItem = useCallback((item: LogoItem, key: React.Key) => {
      const isNodeItem = 'node' in item;

      const content = isNodeItem ? (
        <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>
          {item.node}
        </span>
      ) : (
        <img
          src={item.src}
          srcSet={item.srcSet}
          sizes={item.sizes}
          width={item.width}
          height={item.height}
          alt={item.alt ?? ''}
          title={item.title}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      );

      const itemAriaLabel = isNodeItem ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);

      const itemContent = item.href ? (
        <a
          className="logoloop__link"
          href={item.href}
          aria-label={itemAriaLabel || 'logo link'}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );

      return (
        <li className="logoloop__item" key={key} role="listitem">
          {itemContent}
        </li>
      );
    }, []);

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="logoloop__list"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            ref={copyIndex === 0 ? seqRef : undefined}
          >
            {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
          </ul>
        )),
      [copyCount, logos, renderLogoItem]
    );

    const containerStyle = useMemo(
      (): React.CSSProperties => ({
        width: toCssLength(width) ?? '100%',
        ...cssVariables,
        ...style
      }),
      [width, cssVariables, style]
    );

    return (
      <div
        ref={containerRef}
        className={rootClassName}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="logoloop__track" ref={trackRef}>
          {logoLists}
        </div>
      </div>
    );

}
);

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
CSS
.logoloop {
position: relative;
overflow-x: hidden;

--logoloop-gap: 32px;
--logoloop-logoHeight: 28px;
--logoloop-fadeColorAuto: #ffffff;
}

.logoloop--scale-hover {
padding-top: calc(var(--logoloop-logoHeight) _ 0.1);
padding-bottom: calc(var(--logoloop-logoHeight) _ 0.1);
}

@media (prefers-color-scheme: dark) {
.logoloop {
--logoloop-fadeColorAuto: #0b0b0b;
}
}

.logoloop\_\_track {
display: flex;
width: max-content;
will-change: transform;
user-select: none;
}

.logoloop\_\_list {
display: flex;
align-items: center;
}

.logoloop\_\_item {
flex: 0 0 auto;
margin-right: var(--logoloop-gap);
font-size: var(--logoloop-logoHeight);
line-height: 1;
}

.logoloop\_\_item:last-child {
margin-right: var(--logoloop-gap);
}

.logoloop\_\_node {
display: inline-flex;
align-items: center;
}

.logoloop\_\_item img {
height: var(--logoloop-logoHeight);
width: auto;
display: block;
object-fit: contain;
image-rendering: -webkit-optimize-contrast;
-webkit-user-drag: none;
pointer-events: none;
/_ Links handle interaction _/
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logoloop--scale-hover .logoloop\_\_item {
overflow: visible;
}

.logoloop--scale-hover .logoloop**item:hover img,
.logoloop--scale-hover .logoloop**item:hover .logoloop\_\_node {
transform: scale(1.2);
transform-origin: center center;
}

.logoloop--scale-hover .logoloop\_\_node {
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logoloop\_\_link {
display: inline-flex;
align-items: center;
text-decoration: none;
border-radius: 4px;
transition: opacity 0.2s ease;
}

.logoloop\_\_link:hover {
opacity: 0.8;
}

.logoloop\_\_link:focus-visible {
outline: 2px solid currentColor;
outline-offset: 2px;
}

.logoloop--fade::before,
.logoloop--fade::after {
content: '';
position: absolute;
top: 0;
bottom: 0;
width: clamp(24px, 8%, 120px);
pointer-events: none;
z-index: 1;
}

.logoloop--fade::before {
left: 0;
background: linear-gradient(
to right,
var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%,
rgba(0, 0, 0, 0) 100%
);
}

.logoloop--fade::after {
right: 0;
background: linear-gradient(
to left,
var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%,
rgba(0, 0, 0, 0) 100%
);
}

@media (prefers-reduced-motion: reduce) {
.logoloop\_\_track {
transform: translate3d(0, 0, 0) !important;
}

.logoloop**item img,
.logoloop**node {
transition: none !important;
}
}
