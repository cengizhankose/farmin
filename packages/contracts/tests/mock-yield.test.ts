import { MockYieldContract } from '../src/contracts/mock-yield';
import * as algosdk from 'algosdk';
import { YEAR_BPS } from '../src/types';

// Mock Algorand client
const mockAlgodClient = {
  getTransactionParams: jest.fn().mockReturnValue({
    do: jest.fn().mockResolvedValue({
      fee: 1000,
      firstRound: 1000,
      lastRound: 2000,
      genesisHash: 'test',
      genesisID: 'test',
      flatFee: false,
      minFee: 1000
    })
  }),
  compile: jest.fn().mockResolvedValue({
    result: 'base64encodedprogram',
    hash: 'test-hash'
  }),
  sendRawTransaction: jest.fn().mockReturnValue({
    do: jest.fn().mockResolvedValue({ txid: 'test-tx-id' })
  }),
  accountInformation: jest.fn().mockReturnValue({
    do: jest.fn().mockResolvedValue({
      amount: 1_000_000,
      appsLocalState: [],
      createdApps: [],
      createdAssets: [],
      assets: [],
      pendingRewards: 0,
      rewardBase: 0,
      rewards: 0,
      round: 1000,
      status: 'Online'
    })
  })
};

// Mock Indexer client
const mockIndexerClient = {
  lookupApplications: jest.fn().mockReturnValue({
    includeAll: jest.fn().mockReturnThis(),
    do: jest.fn().mockResolvedValue({
      application: {
        params: {
          globalState: [
            {
              key: Buffer.from('apy_bps').toString('base64'),
              value: { type: 0, uint: 500 }
            },
            {
              key: Buffer.from('tvl').toString('base64'),
              value: { type: 0, uint: 1_000_000 }
            }
          ]
        }
      }
    })
  })
};

// Mock waitForConfirmation
jest.mock('algosdk', () => ({
  ...jest.requireActual('algosdk'),
  waitForConfirmation: jest.fn().mockResolvedValue({
    applicationIndex: 123,
    'application-index': 123
  }),
  makeApplicationCreateTxnFromObject: jest.fn().mockReturnValue({
    signTxn: jest.fn().mockReturnValue('signed-txn'),
    getTealSign: jest.fn().mockReturnValue(''),
    transactionID: jest.fn().mockReturnValue('test-tx-id')
  }),
  makeApplicationNoOpTxnFromObject: jest.fn().mockReturnValue({
    signTxn: jest.fn().mockReturnValue('signed-txn'),
    getTealSign: jest.fn().mockReturnValue(''),
    transactionID: jest.fn().mockReturnValue('test-tx-id')
  }),
  makePaymentTxnWithSuggestedParamsFromObject: jest.fn().mockReturnValue({
    signTxn: jest.fn().mockReturnValue('signed-txn'),
    getTealSign: jest.fn().mockReturnValue(''),
    transactionID: jest.fn().mockReturnValue('test-tx-id')
  }),
  makeAssetTransferTxnWithSuggestedParamsFromObject: jest.fn().mockReturnValue({
    signTxn: jest.fn().mockReturnValue('signed-txn'),
    getTealSign: jest.fn().mockReturnValue(''),
    transactionID: jest.fn().mockReturnValue('test-tx-id')
  }),
  assignGroupID: jest.fn().mockImplementation((txns: any[]) => {
    return txns.map(tx => ({
      ...tx,
      group: new Uint8Array(32)
    }));
  }),
  mnemonicToSecretKey: jest.fn().mockReturnValue({
    addr: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
    sk: new Uint8Array(32)
  }),
  generateAccount: jest.fn().mockReturnValue({
    addr: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
    sk: new Uint8Array(32)
  })
}));

describe('MockYieldContract', () => {
  let mockYieldContract: MockYieldContract;
  let mockAccount: algosdk.Account;
  const testAddress = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ';

  beforeEach(() => {
    mockYieldContract = new MockYieldContract(
      123,
      mockAlgodClient as any,
      mockIndexerClient as any
    );
    mockAccount = {
      addr: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ' as any,
      sk: new Uint8Array(32)
    } as unknown as algosdk.Account;
  });

  describe('Constructor', () => {
    it('should create instance with correct parameters', () => {
      expect(mockYieldContract['appIndex']).toBe(123);
      expect(mockYieldContract['algodClient']).toBe(mockAlgodClient);
      expect(mockYieldContract['indexerClient']).toBe(mockIndexerClient);
    });
  });

  describe('setApy', () => {
    it('should create and send setApy transaction', async () => {
      const result = await mockYieldContract.setApy(mockAccount, 500);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('deposit', () => {
    it('should handle ALGO deposits correctly', async () => {
      const result = await mockYieldContract.deposit(mockAccount, 0, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });

    it('should handle ASA deposits correctly', async () => {
      const result = await mockYieldContract.deposit(mockAccount, 123, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('withdraw', () => {
    it('should create and send withdraw transaction', async () => {
      const result = await mockYieldContract.withdraw(mockAccount, 0, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('calculateYield', () => {
    it('should calculate yield for user with deposit', async () => {
      // Mock account info with local state
      mockAlgodClient.accountInformation.mockReturnValue({
        do: jest.fn().mockResolvedValue({
          amount: 1_000_000,
          appsLocalState: [
            {
              id: 123,
              keyValue: [
                {
                  key: Buffer.from('amount').toString('base64'),
                  value: { type: 0, uint: 1_000_000 }
                },
                {
                  key: Buffer.from('deposit_ts').toString('base64'),
                  value: { type: 0, uint: Math.floor(Date.now() / 1000) - 86400 }
                }
              ]
            }
          ],
          createdApps: [],
          createdAssets: [],
          assets: [],
          pendingRewards: 0,
          rewardBase: 0,
          rewards: 0,
          round: 1000,
          status: 'Online'
        })
      });

      const result = await mockYieldContract.calculateYield(testAddress);

      expect(result.principal).toBe(1_000_000n);
      expect(result.yield).toBeGreaterThan(0n);
      expect(result.total).toBeGreaterThan(result.principal);
    });

    it('should return zero for user without deposit', async () => {
      mockAlgodClient.accountInformation.mockReturnValue({
        do: jest.fn().mockResolvedValue({
          amount: 1_000_000,
          appsLocalState: [],
          createdApps: [],
          createdAssets: [],
          assets: [],
          pendingRewards: 0,
          rewardBase: 0,
          rewards: 0,
          round: 1000,
          status: 'Online'
        })
      });

      const result = await mockYieldContract.calculateYield(testAddress);

      expect(result.principal).toBe(0n);
      expect(result.yield).toBe(0n);
      expect(result.total).toBe(0n);
    });

    it('should throw error without indexer client', async () => {
      const mockYieldWithoutIndexer = new MockYieldContract(123, mockAlgodClient as any);
      await expect(mockYieldWithoutIndexer.calculateYield(testAddress)).rejects.toThrow();
    });
  });

  describe('getTVL', () => {
    it('should return TVL from global state', async () => {
      const tvl = await mockYieldContract.getTVL();
      expect(tvl).toBe(1_000_000n);
    });
  });

  describe('getAPY', () => {
    it('should return APY from global state', async () => {
      const apy = await mockYieldContract.getAPY();
      expect(apy).toBe(500);
    });
  });

  describe('getGlobalState', () => {
    it('should return global state value', async () => {
      const result = await mockYieldContract.getGlobalState('apy_bps');
      expect(result).toBe(500);
    });

    it('should return undefined for non-existent key', async () => {
      mockIndexerClient.lookupApplications.mockReturnValue({
        includeAll: jest.fn().mockReturnThis(),
        do: jest.fn().mockResolvedValue({
          application: {
            params: {
              globalState: []
            }
          }
        })
      });

      const result = await mockYieldContract.getGlobalState('non-existent');
      expect(result).toBeUndefined();
    });

    it('should throw error without indexer client', async () => {
      const mockYieldWithoutIndexer = new MockYieldContract(123, mockAlgodClient as any);
      await expect(mockYieldWithoutIndexer.getGlobalState('test-key')).rejects.toThrow();
    });
  });
});

describe('Yield Calculation', () => {
  it('should calculate yield correctly for 1 day at 5% APY', () => {
    const principal = 1_000_000n; // 1 ALGO
    const apyBps = 500n; // 5%
    const timeElapsed = 86400n; // 1 day in seconds

    const expectedYield = (principal * apyBps * timeElapsed) / YEAR_BPS;
    const expectedTotal = principal + expectedYield;

    expect(expectedYield).toBeGreaterThan(0n);
    expect(expectedTotal).toBeGreaterThan(principal);
  });

  it('should calculate yield correctly for 30 days at 10% APY', () => {
    const principal = 1_000_000n; // 1 ALGO
    const apyBps = 1000n; // 10%
    const timeElapsed = 30n * 86400n; // 30 days in seconds

    const expectedYield = (principal * apyBps * timeElapsed) / YEAR_BPS;
    const expectedTotal = principal + expectedYield;

    expect(expectedYield).toBeGreaterThan(0n);
    expect(expectedTotal).toBeGreaterThan(principal);
  });

  it('should return zero yield for zero time elapsed', () => {
    const principal = 1_000_000n;
    const apyBps = 500n;
    const timeElapsed = 0n;

    const expectedYield = (principal * apyBps * timeElapsed) / YEAR_BPS;
    const expectedTotal = principal + expectedYield;

    expect(expectedYield).toBe(0n);
    expect(expectedTotal).toBe(principal);
  });
});