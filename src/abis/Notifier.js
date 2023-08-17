export const NotifierABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "NOTIFICATION_TYPE_FRIEND_ASKED_FOR_RECOVERY",
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
    "inputs": [],
    "name": "NOTIFICATION_TYPE_YOU_ADDED_AS_A_GUARDIAN",
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
        "internalType": "bytes32",
        "name": "addressHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "offset",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getNotifications",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "date",
            "type": "uint64"
          },
          {
            "internalType": "bytes32",
            "name": "notificationType",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Notifier.Notification[]",
        "name": "notificationsRequested",
        "type": "tuple[]"
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "notifications",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "date",
        "type": "uint64"
      },
      {
        "internalType": "bytes32",
        "name": "notificationType",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "to",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "date",
            "type": "uint64"
          },
          {
            "internalType": "bytes32",
            "name": "notificationType",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Notifier.Notification",
        "name": "notification",
        "type": "tuple"
      }
    ],
    "name": "pushNotification",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];