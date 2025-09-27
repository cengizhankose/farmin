import React from "react";
import Link from "next/link";

export default function NavigationButtons() {
  const [hideLinks, setHideLinks] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setHideLinks(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
                  width="17"
                  height="17"
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
                <span className="text">Connect Wallet</span>
              </button>

              <div className="btn-bubbles">
                <button className="bubble bubble--pera" type="button">
                  <img src="/logos/pera.svg" alt="Connect Pera" />
                </button>
                <button className="bubble bubble--komodo" type="button">
                  <img src="/logos/komodo.svg" alt="Connect Komodo" />
                </button>
                <button className="bubble bubble--exodus" type="button">
                  <img src="/logos/Exodus.svg" alt="Connect Exodus" />
                </button>
                <button className="bubble bubble--defly" type="button">
                  <img
                    src="/logos/defly.png"
                    alt="Connect Defly"
                    style={{ width: "130%" }}
                  />
                </button>
              </div>
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
          width: 10.9em;
          height: 3.3em;
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
          left: 50%;
          transform: translateX(-50%);
          top: calc(100% + 6px);
          width: 280px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
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
          --size: 68.4px;
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

        .bubble img {
          width: 75%;
          height: 75%;
          display: block;
        }

        /* Color mappings */
        .bubble--pera {
          background: #ffee55;
          animation-delay: 40ms;
        }

        .bubble--komodo {
          background: #000000;
          animation-delay: 120ms;
        }

        .bubble--exodus {
          background: #ffffff;
          animation-delay: 200ms;
        }

        .bubble--defly {
          background: #8c45ff;
          animation-delay: 280ms;
        }

        /* Icon visibility based on background */
        .bubble--komodo img {
          filter: invert(1);
        }

        .bubble--exodus img {
          filter: none;
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
            transform: translateY(22px) scale(1);
            opacity: 0.95;
          }
        }

        /* Hover or balon üstünde iken animasyon aktif kalsın */
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
