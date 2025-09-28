"use client";

import React from "react";
import TextPressure from "./TextPressure";
import HeroSvg from "../herosvgs/planet";
import HeroSvg2 from "../herosvgs/planetgrid";
import Moon from "../herosvgs/moon";
import NavigationButtons from "./NavigationButtons";

export default function Hero() {
  const services = [
    { label: "Comprehensive Analysis", state: "weak" },
    { label: "Risk Analysis & Score", state: "weak" },
    { label: "Insurance Integration", state: "strong" },
    { label: "Yield Opportunities", state: "weak" },
    { label: "Transparent TVL & APR/APY", state: "weak" },
    { label: "Portfolio Management", state: "weak" },
    { label: "One-Click Investment", state: "weak" },
    { label: "Rewards Programs", state: "weak" },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (services.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % services.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [services.length]);

  return (
    <>
      <NavigationButtons />
      <div className="relative mx-auto max-w-[1800px] px-6 pt-10 md:pt-12 min-h-[80vh] z-30">
        <div className="grid grid-cols-1 lg:grid-cols-[0.46fr_0.54fr] xl:grid-cols-[0.5fr_0.5fr] 2xl:grid-cols-[0.45fr_0.55fr] gap-6 min-h-[80vh]">
          {/* SOL: Planet Panel (z-10) */}
          <div className="relative">
            {/* z-0: Background - Beams full screen behind everything */}

            {/* z-10: Sol panel / gezegen katmanı */}
            <div
              className="z-10 absolute inset-y-0 left-[-10%] lg:left-[-15%] flex w-[50%] lg:w-[60%] items-center"
              style={{ pointerEvents: "none" }}
            >
              <div className="relative flex w-full items-center justify-center">
                <HeroSvg className="absolute left-0 top-1/2 -translate-y-1/2 h-[200vh] lg:h-[250vh] w-[140%] lg:w-[160%] rotate-180" />
                <HeroSvg2 className="absolute left-0 z-20 h-auto w-[140%] lg:w-[160%] -translate-x-[0%] pt-12" />
                <Moon className="absolute top-4/17 z-30 h-[100px] lg:h-[120px] w-[100px] lg:w-[120px] -translate-x-[-300%] lg:-translate-x-[-380%] -translate-y-1/2" />
              </div>
            </div>

            {/* Services (z-30) - H1 ile aynı hizada */}
            <div className="absolute top-[65%] left-[8%] lg:left-[10%] z-30 space-y-3 w-[80%] max-w-md">
              {services.map((it, index) => (
                <div key={it.label} className="relative">
                  <span className="text-[0.9rem] lg:text-[1rem] leading-[1.6] block text-black">
                    {it.label}
                  </span>
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 left-40 lg:left-60 h-[3px] rounded-full transition-all duration-500 right-5/5 ${
                      index === activeIndex
                        ? "w-12 lg:w-14 bg-black/90 opacity-100"
                        : "w-6 lg:w-7 bg-black/50 opacity-70"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SAĞ: İçerik (z-30) */}
          <div className="relative z-30">
            {/* Sağ metin bloğu */}
            <div className="absolute right-[5%] lg:right-[8%] top-[28%] max-w-xs lg:max-w-sm text-right">
              <p className="text-[1rem] lg:text-[1.1rem] leading-[1.6] text-white/85">
                Comprehensive
                <br />
                Analysis Center
              </p>
            </div>

            {/* H1 – en üst katmanda, stabil ölçüm (transform yok) */}
            <div className="absolute left-[-10%] lg:left-[-14%] top-[82%] pointer-events-none z-40">
              <div className="w-[110%] lg:w-[120%]">
                <TextPressure
                  text="FarmIN"
                  alpha={false}
                  stroke={false}
                  flex={true}
                  weight={true}
                  italic={true}
                  width={true}
                  textColor="white"
                  minFontSize={80}
                  maxFontSize={160}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
