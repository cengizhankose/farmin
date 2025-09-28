import type { NextApiRequest, NextApiResponse } from "next";
import { getTestNetOpportunities } from "@/lib/mock/testnet-opportunities";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const testNetOpps = getTestNetOpportunities();
    const envCheck = {
      ALGORAND_NETWORK: process.env.ALGORAND_NETWORK || "not set",
      NEXT_PUBLIC_ALGORAND_NETWORK: process.env.NEXT_PUBLIC_ALGORAND_NETWORK || "not set",
      allEnv: Object.keys(process.env).filter(key => key.includes('ALGORAND')),
      isTestNetMode: testNetOpps.length > 0,
      testNetOpportunities: testNetOpps,
    };

    return res.status(200).json(envCheck);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}