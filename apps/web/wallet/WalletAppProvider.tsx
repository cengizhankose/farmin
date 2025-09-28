import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { SnackbarProvider } from "notistack";
import {
  SupportedWallet,
  WalletId,
  WalletManager,
  WalletProvider,
  useWallet,
} from "@txnlab/use-wallet-react";
import { logger, logWalletEvent } from "./logger";
import {
  getAlgodConfigFromEnv,
  getKmdConfigFromEnv,
} from "./utils/getAlgoClientConfigs";

interface Props {
  children: ReactNode;
}

export function WalletAppProvider({ children }: Props) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const algod = useMemo(() => {
    return getAlgodConfigFromEnv();
  }, []);

  const normalizedNetwork = useMemo(() => {
    const raw = String(algod.network || "testnet").toLowerCase();
    return ["mainnet", "testnet", "betanet", "localnet"].includes(raw)
      ? (raw as "mainnet" | "testnet" | "betanet" | "localnet")
      : "testnet";
  }, [algod.network]);

  const isReady = Boolean(algod.server && normalizedNetwork);

  useEffect(() => {
    logger.info("wallet:init", {
      client: isClient,
      ready: isReady,
      network: normalizedNetwork,
      server: algod.server,
    });
  }, [isReady, normalizedNetwork, algod.server]);

  // Compose supported wallets: localnet -> KMD; others -> Lute only
  // Compose supported wallets: localnet -> KMD; others -> Pera/Defly only
  const supportedWallets: SupportedWallet[] = (() => {
    try {
      if (normalizedNetwork === "localnet") {
        const kmd = getKmdConfigFromEnv();
        return [
          {
            id: WalletId.KMD,
            options: {
              baseServer: kmd.server,
              token: String(kmd.token ?? ""),
              port: String(kmd.port ?? ""),
            },
          },
        ];
      }
    } catch (e) {
      logger.warn("kmd:config:missing or invalid, skipping KMD", e);
    }
    return [{ id: WalletId.PERA }, { id: WalletId.DEFLY }];
  })();

  const manager = useMemo(() => {
    const networkKey = normalizedNetwork;
    const m = new WalletManager({
      wallets: supportedWallets,
      defaultNetwork: networkKey,
      networks: {
        [networkKey]: {
          algod: {
            baseServer: algod.server,
            port: String(algod.port ?? ""),
            token: String(algod.token ?? ""),
          },
        },
      },
      options: { resetNetwork: true },
    });
    logger.info("wallet:manager:init", {
      network: networkKey,
      server: algod.server,
      wallets: supportedWallets.map((w: any) => w?.id ?? w),
    });
    return m;
  }, [
    normalizedNetwork,
    algod.server,
    algod.port,
    algod.token,
    supportedWallets,
  ]);

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000} preventDuplicate>
      <WalletProvider manager={manager}>
        <WalletEventLogger />
        {children}
      </WalletProvider>
    </SnackbarProvider>
  );
}

function WalletEventLogger() {
  const { activeAddress, wallets } = useWallet();
  const prevRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (activeAddress && prevRef.current !== activeAddress) {
      logWalletEvent({
        type: "WALLET_CONNECTED",
        connector: "auto",
        address: activeAddress,
      });
      prevRef.current = activeAddress;
    }
    if (!activeAddress && prevRef.current) {
      const active = wallets?.find((w) => w.isActive);
      logWalletEvent({
        type: "WALLET_DISCONNECTED",
        connector: active?.id ?? "auto",
      });
      prevRef.current = null;
    }
  }, [activeAddress, wallets]);
  return null;
}
