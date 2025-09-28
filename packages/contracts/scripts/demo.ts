#!/usr/bin/env node

/**
 * Demo script for Router + Mock-Yield contracts
 * This script demonstrates the complete workflow
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CONTRACTS_DIR = path.resolve(__dirname, '..');

console.log('🚀 Farmin Router + Mock-Yield Demo');
console.log('==================================\n');

async function runCommand(command: string, args: string[], cwd: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function checkPrerequisites() {
  console.log('📋 Checking prerequisites...\n');

  // Check Docker
  try {
    await runCommand('docker', ['--version'], CONTRACTS_DIR);
    console.log('✅ Docker is installed');
  } catch (error) {
    console.error('❌ Docker is not installed. Please install Docker Desktop.');
    process.exit(1);
  }

  // Check AlgoKit
  try {
    await runCommand('algokit', ['--version'], CONTRACTS_DIR);
    console.log('✅ AlgoKit is installed');
  } catch (error) {
    console.error('❌ AlgoKit is not installed. Run: pipx install algokit');
    process.exit(1);
  }

  // Check Node.js
  try {
    await runCommand('node', ['--version'], CONTRACTS_DIR);
    console.log('✅ Node.js is installed');
  } catch (error) {
    console.error('❌ Node.js is not installed. Please install Node.js 18+');
    process.exit(1);
  }

  // Check pnpm
  try {
    await runCommand('pnpm', ['--version'], CONTRACTS_DIR);
    console.log('✅ pnpm is installed');
  } catch (error) {
    console.error('❌ pnpm is not installed. Please install pnpm');
    process.exit(1);
  }

  console.log('');
}

async function setupEnvironment() {
  console.log('📋 Setting up environment...\n');

  // Check if environment files exist
  const envFiles = ['.env.localnet', '.env.testnet'];

  for (const envFile of envFiles) {
    const envPath = path.join(CONTRACTS_DIR, envFile);
    if (!fs.existsSync(envPath)) {
      console.log(`📝 Creating ${envFile} from template...`);
      const examplePath = path.join(CONTRACTS_DIR, '.env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log(`✅ Created ${envFile}`);
        console.log(`⚠️  Please edit ${envFile} and add your mnemonic`);
      } else {
        console.error(`❌ .env.example not found`);
        process.exit(1);
      }
    } else {
      console.log(`✅ ${envFile} exists`);
    }
  }

  console.log('');
}

async function installDependencies() {
  console.log('📋 Installing dependencies...\n');

  try {
    await runCommand('pnpm', ['install'], CONTRACTS_DIR);
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }

  console.log('');
}

async function startLocalNet() {
  console.log('📋 Starting LocalNet...\n');

  try {
    // Check if LocalNet is already running
    await runCommand('algokit', ['localnet', 'status'], CONTRACTS_DIR);
    console.log('✅ LocalNet is already running');
  } catch (error) {
    console.log('🔄 Starting LocalNet...');
    try {
      await runCommand('algokit', ['localnet', 'start'], CONTRACTS_DIR);
      console.log('✅ LocalNet started successfully');
    } catch (startError) {
      console.error('❌ Failed to start LocalNet');
      process.exit(1);
    }
  }

  console.log('');
}

async function runLocalNetDemo() {
  console.log('📋 Running LocalNet Demo...\n');

  try {
    // Deploy contracts
    console.log('📦 Deploying contracts...');
    await runCommand('pnpm', ['deploy:localnet'], CONTRACTS_DIR);
    console.log('✅ Contracts deployed');

    // Run E2E test
    console.log('🧪 Running E2E test...');
    await runCommand('pnpm', ['e2e:localnet'], CONTRACTS_DIR);
    console.log('✅ E2E test completed');

    console.log('\n🎉 LocalNet demo completed successfully!');
  } catch (error) {
    console.error('❌ LocalNet demo failed');
    console.error('Make sure you have configured your mnemonic in .env.localnet');
    process.exit(1);
  }

  console.log('');
}

async function showNextSteps() {
  console.log('📋 Next Steps:');
  console.log('================');
  console.log('');
  console.log('1. 🧪 TestNet Deployment:');
  console.log('   pnpm deploy:testnet');
  console.log('');
  console.log('2. 🧪 TestNet E2E Test:');
  console.log('   pnpm e2e:testnet');
  console.log('');
  console.log('3. 📚 View Documentation:');
  console.log('   docs/roadmap-router-todo.md');
  console.log('');
  console.log('4. 🌐 Explore Contracts:');
  console.log('   - Router: Manages routing to yield contracts');
  console.log('   - Mock-Yield: Simulates yield generation');
  console.log('');
  console.log('5. 🔧 Develop Features:');
  console.log('   - Add real DeFi protocol integrations');
  console.log('   - Implement frontend wallet integration');
  console.log('   - Add advanced security features');
  console.log('');
}

async function main() {
  try {
    await checkPrerequisites();
    await setupEnvironment();
    await installDependencies();
    await startLocalNet();
    await runLocalNetDemo();
    await showNextSteps();

    console.log('🎊 Demo completed successfully!');
    console.log('📱 Ready for development and testing!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Demo interrupted by user');
  process.exit(0);
});

if (require.main === module) {
  main();
}

export default main;