"use client";

import React from "react";
import { motion } from "framer-motion";

export default function EndCapFooter() {
  return (
    <div
      className="relative w-full flex flex-col items-center justify-center min-h-[40vh]"
      style={{ marginTop: "-15vh", transform: "translateY(-50px)" }}
    >
      <motion.h1
        aria-hidden
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="font-display font-semibold tracking-[-0.02em] text-center text-white text-[clamp(72px,12vw,280px)] leading-[0.9] select-none drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]"
      >
        FarmIN
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
        className="text-center text-[clamp(15px,1.2vw,18px)] text-white/70 max-w-2xl"
        style={{ marginTop: "-20px", transform: "translateY(-30px)" }}
      >
        The most comprehensive yield aggregator & insurance layer.
      </motion.p>
    </div>
  );
}
