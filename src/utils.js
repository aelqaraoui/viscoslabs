import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import getConfig from "./config";

import { Buffer } from 'buffer';
global.Buffer = Buffer;

const nearConfig = getConfig("testnet");

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  console.log(nearConfig.contractName);

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "is_contract_verified",
        "get_loan_ids",
        "get_payback_amount",
        "get_verified_contracts",
        "get_loan",
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        "add_contract",
        "accept_loan",
        "payback_loan",
        "claim_collateral",
        "edit_loan",
        "remove_loan",
      ],
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}
