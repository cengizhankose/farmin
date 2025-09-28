// scripts/gen-local-account.ts
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'

/**
 * Reads .env.localnet, generates a fresh account, funds it from LocalNet dispenser,
 * and writes MNEMONIC=<...> into .env.localnet (creates the file if missing).
 */
async function main() {
  const envFile = path.resolve(process.cwd(), '.env.localnet')

  // Load environment variables explicitly
  dotenv.config({ path: envFile })

  const ALGOD_SERVER = process.env.ALGOD_SERVER ?? 'http://localhost'
  const ALGOD_PORT = Number(process.env.ALGOD_PORT ?? 4001)
  const ALGOD_TOKEN = process.env.ALGOD_TOKEN ?? ''

  if (!ALGOD_TOKEN) {
    throw new Error('ALGOD_TOKEN is empty. Read it from container and set in .env.localnet first.')
  }

  // Algod client
  const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

  // 1) Generate a brand-new account
  const acct = algosdk.generateAccount()
  const addr = acct.addr
  const mnemonic = algosdk.secretKeyToMnemonic(acct.sk)

  // 2) Fund it from LocalNet dispenser
  //    (AlgoKit utils knows how to fetch the LocalNet dispenser account)
  const dispenser = await algokit.getDispenserAccount(algod)

  // Create and send payment transaction
  const params = await algod.getTransactionParams().do()
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: dispenser.addr,
    receiver: addr,
    amount: algokit.algos(50).microAlgos,
    note: new TextEncoder().encode('localnet funding'),
    suggestedParams: params
  })

  const signedTxn = txn.signTxn(dispenser.sk)
  await algod.sendRawTransaction(signedTxn).do()
  await algosdk.waitForConfirmation(algod, txn.txID(), 10)

  // 3) Quick balance check
  const acctInfo = await algod.accountInformation(addr).do()
  const micro = BigInt(acctInfo.amount)
  const algo = Number(micro) / 1_000_000

  // 4) Write / update .env.localnet (MNEMONIC line)
  let envText = ''
  try {
    envText = fs.readFileSync(envFile, 'utf8')
  } catch {
    // file may not exist; create new
    envText = ''
  }

  if (envText.includes('MNEMONIC=')) {
    envText = envText.replace(/MNEMONIC=.*/g, `MNEMONIC=${mnemonic}`)
  } else {
    envText += (envText.endsWith('\n') ? '' : '\n') + `MNEMONIC=${mnemonic}\n`
  }

  fs.writeFileSync(envFile, envText, 'utf8')

  console.log('✅ LocalNet account generated and funded.')
  console.log('ADDRESS :', addr.toString())
  console.log('BALANCE :', algo.toFixed(6), 'ALGO')
  console.log('➡️  MNEMONIC saved into .env.localnet (do NOT commit this file).')
}

main().catch((e) => {
  console.error('❌ Failed:', e)
  process.exit(1)
})