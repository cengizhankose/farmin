import { AlgoNextClientConfig, AlgoNextKMDConfig } from "../types/network";

export function getAlgodConfigFromEnv(): AlgoNextClientConfig {
  // Support both existing keys and Todo.md keys
  const server =
    process.env.NEXT_PUBLIC_ALGOD_SERVER ||
    process.env.NEXT_PUBLIC_ALGOD_NODE ||
    "https://testnet-api.algonode.cloud";
  const port = process.env.NEXT_PUBLIC_ALGOD_PORT || "";
  const token = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";
  const network =
    process.env.NEXT_PUBLIC_ALGOD_NETWORK ||
    process.env.NEXT_PUBLIC_ALGO_NETWORK ||
    "TESTNET";

  if (!server) throw new Error("[wallet][env] Missing ALGOD server env");
  if (!network) throw new Error("[wallet][env] Missing ALGOD network env");

  return { server, port: port ?? "", token: token ?? "", network };
}

export function getIndexerConfigFromEnv(): AlgoNextClientConfig | null {
  const server =
    process.env.NEXT_PUBLIC_INDEXER_SERVER ||
    process.env.NEXT_PUBLIC_INDEXER_NODE ||
    "";
  if (!server) return null;
  const port = process.env.NEXT_PUBLIC_INDEXER_PORT;
  const token = process.env.NEXT_PUBLIC_INDEXER_TOKEN;
  const network =
    process.env.NEXT_PUBLIC_ALGOD_NETWORK ||
    process.env.NEXT_PUBLIC_ALGO_NETWORK ||
    "TESTNET";
  return { server, port: port ?? "", token: token ?? "", network };
}

export function getKmdConfigFromEnv(): AlgoNextKMDConfig {
  const server = process.env.NEXT_PUBLIC_KMD_SERVER;
  const port = process.env.NEXT_PUBLIC_KMD_PORT;
  const token = process.env.NEXT_PUBLIC_KMD_TOKEN;
  const wallet = process.env.NEXT_PUBLIC_KMD_WALLET;
  const password = process.env.NEXT_PUBLIC_KMD_PASSWORD;

  if (!server) throw new Error("[wallet][env] Missing NEXT_PUBLIC_KMD_SERVER");
  if (!wallet) throw new Error("[wallet][env] Missing NEXT_PUBLIC_KMD_WALLET");
  if (!password)
    throw new Error("[wallet][env] Missing NEXT_PUBLIC_KMD_PASSWORD");

  return {
    server,
    port: port ?? "",
    token: token ?? "",
    wallet,
    password,
  };
}
