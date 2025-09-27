Package.json Dependencies:

"@txnlab/use-wallet": "^4.0.0",
"@txnlab/use-wallet-react": "^4.0.0",
"@blockshake/defly-connect": "^1.2.1",
"@perawallet/connect": "^1.4.1",
"algosdk": "^3.0.0",
"notistack": "^3.0.1"

Quick Integration Steps:
Install Dependencies
Wrap WalletProvider in App.tsx
Use the ConnectWallet component
Set environment variables

Algorand wallets (Pera, Defly, Exodus, KMD) — one-shot integration guide
Dependencies (npm):
Required:
@txnlab/use-wallet: ^4.0.0
@txnlab/use-wallet-react: ^4.0.0
algosdk: ^3.x
notistack: ^3.x
Wallet connectors:
@perawallet/connect: ^1.4.x
@blockshake/defly-connect: ^1.2.x
Exodus handled by use-wallet v4 (no extra pkg)
UI (if you kept icons/UI):
react-icons: ^5.x
tailwindcss + daisyui (opsiyonel; UI için)
Core files you already moved:
src/utils/network/getAlgoClientConfigs.ts
src/utils/ellipseAddress.ts
src/components/ConnectWallet.tsx
src/components/Account.tsx
src/usage.tsx (was App.tsx)
Types:
src/interfaces/network.ts (içindeki AlgoViteClientConfig, AlgoViteKMDConfig) da taşınmalı.
Env vars (Vite)
TestNet/MainNet:
VITE_ALGOD_SERVER
VITE_ALGOD_PORT
VITE_ALGOD_TOKEN
VITE_ALGOD_NETWORK = testnet | mainnet
(Indexer opsiyonel) VITE_INDEXER_SERVER, VITE_INDEXER_PORT, VITE_INDEXER_TOKEN
LocalNet + KMD:
VITE_KMD_SERVER
VITE_KMD_PORT
VITE_KMD_TOKEN
VITE_KMD_WALLET
VITE_KMD_PASSWORD
VITE_ALGOD_NETWORK = localnet
usage.tsx (WalletProvider + WalletManager)
import:
{ SupportedWallet, WalletId, WalletManager, WalletProvider } from @txnlab/use-wallet-react
{ SnackbarProvider } from notistack
{ getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from ./utils/network/getAlgoClientConfigs
supported wallets:
If VITE_ALGOD_NETWORK === 'localnet' → KMD with baseServer/token/port
Else (testnet/mainnet) → [WalletId.DEFLY, WalletId.PERA, WalletId.EXODUS]
manager networks:
Use algod config for defaultNetwork and networks mapping
Wrap your root UI with:
<SnackbarProvider><WalletProvider manager={walletManager}>...</WalletProvider></SnackbarProvider>
Minimal example snippet:
// usage.tsx (root-level provider)
const kmdOrWebWallets: SupportedWallet[] =
import.meta.env.VITE_ALGOD_NETWORK === 'localnet'
? [{ id: WalletId.KMD, options: { baseServer: kmd.server, token: String(kmd.token), port: String(kmd.port) } }]
: [{ id: WalletId.DEFLY }, { id: WalletId.PERA }, { id: WalletId.EXODUS }];

const walletManager = new WalletManager({
wallets: kmdOrWebWallets,
defaultNetwork: algod.network,
networks: {
[algod.network]: { algod: { baseServer: algod.server, port: algod.port, token: String(algod.token) } },
},
options: { resetNetwork: true },
});

Connect modal and account display
ConnectWallet.tsx:
useWallet() → wallets, activeAddress
Button list wallets.map(wallet => wallet.connect())
Disconnect: find active wallet and disconnect(), else clear localStorage key @txnlab/use-wallet:v3
Account.tsx:
useWallet() → activeAddress
Network name from getAlgodConfigFromViteEnvironment()
Uses ellipseAddress for display
Usage:
Show a button to open ConnectWallet dialog; when connected, show Account
Hook usage in dApp features
Anywhere you need a signer/address:
const { transactionSigner, activeAddress } = useWallet()
Guard if not connected
Example from Transact.tsx:
Build AlgorandClient via algokit-utils with your algod config
Call send.payment or send.assetTransfer with signer: transactionSigner, sender: activeAddress
Provider-specific notes
Pera:
Requires @perawallet/connect. No extra config when using WalletId.PERA with use-wallet v4.
Defly:
Requires @blockshake/defly-connect. No extra config with WalletId.DEFLY.
Exodus:
No additional package; WalletId.EXODUS is supported by use-wallet v4.
KMD (LocalNet only):
Needs VITE*KMD*\* vars. Don’t include KMD for public networks.
Wallet must exist with the given name/password on your localnet KMD.
Common pitfalls and quick validation logs
Potential issues (most likely first):
Missing env vars: getAlgoClientConfigs throws if undefined.
Not wrapping your app in WalletProvider: useWallet returns undefined fields.
Wrong defaultNetwork or network key mismatch in networks map.
Missing wallet connector deps (Pera/Defly).
Using KMD on non-localnet.
Add quick logs:
console.log('[wallet] network', algodConfig.network, algodConfig.server);
console.log('[wallet] supported', supportedWallets.map(w => w.id));
Validation checklist:
Run UI: connect modal lists Pera/Defly/Exodus (or KMD on localnet)
Click connect → mobile deep link/desktop provider opens
activeAddress appears; Account shows short address + network
Send tx with transactionSigner works; errors show via notistack
Disconnect works and cleans state
Migration notes for your project
You renamed App.tsx → usage.tsx. Ensure your root entry (e.g., main.tsx) imports and renders usage.tsx instead of App.tsx.
Ensure src/interfaces/network.ts path matches your project structure; update imports in getAlgoClientConfigs.ts accordingly.
If you don’t use Tailwind/daisyUI, keep ConnectWallet.tsx logic, swap UI markup/classes as needed.
Final install command
npm i @txnlab/use-wallet @txnlab/use-wallet-react algosdk notistack @perawallet/connect @blockshake/defly-connect react-icons

---

tek seferde entegre olur — ama şu 6 koşulu eksiksiz sağlarsan.

1. Zorunlu paketler kurulu olmalı
   npm i @txnlab/use-wallet @txnlab/use-wallet-react algosdk notistack @perawallet/connect @blockshake/defly-connect react-icons
2. usage.tsx kökte Provider olarak render edilmeli
   main.tsx içinde App yerine usage import et ve render et.
3. Env değişkenleri eksiksiz olmalı
   TestNet/MainNet: VITE_ALGOD_SERVER, VITE_ALGOD_PORT, VITE_ALGOD_TOKEN, VITE_ALGOD_NETWORK
   LocalNet + KMD: yukarıdakilere ek VITE_KMD_SERVER, VITE_KMD_PORT, VITE_KMD_TOKEN, VITE_KMD_WALLET, VITE_KMD_PASSWORD
4. src/interfaces/network.ts da taşınmış ve import path’leri düzeltilmiş olmalı
   getAlgoClientConfigs.ts bu dosyaya type import ediyor.
5. UI kitaplık farkı
   ConnectWallet.tsx DaisyUI sınıfları kullanıyor. DaisyUI yoksa modal görünmeyebilir. Ya DaisyUI kur, ya da dialog’ı open prop’u ile göster (stilini kendin yaz).
6. Diğer projede Vite yoksa
   import.meta.env yerine kendi env çözümünü kullan (CRA/Next uyarlaması gerekebilir).
   En çok çıkacak 1-2 problem (olası kök neden)
7. Eksik/yanlış ENV (özellikle VITE_ALGOD_SERVER veya VITE_ALGOD_NETWORK)
8. usage.tsx kökten render edilmemesi veya interfaces/network.ts taşınmaması
   Hızlı doğrulama logları (ekle ve çalıştır)
   usage.tsx içine:

console.log('[wallet] network', algodConfig.network, algodConfig.server, algodConfig.port);
console.log('[wallet] supported', supportedWallets.map(w => w.id));

ConnectWallet.tsx içine:
console.log('[wallet] activeAddress', activeAddress);
console.log('[wallet] providers', wallets?.map(w => ({ id: w.id, active: w.isActive })));

60 sn smoke test
Sayfa açılışında konsolda [wallet] network ve [wallet] supported doğru mu?
Connect modal’da Pera/Defly/Exodus (ya da localnet’te KMD) listeleniyor mu?
Connect sonrası [wallet] activeAddress doluyor mu ve Account kısaltılmış adres + network gösteriyor mu?
Disconnect çalışıyor mu? (Not: ConnectWallet.tsx localStorage.removeItem('@txnlab/use-wallet:v3') kullanıyor. v4 ise disconnect() yeterli; istersen anahtar adını v4’e güncelleyebilirsin.)
Örnek .env (TestNet)

VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=
VITE_ALGOD_TOKEN=
VITE_ALGOD_NETWORK=testnet
Örnek .env (LocalNet + KMD)
VITE_ALGOD_SERVER=http://localhost
VITE_ALGOD_PORT=4001
VITE_ALGOD_TOKEN=a-token
VITE_ALGOD_NETWORK=localnet

VITE_KMD_SERVER=http://localhost
VITE_KMD_PORT=4002
VITE_KMD_TOKEN=another-token
VITE_KMD_WALLET=unencrypted-default-wallet
VITE_KMD_PASSWORD=passphrase
