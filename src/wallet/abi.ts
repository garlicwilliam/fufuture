export const ERC20 = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
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
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];
export const ERC721 = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'approved', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
    ],
    name: 'mintTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const DEX_POOL_FACTORY_ABI = [
  {
    inputs: [],
    name: 'factory',
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
];
export const UNI_POOL_MIN_ABI: any[] = [
  {
    inputs: [],
    name: 'factory',
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
    name: 'token0',
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
    name: 'token1',
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
];
export const UNI_V2_POOL_ABI: any[] = [
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
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'Burn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0In',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1In',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0Out',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1Out',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint112',
        name: 'reserve0',
        type: 'uint112',
      },
      {
        indexed: false,
        internalType: 'uint112',
        name: 'reserve1',
        type: 'uint112',
      },
    ],
    name: 'Sync',
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
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
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
    stateMutability: 'pure',
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
    stateMutability: 'pure',
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
        name: 'owner',
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
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
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
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
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
        name: 'value',
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
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PERMIT_TYPEHASH',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'nonces',
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
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MINIMUM_LIQUIDITY',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
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
    name: 'token0',
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
    name: 'token1',
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
    name: 'getReserves',
    outputs: [
      {
        internalType: 'uint112',
        name: 'reserve0',
        type: 'uint112',
      },
      {
        internalType: 'uint112',
        name: 'reserve1',
        type: 'uint112',
      },
      {
        internalType: 'uint32',
        name: 'blockTimestampLast',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'price0CumulativeLast',
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
    name: 'price1CumulativeLast',
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
    name: 'kLast',
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
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'liquidity',
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
        name: 'to',
        type: 'address',
      },
    ],
    name: 'burn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1',
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
        name: 'amount0Out',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1Out',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'skim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sync',
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
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const UNI_V3_POOL_ABI: any[] = [
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
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'Burn',
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
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128',
      },
    ],
    name: 'Collect',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128',
      },
    ],
    name: 'CollectProtocol',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paid0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paid1',
        type: 'uint256',
      },
    ],
    name: 'Flash',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'observationCardinalityNextOld',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'observationCardinalityNextNew',
        type: 'uint16',
      },
    ],
    name: 'IncreaseObservationCardinalityNext',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
    ],
    name: 'Initialize',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol0Old',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol1Old',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol0New',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol1New',
        type: 'uint8',
      },
    ],
    name: 'SetFeeProtocol',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount0',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount1',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
    ],
    name: 'burn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'amount0Requested',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'amount1Requested',
        type: 'uint128',
      },
    ],
    name: 'collect',
    outputs: [
      {
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint128',
        name: 'amount0Requested',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'amount1Requested',
        type: 'uint128',
      },
    ],
    name: 'collectProtocol',
    outputs: [
      {
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
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
    name: 'fee',
    outputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeGrowthGlobal0X128',
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
    name: 'feeGrowthGlobal1X128',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'flash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16',
      },
    ],
    name: 'increaseObservationCardinalityNext',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxLiquidityPerTick',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1',
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
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'observations',
    outputs: [
      {
        internalType: 'uint32',
        name: 'blockTimestamp',
        type: 'uint32',
      },
      {
        internalType: 'int56',
        name: 'tickCumulative',
        type: 'int56',
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityCumulativeX128',
        type: 'uint160',
      },
      {
        internalType: 'bool',
        name: 'initialized',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32[]',
        name: 'secondsAgos',
        type: 'uint32[]',
      },
    ],
    name: 'observe',
    outputs: [
      {
        internalType: 'int56[]',
        name: 'tickCumulatives',
        type: 'int56[]',
      },
      {
        internalType: 'uint160[]',
        name: 'secondsPerLiquidityCumulativeX128s',
        type: 'uint160[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'positions',
    outputs: [
      {
        internalType: 'uint128',
        name: '_liquidity',
        type: 'uint128',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside0LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside1LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed0',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed1',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolFees',
    outputs: [
      {
        internalType: 'uint128',
        name: 'token0',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'token1',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'feeProtocol0',
        type: 'uint8',
      },
      {
        internalType: 'uint8',
        name: 'feeProtocol1',
        type: 'uint8',
      },
    ],
    name: 'setFeeProtocol',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
      {
        internalType: 'uint16',
        name: 'observationIndex',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationCardinality',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16',
      },
      {
        internalType: 'uint8',
        name: 'feeProtocol',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'unlocked',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
    ],
    name: 'snapshotCumulativesInside',
    outputs: [
      {
        internalType: 'int56',
        name: 'tickCumulativeInside',
        type: 'int56',
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityInsideX128',
        type: 'uint160',
      },
      {
        internalType: 'uint32',
        name: 'secondsInside',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'zeroForOne',
        type: 'bool',
      },
      {
        internalType: 'int256',
        name: 'amountSpecified',
        type: 'int256',
      },
      {
        internalType: 'uint160',
        name: 'sqrtPriceLimitX96',
        type: 'uint160',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'swap',
    outputs: [
      {
        internalType: 'int256',
        name: 'amount0',
        type: 'int256',
      },
      {
        internalType: 'int256',
        name: 'amount1',
        type: 'int256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int16',
        name: 'wordPosition',
        type: 'int16',
      },
    ],
    name: 'tickBitmap',
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
    name: 'tickSpacing',
    outputs: [
      {
        internalType: 'int24',
        name: '',
        type: 'int24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
    ],
    name: 'ticks',
    outputs: [
      {
        internalType: 'uint128',
        name: 'liquidityGross',
        type: 'uint128',
      },
      {
        internalType: 'int128',
        name: 'liquidityNet',
        type: 'int128',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthOutside0X128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthOutside1X128',
        type: 'uint256',
      },
      {
        internalType: 'int56',
        name: 'tickCumulativeOutside',
        type: 'int56',
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityOutsideX128',
        type: 'uint160',
      },
      {
        internalType: 'uint32',
        name: 'secondsOutside',
        type: 'uint32',
      },
      {
        internalType: 'bool',
        name: 'initialized',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
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
    name: 'token1',
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
];
export const IZUMI_POOL_ABI: any[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'sellXEarnY',
        type: 'bool',
      },
    ],
    name: 'AddLimitOrder',
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
        internalType: 'int24',
        name: 'leftPoint',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'rightPoint',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'Burn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'sellXEarnY',
        type: 'bool',
      },
    ],
    name: 'DecLimitOrder',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paidX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paidY',
        type: 'uint256',
      },
    ],
    name: 'Flash',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'leftPoint',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'rightPoint',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenX',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenY',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'sellXEarnY',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'liquidity',
    outputs: [
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        internalType: 'uint256',
        name: 'lastFeeScaleX_128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastFeeScaleY_128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokenOwedX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokenOwedY',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'userEarnX',
    outputs: [
      {
        internalType: 'uint256',
        name: 'lastAccEarn',
        type: 'uint256',
      },
      {
        internalType: 'uint128',
        name: 'sellingRemain',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'sellingDec',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'earn',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'earnAssign',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
    ],
    name: 'userEarnY',
    outputs: [
      {
        internalType: 'uint256',
        name: 'lastAccEarn',
        type: 'uint256',
      },
      {
        internalType: 'uint128',
        name: 'sellingRemain',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'sellingDec',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'earn',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'earnAssign',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'assignY',
        type: 'uint128',
      },
    ],
    name: 'assignLimOrderEarnY',
    outputs: [
      {
        internalType: 'uint128',
        name: 'actualAssignY',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'assignX',
        type: 'uint128',
      },
    ],
    name: 'assignLimOrderEarnX',
    outputs: [
      {
        internalType: 'uint128',
        name: 'actualAssignX',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'deltaX',
        type: 'uint128',
      },
    ],
    name: 'decLimOrderWithX',
    outputs: [
      {
        internalType: 'uint128',
        name: 'actualDeltaX',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'deltaY',
        type: 'uint128',
      },
    ],
    name: 'decLimOrderWithY',
    outputs: [
      {
        internalType: 'uint128',
        name: 'actualDeltaY',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'amountX',
        type: 'uint128',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'addLimOrderWithX',
    outputs: [
      {
        internalType: 'uint128',
        name: 'orderX',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'acquireY',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'amountY',
        type: 'uint128',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'addLimOrderWithY',
    outputs: [
      {
        internalType: 'uint128',
        name: 'orderY',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'acquireX',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'collectDec',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'collectEarn',
        type: 'uint128',
      },
      {
        internalType: 'bool',
        name: 'isEarnY',
        type: 'bool',
      },
    ],
    name: 'collectLimOrder',
    outputs: [
      {
        internalType: 'uint128',
        name: 'actualCollectDec',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'actualCollectEarn',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'leftPt',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'rightPt',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'liquidDelta',
        type: 'uint128',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'leftPt',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'rightPt',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'liquidDelta',
        type: 'uint128',
      },
    ],
    name: 'burn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'int24',
        name: 'leftPt',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'rightPt',
        type: 'int24',
      },
      {
        internalType: 'uint256',
        name: 'amountXLim',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountYLim',
        type: 'uint256',
      },
    ],
    name: 'collect',
    outputs: [
      {
        internalType: 'uint256',
        name: 'actualAmountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'actualAmountY',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        internalType: 'int24',
        name: 'highPt',
        type: 'int24',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'swapY2X',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint128',
        name: 'desireX',
        type: 'uint128',
      },
      {
        internalType: 'int24',
        name: 'highPt',
        type: 'int24',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'swapY2XDesireX',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        internalType: 'int24',
        name: 'lowPt',
        type: 'int24',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'swapX2Y',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint128',
        name: 'desireY',
        type: 'uint128',
      },
      {
        internalType: 'int24',
        name: 'lowPt',
        type: 'int24',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'swapX2YDesireY',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sqrtRate_96',
    outputs: [
      {
        internalType: 'uint160',
        name: '',
        type: 'uint160',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'state',
    outputs: [
      {
        internalType: 'uint160',
        name: 'sqrtPrice_96',
        type: 'uint160',
      },
      {
        internalType: 'int24',
        name: 'currentPoint',
        type: 'int24',
      },
      {
        internalType: 'uint16',
        name: 'observationCurrentIndex',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationQueueLen',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationNextQueueLen',
        type: 'uint16',
      },
      {
        internalType: 'bool',
        name: 'locked',
        type: 'bool',
      },
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'liquidityX',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
    ],
    name: 'limitOrderData',
    outputs: [
      {
        internalType: 'uint128',
        name: 'sellingX',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'earnY',
        type: 'uint128',
      },
      {
        internalType: 'uint256',
        name: 'accEarnY',
        type: 'uint256',
      },
      {
        internalType: 'uint128',
        name: 'sellingY',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'earnX',
        type: 'uint128',
      },
      {
        internalType: 'uint256',
        name: 'accEarnX',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
    ],
    name: 'orderOrEndpoint',
    outputs: [
      {
        internalType: 'int24',
        name: 'val',
        type: 'int24',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'observations',
    outputs: [
      {
        internalType: 'uint32',
        name: 'timestamp',
        type: 'uint32',
      },
      {
        internalType: 'int56',
        name: 'accPoint',
        type: 'int56',
      },
      {
        internalType: 'bool',
        name: 'init',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'point',
        type: 'int24',
      },
    ],
    name: 'points',
    outputs: [
      {
        internalType: 'uint128',
        name: 'liquidSum',
        type: 'uint128',
      },
      {
        internalType: 'int128',
        name: 'liquidDelta',
        type: 'int128',
      },
      {
        internalType: 'uint256',
        name: 'accFeeXOut_128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'accFeeYOut_128',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isEndpt',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int16',
        name: 'wordPosition',
        type: 'int16',
      },
    ],
    name: 'pointBitmap',
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
        internalType: 'uint32[]',
        name: 'secondsAgos',
        type: 'uint32[]',
      },
    ],
    name: 'observe',
    outputs: [
      {
        internalType: 'int56[]',
        name: 'accPoints',
        type: 'int56[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'newNextQueueLen',
        type: 'uint16',
      },
    ],
    name: 'expandObservationQueue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'flash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'leftPoint',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'rightPoint',
        type: 'int24',
      },
    ],
    name: 'liquiditySnapshot',
    outputs: [
      {
        internalType: 'int128[]',
        name: 'deltaLiquidities',
        type: 'int128[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'leftPoint',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'rightPoint',
        type: 'int24',
      },
    ],
    name: 'limitOrderSnapshot',
    outputs: [
      {
        components: [
          {
            internalType: 'uint128',
            name: 'sellingX',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'earnY',
            type: 'uint128',
          },
          {
            internalType: 'uint256',
            name: 'accEarnY',
            type: 'uint256',
          },
          {
            internalType: 'uint128',
            name: 'sellingY',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'earnX',
            type: 'uint128',
          },
          {
            internalType: 'uint256',
            name: 'accEarnX',
            type: 'uint256',
          },
        ],
        internalType: 'struct IiZiSwapPool.LimitOrderStruct[]',
        name: 'limitOrders',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalFeeXCharged',
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
    name: 'totalFeeYCharged',
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
    name: 'feeChargePercent',
    outputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fee',
    outputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'collectFeeCharged',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenX',
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
    name: 'tokenY',
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
    name: 'factory',
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
];
export const LINK_PROXY_ABI: any[] = [
  {
    inputs: [
      { internalType: 'address', name: '_aggregator', type: 'address' },
      {
        internalType: 'address',
        name: '_accessController',
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
        internalType: 'int256',
        name: 'current',
        type: 'int256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'roundId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'updatedAt',
        type: 'uint256',
      },
    ],
    name: 'AnswerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'roundId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'startedBy',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startedAt',
        type: 'uint256',
      },
    ],
    name: 'NewRound',
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
    ],
    name: 'OwnershipTransferRequested',
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
    outputs: [
      {
        internalType: 'contract AccessControllerInterface',
        name: '',
        type: 'address',
      },
    ],
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
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    name: 'phaseAggregators',
    outputs: [
      {
        internalType: 'contract AggregatorV2V3Interface',
        name: '',
        type: 'address',
      },
    ],
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
    outputs: [
      {
        internalType: 'contract AggregatorV2V3Interface',
        name: '',
        type: 'address',
      },
    ],
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
    inputs: [
      {
        internalType: 'address',
        name: '_accessController',
        type: 'address',
      },
    ],
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
export const UNI_FACTORY_V2_ABI: any[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'PairCreated',
    type: 'event',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'allPairs',
    outputs: [
      {
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'allPairsLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address',
      },
    ],
    name: 'createPair',
    outputs: [
      {
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'feeTo',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'feeToSetter',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address',
      },
    ],
    name: 'getPair',
    outputs: [
      {
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'setFeeTo',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'setFeeToSetter',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const UNI_FACTORY_V3_ABI: any[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24',
      },
    ],
    name: 'FeeAmountEnabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnerChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    name: 'PoolCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address',
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
    ],
    name: 'createPool',
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
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24',
      },
    ],
    name: 'enableFeeAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
    ],
    name: 'feeAmountTickSpacing',
    outputs: [
      {
        internalType: 'int24',
        name: '',
        type: 'int24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address',
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
    ],
    name: 'getPool',
    outputs: [
      {
        internalType: 'address',
        name: 'pool',
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
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'setOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
export const IZUMI_FACTORY_ABI: any[] = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_chargeReceiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_swapX2YModule',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_swapY2XModule',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_liquidityModule',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_limitOrderModule',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_flashModule',
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
        name: 'tokenX',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenY',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        indexed: false,
        internalType: 'uint24',
        name: 'pointDelta',
        type: 'uint24',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    name: 'NewPool',
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
    name: 'chargeReceiver',
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
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        internalType: 'uint24',
        name: 'pointDelta',
        type: 'uint24',
      },
    ],
    name: 'enableFeeAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    name: 'fee2pointDelta',
    outputs: [
      {
        internalType: 'int24',
        name: '',
        type: 'int24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'flashModule',
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
    name: 'limitOrderModule',
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
    name: 'liquidityModule',
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
        name: '_chargeReceiver',
        type: 'address',
      },
    ],
    name: 'modifyChargeReceiver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenX',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenY',
        type: 'address',
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        internalType: 'int24',
        name: 'currentPoint',
        type: 'int24',
      },
    ],
    name: 'newPool',
    outputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'only_addr_',
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
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    name: 'pool',
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
    name: 'swapX2YModule',
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
    name: 'swapY2XModule',
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
];
