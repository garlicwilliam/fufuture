import { ShieldOptionTradeABIs } from './shield-option-address';
type Abi = any[];
export const ABI_CHAIN_LINK: Abi = [
  {
    inputs: [
      { internalType: 'address', name: '_aggregator', type: 'address' },
      { internalType: 'address', name: '_accessController', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'int256', name: 'current', type: 'int256' },
      { indexed: true, internalType: 'uint256', name: 'roundId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
    ],
    name: 'AnswerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'roundId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'startedBy', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'startedAt', type: 'uint256' },
    ],
    name: 'NewRound',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'accessController',
    outputs: [{ internalType: 'contract AccessControllerInterface', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'aggregator',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_aggregator', type: 'address' }],
    name: 'confirmAggregator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_roundId', type: 'uint256' }],
    name: 'getAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint80', name: '_roundId', type: 'uint80' }],
    name: 'getRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_roundId', type: 'uint256' }],
    name: 'getTimestamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestRound',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestTimestamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    name: 'phaseAggregators',
    outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'phaseId',
    outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_aggregator', type: 'address' }],
    name: 'proposeAggregator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposedAggregator',
    outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint80', name: '_roundId', type: 'uint80' }],
    name: 'proposedGetRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposedLatestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_accessController', type: 'address' }],
    name: 'setController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_to', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
export const ABI_OPTION_TRADE_Copy: Abi = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_maker',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slideDownPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slideUpPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
    ],
    name: 'trade',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
export const ABI_OPTION_TRADE: Abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_liquidityManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_buybackAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_brokerAddr',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum PerpetualOptions.ORDER_STATUS',
        name: 'state',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isBuy',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'number',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fundingFeePaid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'openPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'closePrice',
        type: 'uint256',
      },
    ],
    name: 'CloseOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldAddr',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAddr',
        type: 'address',
      },
    ],
    name: 'SetRiskFundAddr',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isBuy',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'number',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tradingFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidationFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fundingFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fundingFeePaid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'openPrice',
        type: 'uint256',
      },
    ],
    name: 'Trade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'assetsNameMapping',
    outputs: [
      {
        internalType: 'contract UnderlyingAsset',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'brokerPortion',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'buybackPortion',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'fundingFeeRateMatrix',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'liquidationFeeRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'migrationInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: 'migrationTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'regulatedTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'inPeriodHours',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'migrationPeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'orders',
    outputs: [
      {
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isBuy',
        type: 'bool',
      },
      {
        internalType: 'enum PerpetualOptions.ORDER_STATUS',
        name: 'state',
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tradingFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidationFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fundingFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fundingFeePaid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'openPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'closePrice',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'riskFundAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userAccount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'depositAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'availableAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lockedAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'userOrderIDMapping',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'userOrders',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_referral',
        type: 'address',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_referral',
        type: 'address',
      },
    ],
    name: 'depositFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_maker',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slideDownPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slideUpPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
    ],
    name: 'trade',
    outputs: [
      {
        internalType: 'uint256',
        name: 'fundingFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slideDownPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_slideUpPrice',
        type: 'uint256',
      },
    ],
    name: 'closeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_ids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '_slideDownPrices',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '_slideUpPrices',
        type: 'uint256[]',
      },
    ],
    name: 'closeOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'orderIDs',
        type: 'uint256[]',
      },
    ],
    name: 'migrationContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_orderIDs',
        type: 'uint256[]',
      },
    ],
    name: 'riskControl',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
    ],
    name: 'checkOrderIsAtRisk',
    outputs: [
      {
        internalType: 'bool',
        name: 'isRisk',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_taker',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'getAccountInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: 'available',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'locked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'orderAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'orderIDs',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
    ],
    name: 'checkOrder',
    outputs: [
      {
        internalType: 'uint256',
        name: '_lpFlag',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
    ],
    name: 'getMaxAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'getOrderLength',
    outputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_limit',
        type: 'uint256',
      },
    ],
    name: 'getOrdersInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'holder',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'isBuy',
            type: 'bool',
          },
          {
            internalType: 'enum PerpetualOptions.ORDER_STATUS',
            name: 'state',
            type: 'uint8',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'tradingFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liquidationFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fundingFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fundingFeePaid',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'openPrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'startTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'closePrice',
            type: 'uint256',
          },
        ],
        internalType: 'struct PerpetualOptions.Order[]',
        name: 'info',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_ids',
        type: 'uint256[]',
      },
    ],
    name: 'queryOrdersInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'holder',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'isBuy',
            type: 'bool',
          },
          {
            internalType: 'enum PerpetualOptions.ORDER_STATUS',
            name: 'state',
            type: 'uint8',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'tradingFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liquidationFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fundingFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fundingFeePaid',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'openPrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'startTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'closePrice',
            type: 'uint256',
          },
        ],
        internalType: 'struct PerpetualOptions.Order[]',
        name: 'info',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'getFundingFeeRateMatrix',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'matrix',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_ids',
        type: 'uint256[]',
      },
    ],
    name: 'getMigrationInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'migrationTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'regulatedTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'inPeriodHours',
            type: 'uint256',
          },
        ],
        internalType: 'struct PerpetualOptions.MigrationDetail[]',
        name: 'info',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_pool',
        type: 'address',
      },
    ],
    name: 'setLiquidityPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_rate',
        type: 'uint256',
      },
    ],
    name: 'setLiquidationFeeRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_underlyingAsset',
        type: 'address',
      },
    ],
    name: 'addOrUpdateUnderlyingAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_migrationPeriod',
        type: 'uint256',
      },
    ],
    name: 'setMigrationPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_rates',
        type: 'uint256[]',
      },
    ],
    name: 'setFundingFeeRateMatrix',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
    ],
    name: 'setRiskFund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const ABI_PRIVATE_POOL: Abi = [
  {
    inputs: [
      {
        internalType: 'contract PublicPool',
        name: '_publicPool',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AddLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'margin',
        type: 'uint256',
      },
    ],
    name: 'AddMargin',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'makerID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'userProfit',
        type: 'uint256',
      },
    ],
    name: 'CloseInPrivatePool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'makerID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marginAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
    ],
    name: 'MatchWithPrivatePool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'makerID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'userProfit',
        type: 'uint256',
      },
    ],
    name: 'RiskInPrivatePool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'account',
    outputs: [
      {
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'availableAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lockedAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isRejectOrder',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isExclusive',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'keeper',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'lockedLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'changePrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'makerAddr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'locked',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'makerExist',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'matchIds',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicPool',
    outputs: [
      {
        internalType: 'contract PublicPool',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'riskFundAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalLockedLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'underlyingName',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'addLiquidityFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_marginAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_marginFee',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_maker',
        type: 'address',
      },
    ],
    name: 'matchOrder',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_profit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_fundingFee',
        type: 'uint256',
      },
    ],
    name: 'close',
    outputs: [
      {
        internalType: 'uint256',
        name: 'userProfit',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isAgreement',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_number',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_fundingFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_profit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_openPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_currPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_liquidationFeeRate',
        type: 'uint256',
      },
    ],
    name: 'riskClose',
    outputs: [
      {
        internalType: 'bool',
        name: 'flag',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'userProfit',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isAgreement',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'addMarginAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_isRejectOrder',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: '_isExclusive',
        type: 'bool',
      },
    ],
    name: 'setMakerInfo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
    ],
    name: 'getMarginAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'marginAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_makerOrderIDs',
        type: 'uint256[]',
      },
    ],
    name: 'getMakerLiquidityOrders',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'orderID',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'marginAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'marginFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'changePrice',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'makerAddr',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'locked',
            type: 'bool',
          },
        ],
        internalType: 'struct PrivatePool.LiquidityMarket[]',
        name: 'list',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMakerLength',
    outputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_limit',
        type: 'uint256',
      },
    ],
    name: 'getMakerList',
    outputs: [
      {
        internalType: 'address[]',
        name: 'list',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMakerOrderLength',
    outputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_limit',
        type: 'uint256',
      },
    ],
    name: 'getMakerOrderList',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'orderID',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'marginAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'marginFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'changePrice',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'makerAddr',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'locked',
            type: 'bool',
          },
        ],
        internalType: 'struct PrivatePool.LiquidityMarket[]',
        name: 'list',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_ids',
        type: 'uint256[]',
      },
    ],
    name: 'getMatchIds',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRiskFundAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
    ],
    name: 'setRiskFundAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_pool',
        type: 'address',
      },
    ],
    name: 'setPublicPoolAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_keeperAddr',
        type: 'address',
      },
    ],
    name: 'setKeeper',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const ABI_PUBLIC_POOL: Abi = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_formula',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minted',
        type: 'uint256',
      },
    ],
    name: 'AddLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'makerID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'userProfit',
        type: 'uint256',
      },
    ],
    name: 'CloseInPublicPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'makerID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marginAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
    ],
    name: 'MatchWithPublicPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'profit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'moveProfit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'openPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'movePrice',
        type: 'uint256',
      },
    ],
    name: 'MoveToPublic',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'makerID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'userProfit',
        type: 'uint256',
      },
    ],
    name: 'RiskInPubicPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'addressIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'appendRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'formula',
    outputs: [
      {
        internalType: 'contract Formula',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'keeperMap',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'lockedLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'takerId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'changePrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'makerAddr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'locked',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'matchIds',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'privatePools',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicPoolInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: 'depositedAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lockedAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'availableAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'riskFundAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_auth',
        type: 'bool',
      },
    ],
    name: 'setKeeper',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addr',
        type: 'address',
      },
    ],
    name: 'isKeeper',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_auth',
        type: 'bool',
      },
    ],
    name: 'setPrivatePool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addr',
        type: 'address',
      },
    ],
    name: 'isPrivatePool',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_mintAmount',
        type: 'uint256',
      },
    ],
    name: 'addLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'minted',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_mintAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'addLiquidityFor',
    outputs: [
      {
        internalType: 'uint256',
        name: 'minted',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_lpAmount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_marginAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_marginFee',
        type: 'uint256',
      },
    ],
    name: 'matchOrder',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_profit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_moveProfit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_number',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_openPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_movePrice',
        type: 'uint256',
      },
    ],
    name: 'moveFromPrivatePool',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_profit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_fundingFee',
        type: 'uint256',
      },
    ],
    name: 'close',
    outputs: [
      {
        internalType: 'uint256',
        name: '_userProfit',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isAgreement',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_profit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_fundingFee',
        type: 'uint256',
      },
    ],
    name: 'riskClose',
    outputs: [
      {
        internalType: 'bool',
        name: '_flag',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_userProfit',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isAgreement',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_appendRate',
        type: 'uint256',
      },
    ],
    name: 'setAppendRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_mintAmount',
        type: 'uint256',
      },
    ],
    name: 'getMintLPTokenAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'minted',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_lpAmount',
        type: 'uint256',
      },
    ],
    name: 'getTokenAmountByLPToken',
    outputs: [
      {
        internalType: 'uint256',
        name: 'tokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_currentPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_poolType',
        type: 'uint256',
      },
    ],
    name: 'getLockedAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidationFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_orderID',
        type: 'uint256',
      },
    ],
    name: 'getMarginAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'marginAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRiskFundAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
export const ABI_PUBLIC_POOL_Copy: Abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_lpAmount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
export const ABI_LIQUIDITY_MANAGER: Abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_factory',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenAddr',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'poolAddr',
        type: 'address',
      },
    ],
    name: 'CreatePrivatePool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenAddr',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'poolAddr',
        type: 'address',
      },
    ],
    name: 'CreatePublicPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'liquidityFactory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'perpetual',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'privatePools',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'publicPools',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'riskFundAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'bool',
        name: '_isPrivate',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'addLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'lp',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
    ],
    name: 'getLiquidityPool',
    outputs: [
      {
        internalType: 'address',
        name: 'priPool',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'pubPool',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_perpetual',
        type: 'address',
      },
    ],
    name: 'setPerpetual',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenListLength',
    outputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_limit',
        type: 'uint256',
      },
    ],
    name: 'getTokenList',
    outputs: [
      {
        internalType: 'address[]',
        name: 'list',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
export const ABI_LIQUIDITY_FACTORY: Abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_publicPool',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
    ],
    name: 'createPrivatePool',
    outputs: [
      {
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_riskFundAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_formula',
        type: 'address',
      },
    ],
    name: 'createPublicPool',
    outputs: [
      {
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const ABI_UNDERLYING_ASSET: Abi = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_formula',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'SetFormula',
    type: 'event',
  },
  {
    inputs: [],
    name: 'formula',
    outputs: [
      {
        internalType: 'contract Formula',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidationFeeRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tradingFeeRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_openPrice',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
    ],
    name: 'getFundingFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '_fee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
    ],
    name: 'getFundingFeeRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '_fundingFeeRate',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_number',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_period',
        type: 'uint256',
      },
    ],
    name: 'fees',
    outputs: [
      {
        internalType: 'uint256',
        name: 'total',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tradingFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fundingFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidationFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentPrice',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_currentPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_poolType',
        type: 'uint256',
      },
    ],
    name: 'getLockedAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'marginFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'forceFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isBuy',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_period',
        type: 'uint256',
      },
    ],
    name: 'getMaxOpenAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_formula',
        type: 'address',
      },
    ],
    name: 'setFormula',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_minAmount',
        type: 'uint256',
      },
    ],
    name: 'setMinAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tradingFeeRate',
        type: 'uint256',
      },
    ],
    name: 'setTradingFeeRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_liquidationFeeRate',
        type: 'uint256',
      },
    ],
    name: 'setliquidationFeeRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_priceThirdFlag',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_thirdProxyPrice',
        type: 'uint256',
      },
    ],
    name: 'setPriceThirdProxy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getThirdPriceAndFlag',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
export const ABI_AGGREGATOR: Abi = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_aggregatorAddr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_reverse',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'targetAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'Invoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'keeper',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'auth',
        type: 'bool',
      },
    ],
    name: 'SetKeeper',
    type: 'event',
  },
  {
    inputs: [],
    name: 'aggregator',
    outputs: [
      {
        internalType: 'contract IAggregatorV3',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'keeperMap',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'multiplier',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reverse',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_aggregatorAddr',
        type: 'address',
      },
    ],
    name: 'setAggregator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_multiplier',
        type: 'uint256',
      },
    ],
    name: 'setMultiplier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_reverse',
        type: 'bool',
      },
    ],
    name: 'setReverse',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const ABI_BROKER: Abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'invitee',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'inviter',
        type: 'address',
      },
    ],
    name: 'AddBroker',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'keeper',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'flag',
        type: 'bool',
      },
    ],
    name: 'SetKeeper',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'inviters',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'keeperMap',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_broker',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_rewards',
        type: 'uint256',
      },
    ],
    name: 'distributeRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_tokens',
        type: 'address[]',
      },
    ],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_invitee',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_inviter',
        type: 'address',
      },
    ],
    name: 'addBroker',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'auth',
        type: 'bool',
      },
    ],
    name: 'setKeeper',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'isKeeper',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
];

export const SHIELD_OPTION_TRADE_ABI: ShieldOptionTradeABIs = {
  optionTrade: ABI_OPTION_TRADE,
  liquidityManager: ABI_LIQUIDITY_MANAGER,
  liquidityFactory: ABI_LIQUIDITY_FACTORY,
  broker: ABI_BROKER,
};
