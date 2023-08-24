import { Provider } from 'zksync-web3';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const zkSync = {
  id: 280,
  name: 'zkSync alpha testnet',
  network: 'zksync',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://zksync2-testnet.zksync.dev'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'zkScan',
      url: 'https://explorer.zksync.io/',
    },
    default: {
      name: 'zkScan',
      url: 'https://explorer.zksync.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0A14EB2A6A62488F5AFb7113B2358E241EEFC40e' as `0x${string}`,
      blockCreated: 120863,
    },
  },
};

export const zkSyncProvider = Object.assign(
  new Provider('https://zksync2-testnet.zksync.dev', 280),
  { chains: [zkSync] },
) as Provider;
