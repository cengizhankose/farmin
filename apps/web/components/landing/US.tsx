"use client";
import React from "react";
import NewSectionCard from "./NewSectionCard";

export function US({ progress = 0 }: { progress?: number }) {
  return (
    <section
      className="h-full"
      style={{
        background: `linear-gradient(135deg, #f8f9fa, #495057, #000000)`,
      }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 py-20">
        <div
          className="w-full"
          style={{
            transform: `translateY(${(1 - progress) * 15}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <div className="typo-h1 text-white text-center">US</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <NewSectionCard
              heading="Efe Akkurt"
              imageSrc="/efe.png"
              alt="Efe Akkurt"
              instagramUrl="https://www.instagram.com/efeakkurtofficial?igsh=YjNkMXoyczMzdnJw&utm_source=qr"
              xUrl="https://x.com/EfeAkkurtOFF"
              discordUrl="https://discord.com/users/404332976868950026"
              discordLabel="funcefe"
            />
            <NewSectionCard
              heading="Cengizhan Kose"
              imageSrc="/cengo.png"
              alt="Cengizhan Kose"
              instagramUrl="https://www.instagram.com/cengizhankse?igsh=YmlzcGoxMGFoanBq"
              xUrl="https://x.com/cengzhnkse"
              discordUrl="https://discord.com/users/369554756076568577"
              discordLabel="cengizhankose"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default US;
