# Farmin Smart Contracts

Algorand Router and Mock-Yield smart contracts for the Farmin DeFi yield aggregator.

## Overview

This package contains:
- **Router Contract**: Routes deposits and withdrawals to yield-generating contracts
- **Mock-Yield Contract**: Simulates yield generation for testing purposes
- **ARC-4 ABI interfaces**: Standardized contract interfaces
- **Deployment scripts**: LocalNet and TestNet deployment automation
- **E2E testing**: End-to-end testing scenarios

## Prerequisites

- Docker Desktop (for LocalNet)
- AlgoKit CLI (`pipx install algokit`)
- Node.js 18+
- pnpm

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start LocalNet:
```bash
algokit localnet start
```

3. Configure environment variables:
```bash
cp .env.example .env.localnet
cp .env.example .env.testnet
```

## Scripts

### Development
- `pnpm build` - Build TypeScript
- `pnpm compile` - Compile smart contracts
- `pnpm test` - Run tests

### Deployment
- `pnpm deploy:localnet` - Deploy to LocalNet
- `pnpm deploy:testnet` - Deploy to TestNet

### Testing
- `pnpm e2e:localnet` - Run LocalNet E2E tests
- `pnpm e2e:testnet` - Run TestNet E2E tests

## Contract Architecture

### Router Contract
- Manages allowed target applications
- Enforces per-transaction caps
- Routes deposits and withdrawals
- Implements pause functionality

### Mock-Yield Contract
- Simulates yield generation
- Tracks TVL and user deposits
- Implements simple interest calculation

## Testing

Run the complete test suite:
```bash
pnpm test
pnpm e2e:localnet
```

## License

MIT