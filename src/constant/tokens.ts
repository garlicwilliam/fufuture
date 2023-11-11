// token
const SYMBOL_DAI: unique symbol = Symbol('DAI');
const SYMBOL_USDT: unique symbol = Symbol('USDT');
const SYMBOL_USDC: unique symbol = Symbol('USDC');
const SYMBOL_SLD: unique symbol = Symbol('SLD');
const SYMBOL_ETH: unique symbol = Symbol('ETH');
const SYMBOL_BTC: unique symbol = Symbol('BTC');
const SYMBOL_BNB: unique symbol = Symbol('BNB');
const SYMBOL_ReDAI: unique symbol = Symbol('reDAI');
const SYMBOL_ReUSDT: unique symbol = Symbol('reUSDT');
const SYMBOL_ReUSDC: unique symbol = Symbol('reUSDC');
const SYMBOL_USD: unique symbol = Symbol('USD');
const SYMBOL_WBNB: unique symbol = Symbol('WBNB');
const SYMBOL_WETH: unique symbol = Symbol('WETH');

const SYMBOL_SS_ETH: unique symbol = Symbol('ssETH');
const SYMBOL_STONE: unique symbol = Symbol('STONE');

export const TOKEN_SYMBOL = {
  DAI: SYMBOL_DAI,
  USDT: SYMBOL_USDT,
  USDC: SYMBOL_USDC,
  SLD: SYMBOL_SLD,
  ETH: SYMBOL_ETH,
  BTC: SYMBOL_BTC,
  BNB: SYMBOL_BNB,
  reDAI: SYMBOL_ReDAI,
  reUSDT: SYMBOL_ReUSDT,
  reUSDC: SYMBOL_ReUSDC,
  USD: SYMBOL_USD,
  WBNB: SYMBOL_WBNB,
  WETH: SYMBOL_WETH,
  ssETH: SYMBOL_SS_ETH,
  STONE: SYMBOL_STONE,
};

export function tokenSymbolFromName(name): symbol | undefined {
  return Object.values(TOKEN_SYMBOL).find(one => one.description === name);
}

// ---------------------------------------------------------------------------------------------------------
