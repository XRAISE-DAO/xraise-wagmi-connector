export const SocialRecoveryFacetABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "by",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "RecoveryCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "credentialId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "publicKeyX",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "publicKeyY",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "publicAddress",
            "type": "address"
          },
          {
            "internalType": "int32",
            "name": "algoId",
            "type": "int32"
          },
          {
            "internalType": "uint32",
            "name": "deviceId",
            "type": "uint32"
          }
        ],
        "indexed": false,
        "internalType": "struct LoginInfo",
        "name": "newLoginInfo",
        "type": "tuple"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "RecoveryExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "credentialId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "publicKeyX",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "publicKeyY",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "publicAddress",
            "type": "address"
          },
          {
            "internalType": "int32",
            "name": "algoId",
            "type": "int32"
          },
          {
            "internalType": "uint32",
            "name": "deviceId",
            "type": "uint32"
          }
        ],
        "indexed": false,
        "internalType": "struct LoginInfo",
        "name": "newProposedLoginInfo",
        "type": "tuple"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes4",
        "name": "recoveryCode",
        "type": "bytes4"
      }
    ],
    "name": "RecoveryInit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "by",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes4",
        "name": "recoveryCode",
        "type": "bytes4"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "RecoverySupported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "guardianAddress",
        "type": "address"
      }
    ],
    "name": "SocialGuardianAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "guardianAddress",
        "type": "address"
      }
    ],
    "name": "SocialGuardianRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guardianAddressHash",
        "type": "bytes32"
      }
    ],
    "name": "UserGuardianAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guardianAddressHash",
        "type": "bytes32"
      }
    ],
    "name": "UserGuardianRemoved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "guardianHash",
        "type": "bytes32"
      }
    ],
    "name": "addUserGuardian",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executeRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGuardians",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "credentialId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "publicKeyX",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "publicKeyY",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "publicAddress",
            "type": "address"
          },
          {
            "internalType": "int32",
            "name": "algoId",
            "type": "int32"
          },
          {
            "internalType": "uint32",
            "name": "deviceId",
            "type": "uint32"
          }
        ],
        "internalType": "struct LoginInfo",
        "name": "proposedLoginInfo",
        "type": "tuple"
      },
      {
        "internalType": "address[]",
        "name": "guardianAddresses",
        "type": "address[]"
      },
      {
        "internalType": "bytes[]",
        "name": "guardianSignatures",
        "type": "bytes[]"
      },
      {
        "internalType": "uint256[]",
        "name": "signaturesExpiredAt",
        "type": "uint256[]"
      }
    ],
    "name": "initRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "code",
        "type": "bytes4"
      }
    ],
    "name": "recoverySupports",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "recoveryThreshold",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "guardianHash",
        "type": "bytes32"
      }
    ],
    "name": "removeUserGuardian",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "recoveryCode",
        "type": "bytes4"
      }
    ],
    "name": "supportRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];