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
              transition: "opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s",
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
      `}</style>
    </header>
  );
}
