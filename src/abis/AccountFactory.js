export const AccountFactory = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_aaBytecodeHash",
        "type": "bytes32"
      },
      {
        "internalType": "address[]",
        "name": "allowedGuardians_",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "diamondCutFacet_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "diamondInit_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "updater_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "notifier_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AccountCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "guardian",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isAllowed",
        "type": "bool"
      }
    ],
    "name": "GuardianStatusSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "aaBytecodeHash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allowedGuardians",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "currentEmailHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "newEmailHash",
        "type": "bytes32"
      }
    ],
    "name": "changeEmailHash",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "loginInfo_",
        "type": "tuple"
      },
      {
        "internalType": "bytes32",
        "name": "emailHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "emailGuardian",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "signatureExpiresAt",
        "type": "uint256"
      }
    ],
    "name": "deployAccount",
    "outputs": [
      {
        "internalType": "address",
        "name": "accountAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "diamondCutFacet",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "diamondInit",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "emailHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint32",
        "name": "deviceId",
        "type": "uint32"
      }
    ],
    "name": "getUserWalletInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "walletAddress",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "credentialId",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "inRecovery",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isDeployedByFactory",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "guardians",
        "type": "address[]"
      },
      {
        "internalType": "bool",
        "name": "isAllowed",
        "type": "bool"
      }
    ],
    "name": "manageAllowedGuardians",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "notifier",
    "outputs": [
      {
        "internalType": "contract Notifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newNotifier",
        "type": "address"
      }
    ],
    "name": "setNotifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "updater",
    "outputs": [
      {
        "internalType": "contract AccountUpdater",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "walletAddresses",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];