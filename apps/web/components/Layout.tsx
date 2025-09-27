"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/contexts/WalletContext";
import { useSlowScroll } from "@/hooks/useSlowScroll";
import { colors, buttonColors } from "../lib/colors";
import NavigationButtons from "@/components/landing/NavigationButtons";

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "secondary" | "default";
  },
) {
  const { className = "", variant = "default", ...rest } = props;
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants: Record<string, string> = {
    default: `bg-[${buttonColors.default.bg}] text-[${buttonColors.default.text}] hover:bg-[${buttonColors.default.hover}]`,
    outline: `border border-[${buttonColors.outline.border}] bg-[${buttonColors.outline.bg}] hover:bg-[${buttonColors.outline.hover}]`,
    secondary: `bg-[${buttonColors.secondary.bg}] text-[${buttonColors.secondary.text}] hover:bg-[${buttonColors.secondary.hover}]`,
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest} />
  );
}

function Badge(
  props: React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "outline" | "default";
  },
) {
  const { className = "", variant = "default", ...rest } = props;
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs";
  const variants: Record<string, string> = {
    default: `bg-[${colors.zinc[900]}] text-[${colors.white.DEFAULT}]`,
    outline: `border border-[${colors.zinc[300]}] text-[${colors.zinc[700]}]`,
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...rest} />
  );
}

export const ChainGuardBanner = () => {
  const { networkMismatch, network, expected } = useWallet();
  if (!networkMismatch) return null;
  return (
    <div
      className={`relative z-30 w-full border-b border-[${
        colors.amber[300]
      }] bg-[${colors.purple[50] || colors.purple[100]}]/80 backdrop-blur-xl`}
    >
      <div
        className={`mx-auto max-w-7xl px-6 py-2 text-sm text-[${colors.purple[700]}]`}
      >
        Network mismatch: Wallet on <strong>{network}</strong> but app expects{" "}
        <strong>{expected}</strong>. Open Leather &gt; Settings &gt; Network and
        switch. Refresh after switching.
      </div>
    </div>
  );
};

// const ConnectButton = () => {
//   const { installed, connecting, stxAddress, connect, disconnect } =
//     useWallet();
//   const short = (a?: string | null) =>
//     a ? `${a.slice(0, 5)}…${a.slice(-4)}` : "";

//   if (!installed) {
//     return (
//       <button
//         onClick={() => window.open("https://leather.io", "_blank")}
//         className="group relative h-9 w-34 overflow-hidden rounded-md bg-white/20 backdrop-blur-[40px] px-3 text-left text-sm font-bold text-white duration-500 hover:bg-white/30"
//         aria-label="Install Leather"
//       >
//         Install Leather
//       </button>
//     );
//   }

//   if (stxAddress) {
//     return (
//       <div className="flex items-center gap-2">
//         <Badge className="bg-white/20 text-white backdrop-blur">
//           {short(stxAddress)}
//         </Badge>
//         <Button
//           variant="secondary"
//           onClick={disconnect}
//           className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur"
//         >
//           Logout
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <Button
//       onClick={() => void connect()}
//       disabled={connecting}
//       className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur"
//     >
//       {connecting ? "Connecting…" : "Connect Leather"}
//     </Button>
//   );
// };

export const Header = () => {
  // const [isVisible] = React.useState(true); // Unused variable
  // const [lastScrollY, setLastScrollY] = React.useState(0); // Unused variable

  React.useEffect(() => {
    // const handleScroll = () => {
    //   const currentScrollY = window.scrollY;

    //   // Scroll down and past threshold
    //   if (currentScrollY > lastScrollY && currentScrollY > 100) {
      //   setIsVisible(false);
      // }
      // // Scroll up or at top
      // else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
      //   setIsVisible(true);
      // }

      //   setLastScrollY(currentScrollY);
      // };

    // window.addEventListener("scroll", handleScroll, { passive: true });
    // return () => window.removeEventListener("scroll", handleScroll);
  }, []); // lastScrollY removed as it's unused

  useWallet();

  return (
    <header
      className="site-header sticky top-0 z-40 w-full"
      style={{
        background: colors.gradients.purpleToBlack,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-full.png"
            alt="Farmer UI"
            width={3547}
            height={850}
            className="h-8 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm text-white">
          {/* Navigation links removed */}
        </nav>
      </div>
      <ChainGuardBanner />
    </header>
  );
};

// Footer removed per minimalist end-cap requirement.

export const Layout = ({ children }: React.PropsWithChildren) => {
  // Disable slow scroll to fix browser native scrolling issues
  useSlowScroll({ factor: 0.5, enabled: false });
  return (
    <div className="min-h-full flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      {/* Fixed overlay navigation buttons (old project behavior) */}
      <NavigationButtons />
      <main className="flex-1">{children}</main>
    </div>
  );
};
