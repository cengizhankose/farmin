You are a top‐tier Web3 engineer and architect. I need you to _research_, _analyze_, and _build_ a **complete modular wallet integration system** for an Algorand dApp that supports **Pera Wallet** and **Defly Wallet** (and optionally other wallets via WalletConnect). This must be the **fastest, simplest, most reliable** integration possible, with QR code fallback, error handling, logging, and correct modular architecture.

**Step 1: Research & validate current SDKs / methods**

- Fetch and summarize the latest official Pera integration SDK (`@perawallet/connect`) and how it works (connect, sign, disconnect). [oai_citation:0‡Pera Docs](https://docs.perawallet.app/references/pera-connect?utm_source=chatgpt.com)
- Fetch and summarize Defly’s recommended integration / SDK (Defly Connect) or how to integrate via WalletConnect. [oai_citation:1‡defly.gitbook.io](https://defly.gitbook.io/defly-manual/dev/walletconnect?utm_source=chatgpt.com)
- Check if there’s community-backed libraries (e.g. `use-wallet` or `solid-algo-wallets`) that unify these wallets and how they operate. [oai_citation:2‡Algorand Developer Portal](https://developer.algorand.org/tutorials/build-a-solidjs-web-app-with-wallet-integration/?utm_source=chatgpt.com)

**Step 2: Architectural design & decision making**

- Based on the research, decide **which integration paths** to support:
    • Native Pera SDK  
    • Native Defly SDK or through WC  
    • Generic WalletConnect fallback for other wallets (Exodus, etc.)
- Design a modular connector system: each wallet connector is its own module implementing a common interface (connect, signTxns, disconnect).
- Include a **provider / context / hook layer** (React/NextJS) that picks the right connector based on availability or user choice.
- Define **logging / analytics** layer: each event (connect start, success, error, sign request, sign result, disconnect) should be logged with wallet type, address, time, network.
- Define **UI fallback logic**: QR modal opens for mobile wallets, extension popup for wallets installed, fallback to generic WC.

**Step 3: Code generation**  
Produce modular, commented TypeScript / React code for Next.js (client side), including:

1. **Connector interface** (TypeScript interface)
2. **PeraConnector module** using `@perawallet/connect`
3. **DeflyConnector module** (either native or via WC / Defly Connect)
4. **WalletConnect fallback connector**
5. **WalletProvider / Context / Hook** that abstracts and switches between connectors
6. **UI component**: `ConnectWalletButton` with logic to open modal / picker & handle connection
7. **Transaction signing example**: sample send / payment / app call code using whichever connector is active
8. **Logging wrapper** that all connectors call
9. **Error handling & fallback logic**

Ensure code is robust, handles user closing modal, connector not installed, network mismatch, and reconnection on page reload.

**Step 4: Instructions & testing plan**

- Describe how to install dependencies & environment setup (algosdk, perawallet/connect, defly connect, walletconnect)
- Instructions to test in TestNet: how to simulate connecting via mobile Pera, Defly, QR scanning, or extension (if available)
- Logging inspection steps (browser console, localStorage or event dispatch)
- Fallback scenarios checks: user declines, reconnect on reload, multiple wallets installed, mobile vs desktop

**Deliver**:

- A clean, final prompt output that includes all above components (you write it once).
- Use best practices, latest versions, minimal boilerplate, high readability.
