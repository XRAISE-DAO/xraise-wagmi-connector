export const UpdaterABI = [
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        },
        {
          "internalType": "string",
          "name": "releaseNotes",
          "type": "string"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "facetName",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "facetBytecodeHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "facetAddress",
              "type": "address"
            },
            {
              "internalType": "bytes4[]",
              "name": "functionSelectors",
              "type": "bytes4[]"
            }
          ],
          "internalType": "struct AccountUpdater.UpdateFacetInfo[]",
          "name": "updateFacetInfos",
          "type": "tuple[]"
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
      "inputs": [
        {
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        },
        {
          "internalType": "string",
          "name": "releaseNotes",
          "type": "string"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "facetName",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "facetBytecodeHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "facetAddress",
              "type": "address"
            },
            {
              "internalType": "bytes4[]",
              "name": "functionSelectors",
              "type": "bytes4[]"
            }
          ],
          "internalType": "struct AccountUpdater.UpdateFacetInfo[]",
          "name": "updateFacetInfos",
          "type": "tuple[]"
        }
      ],
      "name": "addUpdate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lastUpdate",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint64",
              "name": "version",
              "type": "uint64"
            },
            {
              "internalType": "string",
              "name": "releaseNotes",
              "type": "string"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "facetName",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "facetBytecodeHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "facetAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes4[]",
                  "name": "functionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "internalType": "struct AccountUpdater.UpdateFacetInfo[]",
              "name": "updateFacetInfos",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct AccountUpdater.Update",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "updatesNum",
          "type": "uint256"
        }
      ],
      "name": "lastUpdates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint64",
              "name": "version",
              "type": "uint64"
            },
            {
              "internalType": "string",
              "name": "releaseNotes",
              "type": "string"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "facetName",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "facetBytecodeHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "facetAddress",
                  "type": "address"
                },
                {
                  "internalType": "bytes4[]",
                  "name": "functionSelectors",
                  "type": "bytes4[]"
                }
              ],
              "internalType": "struct AccountUpdater.UpdateFacetInfo[]",
              "name": "updateFacetInfos",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct AccountUpdater.Update[]",
          "name": "updatesToFetch",
          "type": "tuple[]"
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
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "name": "updates",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        },
        {
          "internalType": "string",
          "name": "releaseNotes",
          "type": "string"
        }
      ],
      "stateMutability": "view",
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
      "name": "versions",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];  