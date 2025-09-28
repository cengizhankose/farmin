import React from 'react';
import LogoLoop, { LogoItem } from './LogoLoop';

interface LogoLoopWithCirclesProps {
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

const LogoLoopWithCircles: React.FC<LogoLoopWithCirclesProps> = ({
  logos,
  speed = 50,
  direction = 'left',
  width = '100%',
  logoHeight = 60,
  gap = 80,
  pauseOnHover = true,
  fadeOut = true,
  fadeOutColor,
  scaleOnHover = true,
  ariaLabel = 'Partner logos',
  className,
  style
}) => {
  const enhancedLogos = logos.map(logo => {
    if ('src' in logo) {
      const isAlgorand = logo.alt?.toLowerCase().includes('algorand') ||
                        logo.title?.toLowerCase().includes('algorand') ||
                        logo.src?.toLowerCase().includes('algorand');
      const isPera = logo.alt?.toLowerCase().includes('pera') ||
                     logo.title?.toLowerCase().includes('pera') ||
                     logo.src?.toLowerCase().includes('pera');
      const isDefly = logo.alt?.toLowerCase().includes('defly') ||
                      logo.title?.toLowerCase().includes('defly') ||
                      logo.src?.toLowerCase().includes('defly');

      let bgColor = 'bg-transparent';
      if (isAlgorand) bgColor = 'bg-white';
      else if (isPera) bgColor = 'bg-[#ffee55]';
      else if (isDefly) bgColor = 'bg-[#8c45ff]';

      return {
        ...logo,
        node: (
          <div className={`
            flex items-center justify-center rounded-full border-2 border-gray-200
            ${bgColor}
            hover:border-gray-300 transition-all duration-300 shadow-sm
          `}>
            <img
              src={logo.src}
              alt={logo.alt || ''}
              title={logo.title}
              className={`
                ${isAlgorand ? 'p-2' : ''}
                object-contain
              `}
              style={{
                width: `${logoHeight}px`,
                height: `${logoHeight}px`,
                maxWidth: `${logoHeight}px`,
                maxHeight: `${logoHeight}px`
              }}
              draggable={false}
            />
          </div>
        )
      };
    }
    return logo;
  });

  return (
    <LogoLoop
      logos={enhancedLogos}
      speed={speed}
      direction={direction}
      width={width}
      logoHeight={logoHeight}
      gap={gap}
      pauseOnHover={pauseOnHover}
      fadeOut={fadeOut}
      fadeOutColor={fadeOutColor}
      scaleOnHover={scaleOnHover}
      ariaLabel={ariaLabel}
      className={className}
      style={style}
    />
  );
};

export default LogoLoopWithCircles;