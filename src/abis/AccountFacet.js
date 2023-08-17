export const AccountFacetABI = [
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
            "internalType": "int256",
            "name": "algoId",
            "type": "int256"
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
        "internalType": "address",
        "name": "guardian",
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
        "indexed": true,
        "internalType": "bytes32",
        "name": "oldGuardianHash",
        "type": "bytes32"
      }
    ],
    "name": "GuardianAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guardianHash",
        "type": "bytes32"
      }
    ],
    "name": "GuardianAdditionQueued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guardianHash",
        "type": "bytes32"
      }
    ],
    "name": "GuardianRemovalQueued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "oldGuardianHash",
        "type": "bytes32"
      }
    ],
    "name": "GuardianRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guardianHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "guardianAddr",
        "type": "address"
      }
    ],
    "name": "GuardianRevealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newGuardianHash",
        "type": "bytes32"
      }
    ],
    "name": "GuardinshipTransferred",
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
        "indexed": false,
        "internalType": "address",
        "name": "oldOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
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
        "indexed": false,
        "internalType": "address",
        "name": "newProposedOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
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
        "internalType": "address",
        "name": "newProposedOwner",
        "type": "address"
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
        "indexed": false,
        "internalType": "uint256",
        "name": "guardianCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_threshold",
        "type": "uint256"
      }
    ],
    "name": "SetupCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "subscriptionId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isDeleted",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "enum Subscription.SubscriptionPeriod",
            "name": "period",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "nextChargeTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Subscription.SubscriptionInfo",
        "name": "subscriptionInfo",
        "type": "tuple"
      }
    ],
    "name": "SubsctiptionAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "subscriptionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isDeleted",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "SubsctiptionStatusSet",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_SUBSCRIPTIONS_PER_USER",
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
        "components": [
          {
            "internalType": "bytes32",
            "name": "credentialId",
            "type": "bytes32"
          },
          {
            "internalType": "int256",
            "name": "algoId",
            "type": "int256"
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
            "internalType": "uint32",
            "name": "deviceId",
            "type": "uint32"
          }
        ],
        "internalType": "struct LoginInfo",
        "name": "loginInfo_",
        "type": "tuple"
      }
    ],
    "name": "addSharedLoginInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "enum Subscription.SubscriptionPeriod",
        "name": "period",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "addSubscription",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "subscriptionId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "addressesToCall",
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
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Batch.Call[]",
        "name": "calls",
        "type": "tuple[]"
      }
    ],
    "name": "batch",
    "outputs": [
      {
        "internalType": "bytes[]",
        "name": "",
        "type": "bytes[]"
      }
    ],
    "stateMutability": "nonpayable",
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
    "name": "cancelGuardianAddition",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "cancelGuardianRemoval",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "sessionPubKey",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "addressesToCallList",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "totalGasLimit",
        "type": "uint256"
      },
      {
        "internalType": "enum Session.SessionPeriod",
        "name": "period",
        "type": "uint8"
      }
    ],
    "name": "createSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currRecoveryRound",
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
        "internalType": "address",
        "name": "signer",
        "type": "address"
      }
    ],
    "name": "deleteSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emailGuardian",
    "outputs": [
      {
        "internalType": "contract EmailGuardian",
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
        "name": "newGuardianHash",
        "type": "bytes32"
      }
    ],
    "name": "executeGuardianAddition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "oldGuardianHash",
        "type": "bytes32"
      }
    ],
    "name": "executeGuardianRemoval",
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
      },
      {
        "internalType": "address[]",
        "name": "guardianList",
        "type": "address[]"
      }
    ],
    "name": "executeRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "_transaction",
        "type": "tuple"
      }
    ],
    "name": "executeTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "_transaction",
        "type": "tuple"
      }
    ],
    "name": "executeTransactionFromOutside",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSessionInfos",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sessionPubKey",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "addressesToCallList",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "gasLeft",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "expiredAt",
            "type": "uint64"
          },
          {
            "internalType": "bool",
            "name": "deleted",
            "type": "bool"
          }
        ],
        "internalType": "struct Session.SessionInfo[]",
        "name": "sessionInfos",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSubscriptions",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isDeleted",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "enum Subscription.SubscriptionPeriod",
            "name": "period",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "nextChargeTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct Subscription.SubscriptionInfo[]",
        "name": "subscriptionInfos",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "guardianCount",
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
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "guardianHashToAdditionTimestamp",
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
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "guardianHashToRemovalTimestamp",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "guardianToRecovery",
    "outputs": [
      {
        "internalType": "address",
        "name": "proposedOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "recoveryRound",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "usedInExecuteRecovery",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "inRecovery",
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
        "internalType": "address",
        "name": "_proposedOwner",
        "type": "address"
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
        "internalType": "bytes32",
        "name": "guardianHash",
        "type": "bytes32"
      }
    ],
    "name": "initiateGuardianAddition",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "initiateGuardianRemoval",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "isGuardian",
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
    "inputs": [],
    "name": "isSetupComplete",
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
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "isValidSession",
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
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "isValidSignature",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextSubscriptionId",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "_transaction",
        "type": "tuple"
      }
    ],
    "name": "payForTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "_transaction",
        "type": "tuple"
      }
    ],
    "name": "prepareForPaymaster",
    "outputs": [],
    "stateMutability": "payable",
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
    "name": "raiseauthnLogins",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "credentialId",
        "type": "bytes32"
      },
      {
        "internalType": "int256",
        "name": "algoId",
        "type": "int256"
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
        "internalType": "uint32",
        "name": "deviceId",
        "type": "uint32"
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
    "inputs": [],
    "name": "revealGuardianIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum Session.SessionPeriod",
        "name": "period",
        "type": "uint8"
      }
    ],
    "name": "sessionPeriodToSeconds",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "sessionPubKeys",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "sessions",
    "outputs": [
      {
        "internalType": "address",
        "name": "sessionPubKey",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "gasLeft",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "expiredAt",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "deleted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "subscriptionId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isDeleted",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "setSubscriptionStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "guardianAddrHashes",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256",
        "name": "_threshold",
        "type": "uint256"
      }
    ],
    "name": "setup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "subscriptionIds",
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
        "internalType": "enum Subscription.SubscriptionPeriod",
        "name": "period",
        "type": "uint8"
      }
    ],
    "name": "subscriptionPeriodToTime",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "subscriptions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isDeleted",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "enum Subscription.SubscriptionPeriod",
        "name": "period",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "nextChargeTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_proposedOwner",
        "type": "address"
      }
    ],
    "name": "supportRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
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
    "inputs": [],
    "name": "threshold",
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
        "name": "newGuardianHash",
        "type": "bytes32"
      }
    ],
    "name": "transferGuardianship",
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_txHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_suggestedSignedHash",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "_transaction",
        "type": "tuple"
      }
    ],
    "name": "validateTransaction",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "magic",
        "type": "bytes4"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "name": "webauthnLogins",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "credentialId",
        "type": "bytes32"
      },
      {
        "internalType": "int256",
        "name": "algoId",
        "type": "int256"
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
        "internalType": "uint32",
        "name": "deviceId",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawSubscriptions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];