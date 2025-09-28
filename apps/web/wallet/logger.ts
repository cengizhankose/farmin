type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_PREFIX = "[wallet]";

function format(level: LogLevel, message: string, ...args: unknown[]) {
  const time = new Date().toISOString();
  return [`${LOG_PREFIX}[${level}]`, time, "-", message, ...args];
}

export const logger = {
  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug(...format("debug", message, ...args));
    }
  },
  info(message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.info(...format("info", message, ...args));
  },
  warn(message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.warn(...format("warn", message, ...args));
  },
  error(message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error(...format("error", message, ...args));
  },
};

// Wallet event logging (lightweight analytics)
type WalletEvent =
  | { type: "WALLET_OPEN"; connector: string }
  | { type: "WALLET_CONNECTED"; connector: string; address?: string }
  | { type: "WALLET_DISCONNECTED"; connector: string }
  | { type: "SIGN_REQUEST"; connector: string; count: number }
  | { type: "SIGN_RESULT"; connector: string; txIds: string[] }
  | { type: "ERROR"; stage: string; message: string; stack?: string };

let SESSION_ID: string | null = null;
function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  if (SESSION_ID) return SESSION_ID;
  try {
    const key = "farmin_session_id";
    SESSION_ID = localStorage.getItem(key);
    if (!SESSION_ID) {
      SESSION_ID = Math.random().toString(36).slice(2, 10);
      localStorage.setItem(key, SESSION_ID);
    }
  } catch {}
  return SESSION_ID || "client";
}

export function logWalletEvent(evt: WalletEvent) {
  const payload = {
    sid: getSessionId(),
    ts: new Date().toISOString(),
    net:
      process.env.NEXT_PUBLIC_ALGOD_NETWORK ||
      process.env.NEXT_PUBLIC_ALGO_NETWORK,
    ...evt,
  };
  try {
    console.info("[WALLET]", payload);
    if (typeof window !== "undefined") {
      // Dispatch browser event (optional listener)
      const evt = new CustomEvent("farmin:wallet", { detail: payload } as any);
      window.dispatchEvent(evt);
      const key = "farmin_log";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push(payload);
      localStorage.setItem(key, JSON.stringify(arr).slice(-50000));
    }
  } catch {}
}

export function withTry<TArgs extends unknown[], TRet>(
  fn: (...args: TArgs) => Promise<TRet>,
  context: string,
) {
  return async (...args: TArgs): Promise<TRet | null> => {
    try {
      logger.debug(`${context}:start`);
      const result = await fn(...args);
      logger.debug(`${context}:success`);
      return result;
    } catch (err) {
      logger.error(`${context}:error`, err);
      return null;
    }
  };
}
