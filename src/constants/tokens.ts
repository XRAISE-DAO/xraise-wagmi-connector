import { BigNumber } from "ethers";
import { SupportedChainId } from "./chains";
import { getAddress } from "ethers/lib/utils.js";

export type ERC20Token = {
  chain: SupportedChainId;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply?: {
    formatted: string;
    value: BigNumber;
  };
  coingecko_ticker: string;
};

// DAI
export const DAI: ERC20Token = {
  chain: SupportedChainId.MAINNET,
  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  decimals: 18,
  symbol: "DAI",
  name: "Dai Stablecoin",
  coingecko_ticker: "dai",
};

export const DAI_ZK_TESTNET: ERC20Token = {
  chain: SupportedChainId.ZK_SYNC2_TESTNET,
  address: "0xAd451F0bAf2a6aA7d8b3F97a4Bd504A9E8A78594",
  decimals: 18,
  symbol: "DAI",
  name: "Dai Stablecoin",
  coingecko_ticker: "dai",
};

// USDC
export const USDC_MAINNET: ERC20Token = {
  chain: SupportedChainId.MAINNET,
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  decimals: 6,
  symbol: "USDC",
  name: "USDC Stablecoin",
  coingecko_ticker: "usd-coin",
};

export const USDC_ZK_TESTNET: ERC20Token = {
  chain: SupportedChainId.ZK_SYNC2_TESTNET,
  address: "0xCf52587df5630b906a6D01d1789aEd10AEF83254",
  decimals: 6,
  symbol: "USDC",
  name: "USDC Stablecoin",
  coingecko_ticker: "usd-coin",
};

// USDT
export const USDT: ERC20Token = {
  chain: SupportedChainId.MAINNET,
  address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  decimals: 6,
  symbol: "USDT",
  name: "Tether USD",
  coingecko_ticker: "tether",
};

export const USDT_ZK_TESTNET: ERC20Token = {
  chain: SupportedChainId.ZK_SYNC2_TESTNET,
  address: "0xCECF7296e03F7753ADc58F39c647C90c5458259A",
  decimals: 6,
  symbol: "USDT", // temp changed to USDC
  name: "Tether USD",
  coingecko_ticker: "tether",
};

// ETH as a token on ZkSync
export const ETH_ZK_TESTNET: ERC20Token = {
  chain: SupportedChainId.ZK_SYNC2_TESTNET,
  address: "0x000000000000000000000000000000000000800A",
  decimals: 18,
  symbol: "ETH",
  name: "Ether (ETH)",
  coingecko_ticker: "ethereum",
};

export const FEE_PAYMENT_TOKENS: {
  [chainId: number]: { [id: number]: ERC20Token };
} = {
  [SupportedChainId.ZK_SYNC2_TESTNET]: {
    0: USDC_ZK_TESTNET,
    1: ETH_ZK_TESTNET,
    2: USDT_ZK_TESTNET,
    3: DAI_ZK_TESTNET,
  },
};

export const SUPPORTED_TOKENS: {
  [chainId: number]: ERC20Token[];
} = {
  [SupportedChainId.ZK_SYNC2_TESTNET]: [
    ETH_ZK_TESTNET,
    USDC_ZK_TESTNET,
    USDT_ZK_TESTNET,
    DAI_ZK_TESTNET,
  ],
};

export const PAYMASTER_TOKENS: {
  [chainId: number]: ERC20Token[];
} = {
  [SupportedChainId.ZK_SYNC2_TESTNET]: [
    ETH_ZK_TESTNET,
    USDC_ZK_TESTNET,
    USDT_ZK_TESTNET,
    DAI_ZK_TESTNET,
  ],
};

export const getToken = (address: string, chain: SupportedChainId) => {
  return SUPPORTED_TOKENS[chain]?.find(
    (t: ERC20Token) => getAddress(t.address) === getAddress(address)
  );
};

export const COINGECKO_TICKER_LIST: string[] = [
  ETH_ZK_TESTNET.coingecko_ticker,
  USDT_ZK_TESTNET.coingecko_ticker,
  USDC_MAINNET.coingecko_ticker,
];
