import algosdk, {
  Algodv2,
  SuggestedParams,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk";
import { getAlgodConfigFromEnv } from "./utils/getAlgoClientConfigs";
import { logger } from "./logger";
import { useWallet } from "@txnlab/use-wallet-react";

export function useAlgodClient() {
  const cfg = getAlgodConfigFromEnv();
  const token =
    typeof cfg.token === "string"
      ? cfg.token
      : (cfg.token &&
          (cfg.token["X-Algo-API-Token"] || cfg.token["X-API-Key"])) ||
        "";
  const client = new Algodv2(
    token,
    cfg.server,
    cfg.port ? String(cfg.port) : "",
  );
  return client;
}

export function useSimplePayment() {
  const { activeAddress, signTransactions } = useWallet();
  const client = useAlgodClient();

  return async function sendPayment(to: string, amountMicroAlgos: number) {
    if (!activeAddress) throw new Error("Wallet not connected");
    try {
      logger.info("tx:payment:start", { to, amountMicroAlgos });
      const sp: SuggestedParams = await client.getTransactionParams().do();
      const txn = makePaymentTxnWithSuggestedParamsFromObject({
        // Type cast due to upstream type mismatch in algosdk definitions
        from: activeAddress,
        to,
        amount: amountMicroAlgos,
        suggestedParams: sp,
      } as any);
      const signed = (
        await signTransactions([algosdk.encodeUnsignedTransaction(txn)])
      ).filter((b): b is Uint8Array => !!b);
      const submitRes = (await client
        .sendRawTransaction(signed.length === 1 ? signed[0] : signed)
        .do()) as any;
      const result = {
        txId: submitRes.txId ?? submitRes.txid ?? submitRes["txId"],
      };
      logger.info("tx:payment:submitted", result);
      return result;
    } catch (e) {
      logger.error("tx:payment:error", e);
      throw e;
    }
  };
}
