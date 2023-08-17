export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  ZK_SYNC2_TESTNET = 280,
}

// Currently we support only ZK_SYNC2.0 GOERLI chain
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  // SupportedChainId.MAINNET,
  // SupportedChainId.RINKEBY,
  SupportedChainId.ZK_SYNC2_TESTNET,
];
