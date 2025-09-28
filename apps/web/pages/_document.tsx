import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/logos/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="theme-color" content="#8C45FF" />
        <style>{`
          /* Minimal SSR loader styles to ensure immediate first-paint indicator */
          #__ssr_loader{position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;z-index:10000}
          #__ssr_loader .lab{position:absolute;bottom:12%;color:#e5e5e5;font-family:var(--font-display);font-size:12px;letter-spacing:.04em}
          #__ssr_loader svg{filter:drop-shadow(0 0 12px rgba(255,255,255,.12))}
          #__ssr_loader .c{--circumference:572px;animation:grow 1200ms infinite alternate, spin 2400ms infinite linear}
          @keyframes grow{from{stroke-dasharray:calc(var(--circumference)*.05),var(--circumference)}to{stroke-dasharray:calc(var(--circumference)*.25),var(--circumference)}}
          @keyframes spin{from{stroke-dashoffset:0}to{stroke-dashoffset:calc(var(--circumference)*-.95)}}
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove SSR loader after a safety timeout if hydration runs long
              (function(){
                try { console.log('[SSR Loader] inserted'); } catch {}
                var timeout = setTimeout(function(){
                  var el = document.getElementById('__ssr_loader');
                  if(el) el.parentNode && el.parentNode.removeChild(el);
                  try { console.log('[SSR Loader] auto-removed after 1500ms'); } catch {}
                }, 1500);
                window.__HIDE_SSR_LOADER__ = function(){
                  clearTimeout(timeout);
                  var el = document.getElementById('__ssr_loader');
                  if(el) el.parentNode && el.parentNode.removeChild(el);
                  try { console.log('[SSR Loader] hide requested by hydration'); } catch {}
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <div id="__ssr_loader" role="status" aria-live="polite">
          <svg
            width="120"
            height="120"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#000" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="100%" stopColor="#000" />
              </linearGradient>
            </defs>
            <circle
              className="c"
              cx="100"
              cy="100"
              r="91"
              fill="transparent"
              stroke="url(#g)"
              strokeWidth="10"
              strokeLinecap="round"
              pathLength="572"
            />
          </svg>
          <span className="lab">Loading</span>
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
