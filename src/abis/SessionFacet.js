export const SessionFacetABI = [
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
          "internalType": "enum SessionFacet.SessionPeriod",
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
          "internalType": "struct SessionFacet.SessionInfo[]",
          "name": "sessionInfos",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  