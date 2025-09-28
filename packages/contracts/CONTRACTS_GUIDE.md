# Algorand Router + Mock-Yield Contract System

## Overview

This system implements a yield aggregation router with mock yield generation for testing and development purposes. The architecture follows a router pattern that allows for scalable yield farming strategies.

## Architecture

### Core Components

1. **Router Contract** - Routes deposits/withdrawals to yield-generating contracts
2. **Mock-Yield Contract** - Simulates yield generation with configurable APY
3. **TypeScript Interfaces** - ARC-4 ABI compliant method signatures
4. **Deployment Scripts** - Automated deployment for LocalNet/TestNet
5. **Test Suite** - Comprehensive Jest-based testing

### Key Features

- **Router Pattern**: Centralized contract that routes funds to multiple yield strategies
- **Security Guards**: Per-transaction caps, pause functionality, allowlist management
- **Yield Calculation**: Time-based yield accrual with configurable APY
- **Asset Support**: Both ALGO and Algorand Standard Assets (ASA)
- **Type Safety**: Full TypeScript implementation with ARC-4 ABI compliance

## Setup Requirements

### Prerequisites

1. **Node.js**: Version 16+
2. **pnpm**: Package manager
3. **Docker**: For LocalNet development
4. **AlgoKit CLI**: For Algorand development environment

### Installation

```bash
# Install AlgoKit
brew install pipx
pipx install algokit

# Install dependencies
pnpm install
```

## Configuration

### Environment Files

Create `.env.localnet` and `.env.testnet` files:

```env
# Algorand Node Configuration
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=a

# Indexer Configuration
INDEXER_SERVER=http://localhost
INDEXER_PORT=8980
INDEXER_TOKEN=a

# Wallet Configuration
WALLET_MNEMONIC=your_wallet_mnemonic_here
```

### Network Profiles

- **LocalNet**: Local development network
- **TestNet**: Algorand test network

## Usage

### Development

```bash
# Start LocalNet
algokit localnet start

# Deploy to LocalNet
pnpm deploy:localnet

# Run E2E tests
pnpm e2e:localnet

# Run test suite
pnpm test
```

### Deployment

```bash
# Deploy to TestNet
pnpm deploy:testnet

# Run TestNet demo
pnpm demo
```

## Contract Details

### Router Contract Methods

- `setAllowed(targetAppId, allowed)` - Allow/deny target contracts
- `setPerTxCap(cap)` - Set maximum transaction size
- `pause(paused)` - Emergency pause functionality
- `routeDeposit(targetAppId, assetId, amount)` - Route deposits
- `routeWithdraw(targetAppId, assetId, amount)` - Route withdrawals

### Mock-Yield Contract Methods

- `setApy(apyBps)` - Set APY in basis points (500 = 5%)
- `deposit(assetId, amount)` - Deposit assets
- `withdraw(assetId, amount)` - Withdraw assets + yield
- `calculateYield(userAddress)` - Calculate accrued yield

## Testing

### Test Coverage

- ✅ Unit tests for all contract methods
- ✅ Integration tests for router functionality
- ✅ E2E tests for complete deposit/withdraw flow
- ✅ Edge cases and error handling
- ✅ ABI validation and type safety

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test mock-yield.test.ts
```

## Integration

### Frontend Integration

1. Import contract interfaces:
```typescript
import { RouterContract, MockYieldContract } from '@farmin/contracts';
```

2. Connect to Algorand network:
```typescript
const algodClient = new algosdk.Algodv2(token, server, port);
const indexerClient = new algosdk.Indexer(token, server, port);
```

3. Create contract instances:
```typescript
const router = new RouterContract(appId, algodClient, indexerClient);
const mockYield = new MockYieldContract(appId, algodClient, indexerClient);
```

### Wallet Integration

The system is designed to work with Pera Wallet and other Algorand wallet providers. Use the existing wallet system in the main application.

## Security Considerations

### Current Implementations
- ✅ Per-transaction caps
- ✅ Emergency pause functionality
- ✅ Contract allowlisting
- ✅ Input validation

### Future Enhancements
- 🔄 Time-locks
- 🔄 Multi-signature requirements
- 🔄 Audit logging
- 🔄 Upgradability patterns

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure LocalNet is running
2. **Compilation Errors**: Check TypeScript version compatibility
3. **Test Failures**: Verify mock setup and environment configuration

### Getting Help

- Check the main project documentation
- Review test files for usage examples
- Refer to Algorand Developer Documentation

## Next Steps

1. **Production Deployment**: Deploy to MainNet with proper security measures
2. **Real Yield Integration**: Replace mock contracts with actual yield protocols
3. **Advanced Features**: Add more sophisticated routing strategies
4. **Monitoring**: Implement performance and security monitoring

---

This guide provides the essential information for understanding and working with the Algorand Router + Mock-Yield contract system. For detailed implementation examples, refer to the test files and deployment scripts.