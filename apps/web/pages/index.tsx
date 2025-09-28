import React from "react";
import Head from "next/head";
import { ScrollOrchestrator } from "@/components/ScrollOrchestrator";
import Hero from "@/components/landing/Hero";
import { WhoWhy } from "@/components/landing/WhoWhy";
import WhyUsInset from "@/components/sections/WhyUsInset";
import { Market } from "@/components/landing/Market";
import { Marquee } from "@/components/landing/Marquee";
import Beams from "@/components/ui/Beams";
import US from "@/components/landing/US";
import EndCapFooter from "@/components/EndCapFooter";

export default function Landing() {
  return (
    <>
      <Head>
        <title>Farmer UI - Yield Farming Aggregator</title>
        <meta
          name="description"
          content="Production-grade yield tooling across multiple chains. Built with security, transparency and user control at the forefront."
        />
        <meta
          property="og:title"
          content="Farmer UI - Yield Farming Aggregator"
        />
        <meta
          property="og:description"
          content="Production-grade yield tooling across multiple chains. Built with security, transparency and user control at the forefront."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Farmer UI - Yield Farming Aggregator"
        />
        <meta
          name="twitter:description"
          content="Production-grade yield tooling across multiple chains. Built with security, transparency and user control at the forefront."
        />
      </Head>
      <div className="relative">
        <div
          style={{
            background: "var(--scene-bg, var(--grad-hero))",
          }}
        >
          <ScrollOrchestrator
            heightPerSceneVh={110}
            tailVh={5}
            scenes={[
              {
                id: "hero",
                start: 0.0,
                end: 0.2,
                theme: "dark",
                bg: "var(--grad-hero)",
                render: () => (
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <Beams />
                    </div>
                    <div className="relative z-10">
                      <Hero />
                    </div>
                  </div>
                ),
              },
              {
                id: "why",
                start: 0.2,
                end: 0.4,
                theme: "dark",
                bg: "var(--grad-why)",
                render: (p) => <WhoWhy progress={p} />,
              },
              {
                id: "whyus",
                start: 0.4,
                end: 0.6,
                theme: "dark",
                bg: "var(--grad-why)",
                render: () => (
                  <div className="mx-auto flex h-full items-center px-4 sm:px-6 lg:px-8">
                    <WhyUsInset />
                  </div>
                ),
              },
              {
                id: "market",
                start: 0.6,
                end: 0.8,
                theme: "dark",
                bg: "var(--grad-gray-black)",
                render: (p) => <Market progress={p} />,
              },
              {
                id: "us",
                start: 0.8,
                end: 0.9,
                theme: "dark",
                bg: "var(--grad-why)",
                render: (p) => <US progress={p} />,
              },
              {
                id: "cards",
                start: 0.9,
                end: 1,
                theme: "dark",
                bg: "var(--grad-why)",
                render: (p) => <Marquee progress={p} />,
              },
            ]}
          />
          {/* Single minimalist end-cap footer */}
          <EndCapFooter />
        </div>
      </div>
    </>
  );
}
