"use client";

import React from "react";
import Link from "next/link";
import { useWallet, WalletId } from "@txnlab/use-wallet-react";
import { logger, logWalletEvent } from "@/wallet";

// Inner component that uses wallet hooks safely
function WalletNavigation() {
  const { wallets, activeAddress } = useWallet();
  const [hideLinks, setHideLinks] = React.useState(false);
  const [connecting, setConnecting] = React.useState<WalletId | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const onScroll = () => {
      setHideLinks(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clientActive = mounted ? activeAddress : null;

  const connectById = React.useCallback(
    async (id: WalletId) => {
      try {
        if (connecting) return;
        logger.info("ui:wallet:open", { id });
        logWalletEvent({
          type: "WALLET_OPEN",
          connector: String(id).toLowerCase(),
        });
        const w = wallets?.find((x) => x.id === id);
        if (w) {
          if (w.isActive) return;
          setConnecting(id);
          await w.connect();
          logger.info("ui:wallet:connected", { id });
          setConnecting(null);
          return;
        }
        logger.warn("ui:wallet:not_found", { id });
      } catch (e) {
        logger.error("ui:wallet:connect:error", e);
        logWalletEvent({
          type: "ERROR",
          stage: "connect",
          message: (e as Error)?.message ?? "connect fail",
        });
        setConnecting(null);
      }
    },
    [wallets, connecting],
  );

  const handleDisconnect = React.useCallback(async () => {
    try {
      const active = wallets?.find((w) => w.isActive);
      if (active) await active.disconnect();
    } catch (e) {
      logger.error("ui:wallet:disconnect:error", e);
      logWalletEvent({
        type: "ERROR",
        stage: "disconnect",
        message: (e as Error)?.message ?? "disconnect fail",
      });
    }
  }, [wallets]);

  return (
    <header
      className="fixed z-[9999] top-[calc(env(safe-area-inset-top,0px)+14px)] right-[calc(env(safe-area-inset-right,0px)+24px)] left-auto"
      style={{ pointerEvents: "none" }}
    >
      <nav
        className="pointer-events-auto"
        aria-label="Primary"
        style={{ position: "relative", zIndex: 1 }}
      >
        <ul className="flex items-center list-none m-0 p-0 gap-4 space-x-4 [&>li+li]:ml-4">
          <li
            style={{
              opacity: hideLinks ? 0 : 1,
              transform: hideLinks ? "translateY(-10px)" : "translateY(0)",
              pointerEvents: hideLinks ? "none" : "auto",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <div className="btn-wrap">
              <button className="btn">
                <svg
                  className="sparkle"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="#FFFFFF"
                >
                  <path
                    clipRule="evenodd"
                    d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z"
                    fillRule="evenodd"
                  ></path>
                  <path
                    clipRule="evenodd"
                    d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                {clientActive ? (
                  <span
                    className="text inline-flex items-center gap-2"
                    suppressHydrationWarning
                  >
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: "#ffffff22", color: "#ffffff" }}
                    >
                      {(
                        wallets?.find((w) => w.isActive)?.id || "wallet"
                      ).toString()}
                    </span>
                    Connected
                  </span>
                ) : (
                  <span className="text" suppressHydrationWarning>
                    {connecting ? `Connecting…` : `Connect Wallet`}
                  </span>
                )}
              </button>

              <div className="btn-bubbles">
                <button
                  className="bubble bubble--pera"
                  type="button"
                  onClick={() => mounted && connectById(WalletId.PERA)}
                >
                  <img
                    src="/logos/pera.svg"
                    alt="Connect Pera"
                    style={{ width: "90%" }}
                  />
                </button>
                <button
                  className="bubble bubble--defly"
                  type="button"
                  onClick={() => mounted && connectById(WalletId.DEFLY)}
                >
                  <img
                    src="/logos/defly.svg"
                    alt="Connect Defly"
                    style={{ width: "130%" }}
                  />
                </button>
              </div>

              {clientActive && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleDisconnect}
                    className="rounded-md bg-white/20 px-3 py-1 text-xs text-white hover:bg-white/30"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </li>
          <li
            style={{
              marginLeft: 16,
              opacity: hideLinks ? 0 : 1,
              transform: hideLinks ? "translateY(-10px)" : "translateY(0)",
              pointerEvents: hideLinks ? "none" : "auto",
              transition: "opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s",
            }}
          >
            <Link href="/portfolio" prefetch={false} legacyBehavior>
              <a className="nav-link inline-flex items-center">Portfolio</a>
            </Link>
          </li>
          <li
            style={{
              marginLeft: 16,
              opacity: hideLinks ? 0 : 1,
              transform: hideLinks ? "translateY(-10px)" : "translateY(0)",
              pointerEvents: hideLinks ? "none" : "auto",
              transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s",
            }}
          >
            <Link href="/opportunities" prefetch={false} legacyBehavior>
              <a className="nav-link inline-flex items-center">Opportunities</a>
            </Link>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            "Segoe UI",
            Roboto,
            Helvetica,
            Arial,
            sans-serif;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 14px;
          color: #fff;
          padding-bottom: 10px;
          cursor: pointer;
          text-decoration: none !important;
          border: none !important;
          outline: none !important;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: bottom right;
          background: rgba(255, 255, 255, 1);
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

        /* Wallet Connect Button Styles */
        .btn {
          border: none;
          width: 12.2em;
          height: 3.6em;
          border-radius: 1.38em;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          background: #1c1a1c;
          cursor: pointer;
          transition: all 450ms ease-in-out;
        }

        .sparkle {
          fill: #aaaaaa;
          transition: all 800ms ease;
        }

        .text {
          font-weight: 600;
          color: #aaaaaa;
          font-size: 15px;
        }

        .btn:hover {
          background: linear-gradient(0deg, #1c1a1c, #e9e9e9);
          box-shadow:
            inset 0px 1px 0px 0px rgba(255, 255, 255, 0.3),
            inset 0px -4px 0px 0px rgba(0, 0, 0, 0.2),
            0px 0px 0px 4px rgba(255, 255, 255, 0.2),
            0px 0px 180px 0px #9917ff;
          transform: translateY(-2px);
        }

        .btn:hover .text {
          color: white;
        }

        .btn:hover .sparkle {
          fill: white;
          transform: scale(1.2);
        }

        /* Button wrapper for bubbles */
        .btn-wrap {
          position: relative;
          display: inline-block;
          padding-bottom: 10px;
        }

        /* Bubbles container */
        .btn-bubbles {
          pointer-events: auto;
          position: absolute;
          left: 58%;
          transform: translateX(-50%);
          top: calc(100% + 6px);
          width: 200px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .btn-wrap:hover .btn-bubbles,
        .btn-wrap:has(.btn-bubbles:hover) .btn-bubbles,
        .btn-wrap:focus-within .btn-bubbles {
          opacity: 1;
        }

        /* Individual bubble */
        .bubble {
          --size: 88.9px;
          width: var(--size);
          height: var(--size);
          border-radius: 999px;
          display: grid;
          place-items: center;
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.35));
          transform: translateY(-8px) scale(0.9);
          opacity: 0;
          animation: floatDown 1200ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          cursor: pointer;
          border: none;
          padding: 0;
          transition: all 0.2s ease;
        }

        /* Color mappings */
        .bubble--pera {
          background: #ffee55;
          animation-delay: 40ms;
        }

        .bubble--defly {
          background: #8c45ff;
          animation-delay: 280ms;
        }

        /* Float down animation */
        @keyframes floatDown {
          0% {
            transform: translateY(-8px) scale(0.9);
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          100% {
            transform: translateY(12px) scale(1);
            opacity: 0.95;
          }
        }

        .btn-wrap:hover .bubble,
        .btn-wrap:has(.btn-bubbles:hover) .bubble,
        .btn-wrap:focus-within .bubble {
          animation: floatDown 1200ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        /* Hide bubbles when hover ends */
        .btn-wrap:not(:hover):not(:has(.btn-bubbles:hover)):not(:focus-within)
          .bubble {
          animation: none;
          opacity: 0;
          transform: translateY(-8px) scale(0.9);
        }
      `}</style>
    </header>
  );
}

// Wrapper component to handle SSR safely
export default function NavigationButtons() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return null or a placeholder during SSR
    return null;
  }

  return <WalletNavigation />;
}