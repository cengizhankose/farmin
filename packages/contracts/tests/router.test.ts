import { RouterContract } from '../src/contracts/router';
import { MockYieldContract } from '../src/contracts/mock-yield';
import * as algosdk from 'algosdk';
import { MethodSelectors, validateArc4Type } from '../src/utils/abi';

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
};

// Mock Indexer client
const mockIndexerClient = {
  lookupApplications: jest.fn().mockReturnValue({
    includeAll: jest.fn().mockReturnThis(),
    do: jest.fn().mockResolvedValue({
      application: {
        params: {
          'global-state': []
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

describe('RouterContract', () => {
  let routerContract: RouterContract;
  let mockAccount: algosdk.Account;

  beforeEach(() => {
    routerContract = new RouterContract(
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
      expect(routerContract['appIndex']).toBe(123);
      expect(routerContract['algodClient']).toBe(mockAlgodClient);
      expect(routerContract['indexerClient']).toBe(mockIndexerClient);
    });
  });

  describe('setAllowed', () => {
    it('should create and send setAllowed transaction', async () => {
      const result = await routerContract.setAllowed(mockAccount, 456, true);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });

    it('should validate parameters', () => {
      expect(validateArc4Type(456, 'application')).toBe(true);
      expect(validateArc4Type(true, 'bool')).toBe(true);
    });
  });

  describe('setPerTxCap', () => {
    it('should create and send setPerTxCap transaction', async () => {
      const result = await routerContract.setPerTxCap(mockAccount, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('pause', () => {
    it('should create and send pause transaction', async () => {
      const result = await routerContract.pause(mockAccount, true);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('routeDeposit', () => {
    it('should handle ALGO deposits correctly', async () => {
      const result = await routerContract.routeDeposit(mockAccount, 456, 0, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });

    it('should handle ASA deposits correctly', async () => {
      const result = await routerContract.routeDeposit(mockAccount, 456, 123, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('routeWithdraw', () => {
    it('should create and send routeWithdraw transaction', async () => {
      const result = await routerContract.routeWithdraw(mockAccount, 456, 0, 1_000_000n);

      expect(result).toBe('test-tx-id');
      expect(mockAlgodClient.sendRawTransaction).toHaveBeenCalledWith('signed-txn');
    });
  });

  describe('getGlobalState', () => {
    it('should return global state value', async () => {
      mockIndexerClient.lookupApplications.mockReturnValue({
        includeAll: jest.fn().mockReturnThis(),
        do: jest.fn().mockResolvedValue({
          application: {
            params: {
              globalState: [
                {
                  key: Buffer.from('test-key').toString('base64'),
                  value: { type: 0, uint: 42 }
                }
              ]
            }
          }
        })
      });

      const result = await routerContract.getGlobalState('test-key');
      expect(result).toBe(42);
    });

    it('should return undefined for non-existent key', async () => {
      const result = await routerContract.getGlobalState('non-existent');
      expect(result).toBeUndefined();
    });

    it('should throw error without indexer client', async () => {
      const routerWithoutIndexer = new RouterContract(123, mockAlgodClient as any);
      await expect(routerWithoutIndexer.getGlobalState('test-key')).rejects.toThrow();
    });
  });
});

describe('ABI Validation', () => {
  describe('validateArc4Type', () => {
    it('should validate uint64 type', () => {
      expect(validateArc4Type(0n, 'uint64')).toBe(true);
      expect(validateArc4Type(2n ** 64n - 1n, 'uint64')).toBe(true);
      expect(validateArc4Type(-1n, 'uint64')).toBe(false);
      expect(validateArc4Type(2n ** 64n, 'uint64')).toBe(false);
    });

    it('should validate bool type', () => {
      expect(validateArc4Type(true, 'bool')).toBe(true);
      expect(validateArc4Type(false, 'bool')).toBe(true);
      expect(validateArc4Type(1, 'bool')).toBe(false);
    });

    it('should validate application type', () => {
      expect(validateArc4Type(0, 'application')).toBe(true);
      expect(validateArc4Type(2 ** 32 - 1, 'application')).toBe(true);
      expect(validateArc4Type(-1, 'application')).toBe(false);
      expect(validateArc4Type(2 ** 32, 'application')).toBe(false);
    });

    it('should validate asset type', () => {
      expect(validateArc4Type(0, 'asset')).toBe(true);
      expect(validateArc4Type(1000, 'asset')).toBe(true);
      expect(validateArc4Type(-1, 'asset')).toBe(false);
    });

    it('should validate account type', () => {
      expect(validateArc4Type('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ', 'account')).toBe(true);
      expect(validateArc4Type('invalid', 'account')).toBe(false);
    });
  });
});