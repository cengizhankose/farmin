# Account Generation Scripts

## LocalNet Account Generator

### Description
Creates a new Algorand account, funds it from LocalNet dispenser, and saves the mnemonic to `.env.localnet`.

### Usage

1. **Start LocalNet** (if not running):
   ```bash
   algokit localnet start
   ```

2. **Ensure `.env.localnet` has required config**:
   ```env
   ALGORAND_NETWORK=localnet
   ALGOD_SERVER=http://localhost
   ALGOD_PORT=4001
   ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
   ```

3. **Install dependencies** (first time):
   ```bash
   pnpm add @algorandfoundation/algokit-utils
   ```

4. **Run the script**:
   ```bash
   pnpm gen:local:acct
   ```

### Expected Output
```
✅ LocalNet account generated and funded.
ADDRESS : AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ
BALANCE : 50.000000 ALGO
➡️  MNEMONIC saved into .env.localnet (do NOT commit this file).
```

### What it does:
- Generates a new Algorand account
- Funds it with 50 ALGO from LocalNet dispenser
- Updates `.env.localnet` with the mnemonic
- Displays account address and balance

### Important Notes:
- **Never commit `.env.localnet` to git** (it should be in .gitignore)
- This script is for **LocalNet development only**
- For TestNet, use the faucet at https://bank.testnet.algorand.network/

---

## TestNet Account Generator (Future)

A similar script can be created for TestNet using the faucet API for automatic funding.