export const AccountFacetABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sessionPubKey',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'addressesToCallList',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'totalGasLimit',
        type: 'uint256',
      },
      {
        internalType: 'enum SessionFacet.SessionPeriod',
        name: 'period',
        type: 'uint8',
      },
    ],
    name: 'createSession',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
    ],
    name: 'deleteSession',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'devices',
    outputs: [
      {
        internalType: 'uint32[]',
        name: '',
        type: 'uint32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'txType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'from',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'to',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'paymaster',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256[4]',
            name: 'reserved',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'bytes32[]',
            name: 'factoryDeps',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'paymasterInput',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'reservedDynamic',
            type: 'bytes',
          },
        ],
        internalType: 'struct Transaction',
        name: '_transaction',
        type: 'tuple',
      },
    ],
    name: 'executeTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'txType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'from',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'to',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'paymaster',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256[4]',
            name: 'reserved',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'bytes32[]',
            name: 'factoryDeps',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'paymasterInput',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'reservedDynamic',
            type: 'bytes',
          },
        ],
        internalType: 'struct Transaction',
        name: '_transaction',
        type: 'tuple',
      },
    ],
    name: 'executeTransactionFromOutside',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSessionInfos',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sessionPubKey',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'addressesToCallList',
            type: 'address[]',
          },
          {
            internalType: 'uint256',
            name: 'gasLeft',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'expiredAt',
            type: 'uint64',
          },
          {
            internalType: 'bool',
            name: 'deleted',
            type: 'bool',
          },
        ],
        internalType: 'struct SessionFacet.SessionInfo[]',
        name: 'sessionInfos',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'txHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'isValidSignature',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
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
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
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
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC1155Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'txType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'from',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'to',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'paymaster',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256[4]',
            name: 'reserved',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'bytes32[]',
            name: 'factoryDeps',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'paymasterInput',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'reservedDynamic',
            type: 'bytes',
          },
        ],
        internalType: 'struct Transaction',
        name: '_transaction',
        type: 'tuple',
      },
    ],
    name: 'payForTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'deviceId',
        type: 'uint32',
      },
    ],
    name: 'platformLogins',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'credentialId',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'credentialIdSlot2',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'publicKeyX',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'publicKeyY',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'publicAddress',
            type: 'address',
          },
          {
            internalType: 'int32',
            name: 'algoId',
            type: 'int32',
          },
          {
            internalType: 'uint32',
            name: 'deviceId',
            type: 'uint32',
          },
          {
            internalType: 'bytes4',
            name: 'credentialIdCarry',
            type: 'bytes4',
          },
        ],
        internalType: 'struct LoginInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'txType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'from',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'to',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'paymaster',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256[4]',
            name: 'reserved',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'bytes32[]',
            name: 'factoryDeps',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'paymasterInput',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'reservedDynamic',
            type: 'bytes',
          },
        ],
        internalType: 'struct Transaction',
        name: '_transaction',
        type: 'tuple',
      },
    ],
    name: 'prepareForPaymaster',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_txHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_suggestedSignedHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'txType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'from',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'to',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'paymaster',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256[4]',
            name: 'reserved',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'bytes32[]',
            name: 'factoryDeps',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'paymasterInput',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'reservedDynamic',
            type: 'bytes',
          },
        ],
        internalType: 'struct Transaction',
        name: '_transaction',
        type: 'tuple',
      },
    ],
    name: 'validateTransaction',
    outputs: [
      {
        internalType: 'bytes4',
        name: 'magic',
        type: 'bytes4',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
