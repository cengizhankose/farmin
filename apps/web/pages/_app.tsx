import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";
import { WalletProvider } from "@/contexts/WalletContext";
import { CompareProvider } from "@/components/opportunity/CompareBar";
import { Toaster } from "sonner";
import { inter } from "@/fonts";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure a minimum visible duration to cover late-loading animations/assets.
  useEffect(() => {
    // Hide the SSR loader as soon as we hydrate; React overlay continues for ~1.2s
    try {
      // @ts-expect-error - Global function for SSR loader hiding
      if (typeof window !== "undefined" && window.__HIDE_SSR_LOADER__) {
        // @ts-expect-error - Global function for SSR loader hiding
        window.__HIDE_SSR_LOADER__();
      }
    } catch {}
    // Initial load: hold for ~0.5s
    minTimerRef.current = setTimeout(() => setLoading(false), 500);
    return () => {
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
      minTimerRef.current = setTimeout(() => setLoading(false), 500);
    };
    const handleDone = () => {
      // Allow the min timer to elapse before hiding
      // If already elapsed, hide immediately
      if (!minTimerRef.current) {
        setLoading(false);
      }
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <div className={`${inter.variable} min-h-full`}>
        <WalletProvider expected="testnet">
          <CompareProvider>
            <Layout>
              <Component {...pageProps} />
              <Toaster position="top-center" />
            </Layout>
          </CompareProvider>
        </WalletProvider>
        <LoadingOverlay show={loading} label="Loading" />
      </div>
    </ErrorBoundary>
  );
}
