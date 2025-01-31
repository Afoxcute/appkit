import React from "react";
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import {
  PhantomWalletAdapter,
  Coin98WalletAdapter,
  LedgerWalletAdapter,
  NekoWalletAdapter,
  SkyWalletAdapter,
  TokenPocketWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Set up Solana Adapter with all your desired wallets
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(),
    new Coin98WalletAdapter(),
    new LedgerWalletAdapter(),
    new NekoWalletAdapter(),
    new SkyWalletAdapter(),
    new TokenPocketWalletAdapter(),
  ]
});

// Create metadata object
const metadata = {
  name: 'Appkit-stake-sol',
  description: 'Stake and vest your SOL for rewards',
  url: window.location.origin, // This will automatically use your domain
  icons: ['your-icon-url'] // Replace with your app's icon URL
};

// Initialize AppKit
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId: '676b926d2f158aefca525b662d344389', // Replace with your project ID from cloud.reown.com
  features: {
    analytics: true
  }
});

export const WalletContextProvider = ({ children }) => {
  return <>{children}</>;
};

// Create a connect button component
export const ConnectWalletButton = () => {
  return <appkit-button />;
};

export default WalletContextProvider;