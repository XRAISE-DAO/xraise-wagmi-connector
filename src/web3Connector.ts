import { SessionFacetABI } from './abis/SessionFacet';
import { defaultRaiseConnector } from './wagmiRaiseConnector';
import { BigNumber, ethers } from 'ethers';
import { zkSyncProvider } from './utils';
import { RaiseSubsidizingPaymaster } from './WalletPaymasters';
import { parseUnits } from 'ethers/lib/utils.js';
import { ZKSYNC_GAS_PRICE } from './constants/index';

enum SessionPeriod {
  FiveMinutes = 0,
  OneHour = 1,
  OneDay = 2,
  OneWeek = 3,
  OneMonth = 4,
  HalfAYear = 5,
  Year = 6,
  Forever = 7,
}

const target = {
  on: (...args: any) => {
    console.log('On called with args', args);
    return null;
  },
  enable: () => {
    return new Promise((resolve) => {
      console.log('Enable called');

      defaultRaiseConnector.getAccount().then((address: string) => {
        console.log('Got address', address);
        resolve([address]);
      });
    });
  },
  sendAsync: (args: any, cb: any) => {
    console.log('Send async args', args, cb);
    //return ["0x2836eC28C32E232280F984d3980BA4e05d6BF68f"];
    if (args['method'] == 'eth_getTransactionReceipt') {
      console.log('Receipt');

      const providerRequest = zkSyncProvider
        .send(args['method'], args['params'])
        .then((resp) => {
          console.log('providerRequest', args['method'], resp);
          cb(null, {
            id: args.id,
            jsonrpc: '2.0',
            result: resp,
          });
        });
    } else if (args['method'] == 'eth_sendTransaction') {
      console.log('Sending transaction', args, args.params[0]);
      const tx = args.params[0];
      tx.chainId = 280;
      tx.value = BigNumber.from(tx.value || '0');
      zkSyncProvider.getTransactionCount(tx.from).then((nonce) => {
        tx.nonce = nonce;
        const signature = defaultRaiseConnector
          .getSigner()
          .then((signer: any) =>
            signer
              .signTransaction(tx)
              .then((e: string) => {
                console.log('Signature', e);
                zkSyncProvider
                  .send('eth_sendRawTransaction', [e])
                  .then((resp) => {
                    console.log('Transaction response', resp, cb);

                    cb(null, {
                      id: args.id,
                      jsonrpc: '2.0',
                      result: resp,
                    });
                  });
              })
              .catch((signError: any) => {
                console.log('Sign error', signError);
                cb(signError, {});
              }),
          );
      });
    } else if (args['method'] == 'eth_accounts') {
      defaultRaiseConnector.getAccount().then((address: string) => {
        cb(null, {
          id: args.id,
          jsonrpc: '2.0',
          result: [address],
        });
      });
    } else if (args['method'] == 'eth_subscribe') {
      console.log('Eth subscribe called', args);
    } else if (args['method'] == 'wallet_createSession') {
      console.log('Wallet create session called', args);
      defaultRaiseConnector
        .createSession({
          allowedAddresses: args['params'].allowedContracts,
        })
        .then((sessionPubKey: string) => {
          defaultRaiseConnector.getAccount().then((userAddress: string) => {
            const contract = new ethers.Contract(userAddress, SessionFacetABI);
            console.log('User contract', contract);
            contract.populateTransaction
              .createSession(
                sessionPubKey,
                args['params'].allowedContracts,
                parseUnits('2.0', 18),
                SessionPeriod.OneMonth,
              )
              .then((tx) => {
                console.log('Tx data', tx);

                tx.chainId = 280;
                tx.value = BigNumber.from(tx.value || '0');
                tx.data = tx.data || '0x';
                tx.from = tx.to;
                tx.maxFeePerGas = BigNumber.from(ZKSYNC_GAS_PRICE); // Default gas price for zkSync
                tx.customData = { paymasterId: 'raise' };
                zkSyncProvider.getTransactionCount(tx.from!).then((nonce) => {
                  tx.nonce = nonce;
                  defaultRaiseConnector.getSigner().then((signer: any) => {
                    signer.signTransaction(tx).then((e: string) => {
                      console.log('Signature', e);
                      zkSyncProvider
                        .send('eth_sendRawTransaction', [e])
                        .then((resp) => {
                          console.log('Transaction response', resp, cb);

                          defaultRaiseConnector
                            .approveSession(sessionPubKey)
                            .then(() => {
                              cb(null, {
                                id: args.id,
                                jsonrpc: '2.0',
                                result: resp,
                              });
                            });
                        });
                    });
                  });
                });
              });

            cb(null, {
              id: args.id,
              jsonrpc: '2.0',
              result: userAddress,
            });
          });
        });
    } else {
      zkSyncProvider.send(args['method'], args['params']).then((resp) => {
        console.log('providerRequest', args['method'], resp);
        cb(null, {
          id: args.id,
          jsonrpc: '2.0',
          result: resp,
        });
      });
    }
  },
} as any;

let _web3: any | null = null;

_web3 = new Proxy(target, {
  get(target, p) {
    if (p == 'on') {
      console.log('On called');
      return null;
    } else if (p == 'currentProvider') {
      console.log('Current provider request');
      return _web3;
    } else if (p in target) {
      console.log('Handled request:', p);
      return function (...args: any[]) {
        console.log('Executing request: ', p, 'with data:', args);
        const result = target[p](...args);
        console.log('Returning', result);
        return result;
        //return req;
      };
    } else {
      console.log('Unknown request:', p, target);

      return function (req: any) {
        console.log('Called', p, 'with data:', req);
      };
    }
  },
  deleteProperty(target, pos) {
    console.log('Attempt to delete property', pos);
    return true;
  },
});

export const web3 = _web3;
