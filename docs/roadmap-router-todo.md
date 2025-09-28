# Algorand Router + Mock-Yield Implementation Roadmap

## Overview
This document outlines the implementation plan for Algorand Router and Mock-Yield smart contracts using AlgoKit + TypeScript in the Farmin monorepo.

## Current Status ✅ COMPLETED

### Phase 1: AlgoKit Project Structure ✅
- [x] Docker Desktop v28.3.3 installed and verified
- [x] AlgoKit CLI v2.9.1 installed
- [x] Created `packages/contracts/` directory structure
- [x] Configured TypeScript workspace integration
- [x] Set up package.json with proper dependencies

### Phase 2: Smart Contract Development ✅
- [x] Defined ARC-4 ABI interfaces for Router and Mock-Yield contracts
- [x] Implemented Router contract with guards and inner app calls
- [x] Implemented Mock-Yield contract with APY and TVL tracking
- [x] Created utility functions for ARC-4 encoding/decoding

### Phase 3: Deployment & Testing ✅
- [x] Created deployment scripts for LocalNet (`deploy.localnet.ts`)
- [x] Created deployment scripts for TestNet (`deploy.testnet.ts`)
- [x] Implemented LocalNet E2E testing scenario (`e2e.localnet.ts`)
- [x] Implemented TestNet E2E testing scenario (`e2e.testnet.ts`)
- [x] Set up comprehensive test suite with Jest

## Quick Start Guide

### Prerequisites
- Docker Desktop (for LocalNet)
- AlgoKit CLI: `pipx install algokit`
- Node.js 18+
- pnpm

### LocalNet Setup

1. **Start LocalNet**
```bash
algokit localnet start
```

2. **Configure Environment**
```bash
cp .env.example .env.localnet
# Edit .env.localnet with your mnemonic
```

3. **Deploy Contracts**
```bash
cd packages/contracts
pnpm install
pnpm deploy:localnet
```

4. **Run E2E Test**
```bash
pnpm e2e:localnet
```

### TestNet Setup

1. **Configure Environment**
```bash
cp .env.example .env.testnet
# Edit .env.testnet with TestNet configuration
```

2. **Deploy Contracts**
```bash
pnpm deploy:testnet
```

3. **Run E2E Test**
```bash
pnpm e2e:testnet
```

## Contract Architecture

### Router Contract
- **App ID**: Environment variable `ROUTER_APP_ID`
- **Methods**:
  - `setAllowed(appId, allowed)` - Allow/deny target applications
  - `setPerTxCap(cap)` - Set maximum transaction amount
  - `pause(paused)` - Pause/unpause contract
  - `routeDeposit(targetAppId, assetId, amount)` - Route deposits
  - `routeWithdraw(targetAppId, assetId, amount)` - Route withdrawals

### Mock-Yield Contract
- **App ID**: Environment variable `MOCK_YIELD_APP_ID`
- **Methods**:
  - `setApy(apyBps)` - Set APY in basis points (500 = 5%)
  - `deposit(assetId, amount)` - Deposit assets
  - `withdraw(assetId, amount)` - Withdraw assets
- **Features**:
  - Simple yield calculation: `(amount * apyBps * time) / YEAR_BPS`
  - TVL tracking
  - User deposit timestamp tracking

## Available Scripts

```bash
# Development
pnpm build              # Build TypeScript
pnpm compile            # Compile smart contracts (not implemented yet)
pnpm test               # Run unit tests
pnpm typecheck          # Run TypeScript type checking

# Deployment
pnpm deploy:localnet    # Deploy to LocalNet
pnpm deploy:testnet     # Deploy to TestNet

# E2E Testing
pnpm e2e:localnet       # Run LocalNet E2E test
pnpm e2e:testnet        # Run TestNet E2E test

# Cleanup
pnpm clean              # Clean build artifacts
```

## Environment Variables

### LocalNet
```bash
ALGORAND_NETWORK=localnet
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=a-token
KMD_SERVER=http://localhost
KMD_PORT=4002
KMD_TOKEN=another-token
KMD_WALLET=unencrypted-default-wallet
KMD_PASSWORD=passphrase
MNEMONIC=your_mnemonic_here
ROUTER_APP_ID=deployed_router_id
MOCK_YIELD_APP_ID=deployed_mock_yield_id
```

### TestNet
```bash
ALGORAND_NETWORK=testnet
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_TOKEN=
MNEMONIC=your_testnet_mnemonic_here
ROUTER_APP_ID=deployed_router_id
MOCK_YIELD_APP_ID=deployed_mock_yield_id
```

## Security Features

### Router Contract Guards
- [x] `paused` flag validation on all mutator methods
- [x] `perTxCap` amount validation
- [x] `allowed[targetAppId]` verification
- [ ] Asset ID validation (ALGO vs ASA) - TODO
- [ ] Reentrancy protection - TODO

### Mock-Yield Contract Security
- [x] Basic deposit/withdrawal validation
- [x] Yield calculation bounds checking
- [ ] Front-running protection - TODO
- [ ] Emergency pause functionality - TODO

## Testing Coverage

### Unit Tests
- [x] Router contract methods
- [x] Mock-Yield contract methods
- [x] ABI validation utilities
- [x] Yield calculation formulas

### Integration Tests
- [x] Contract deployment
- [x] Method execution
- [x] State management

### E2E Tests
- [x] LocalNet complete flow
- [x] TestNet complete flow
- [ ] Error scenarios - TODO

## Future Enhancements

### Phase 4: Frontend Integration (PENDING)
- [ ] Integrate with existing wallet system (Pera Connect)
- [ ] Add contract interaction UI components
- [ ] Implement network switching (localnet/testnet)

### Phase 5: Advanced Features (PENDING)
- [ ] Real DeFi protocol contracts
- [ ] Advanced yield strategies
- [ ] Multi-asset support
- [ ] Governance features

### Phase 6: Production Readiness (PENDING)
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Performance optimization
- [ ] Monitoring and alerting

## Troubleshooting

### Common Issues

1. **LocalNet not starting**
   ```bash
   algokit localnet reset
   algokit localnet start
   ```

2. **Contract deployment fails**
   - Check mnemonic is correct
   - Verify sufficient balance
   - Ensure LocalNet is running

3. **E2E test fails**
   - Check contract IDs are set in environment
   - Verify contracts are deployed
   - Check account balance

### Getting Help

- Check AlgoKit documentation: https://developer.algorand.org/docs/get-started/algokit/
- Review this implementation guide
- Check existing test files for examples

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Run all tests before submitting

## License

MIT License - see LICENSE file for details.