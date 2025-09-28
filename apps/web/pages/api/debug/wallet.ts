import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'Debug endpoint for wallet context',
    env: {
      NEXT_PUBLIC_ALGOD_SERVER: process.env.NEXT_PUBLIC_ALGOD_SERVER,
      NEXT_PUBLIC_ALGOD_NETWORK: process.env.NEXT_PUBLIC_ALGOD_NETWORK,
      NEXT_PUBLIC_ROUTER_APP_ID: process.env.NEXT_PUBLIC_ROUTER_APP_ID,
      NEXT_PUBLIC_MOCK_YIELD_APP_ID: process.env.NEXT_PUBLIC_MOCK_YIELD_APP_ID,
    },
    timestamp: new Date().toISOString(),
  });
}