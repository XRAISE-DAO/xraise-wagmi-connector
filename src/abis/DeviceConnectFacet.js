export const DEVICE_CONNECT_FACET_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes4',
        name: 'connectionCode',
        type: 'bytes4',
      },
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
        indexed: false,
        internalType: 'struct LoginInfo',
        name: 'proposedLoginInfo',
        type: 'tuple',
      },
    ],
    name: 'DeviceConnectionConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes4',
        name: 'connectionCode',
        type: 'bytes4',
      },
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
        indexed: false,
        internalType: 'struct LoginInfo',
        name: 'proposedLoginInfo',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'guardiansApproved',
        type: 'address[]',
      },
    ],
    name: 'DeviceConnectionRequested',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'connectionCode',
        type: 'bytes4',
      },
    ],
    name: 'confirmDeviceConnection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
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
        name: 'proposedLoginInfo',
        type: 'tuple',
      },
      {
        internalType: 'address[]',
        name: 'guardianAddresses',
        type: 'address[]',
      },
      {
        internalType: 'bytes[]',
        name: 'guardianSignatures',
        type: 'bytes[]',
      },
      {
        internalType: 'uint256[]',
        name: 'signaturesExpiredAt',
        type: 'uint256[]',
      },
    ],
    name: 'connectDevice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
