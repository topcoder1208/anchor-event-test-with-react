import React, { useState, useMemo } from 'react';
import {
  PublicKey,
  clusterApiUrl
} from '@solana/web3.js';
import './App.css';
import idl from './assets/idl.json'

import * as anchor from "@project-serum/anchor";
import {
  useWallet,
  WalletProvider,
  useConnection,
  ConnectionProvider
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
  getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

const programID = new PublicKey(idl.metadata.address);

const opts = {
  preflightCommitment: "processed"
}
function App() {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
  // Only the wallets you configure here will be compiled into your application
  const wallets = useMemo(() => [
    getPhantomWallet(),
    getSlopeWallet(),
    getSolflareWallet(),
    getTorusWallet({
      options: { clientId: 'Get a client ID @ https://developer.tor.us' }
    }),
    getLedgerWallet(),
    getSolletWallet({ network }),
    getSolletExtensionWallet({ network }),
  ], [network]);

  const [listener, setListener] = useState(null);
  const [listener2, setListener2] = useState(null);
  const [eventData, setEventData] = useState('')
  const [eventLavel, setEventLavel] = useState('')

  const { connection } = useConnection();

  const wallet = useWallet();
  const { publicKey } = useWallet();

  async function getProvider() {
    const provider = new anchor.Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  const initialize = async () => {
    if (!connection) {
      alert("please connect to wallet");
      return;
    }
    let provider = await getProvider();
    let program = new anchor.Program(idl, programID, provider);

    let [event] = await new Promise((resolve, _reject) => {
      const _listener = program.addEventListener("MyEvent", (event, slot) => {
        resolve([event, slot]);
      });
      program.rpc.initialize();

      setEventData(event.data.toNumber())
      setEventLavel(event.label)
      setListener(_listener)
    });
  }

  const addEvent = async () => {
    if (!connection) {
      alert("please connect to wallet");
      return;
    }
    let provider = await getProvider();
    let program = new anchor.Program(idl, programID, provider);

    let [event] = await new Promise((resolve, _reject) => {
      const _listenerTwo = program.addEventListener("MyOtherEvent", (event, slot) => {
        resolve([event, slot]);
      });
      program.rpc.testEvent();

      setEventData(event.data.toNumber())
      setEventLavel(event.label)
      setListener2(_listenerTwo)
    });
  }

  const getData = () => {
    if (!connection) {
      alert("please connect to wallet");
      return;
    }
    if (eventData !== '' && eventLavel !== '') {
      alert('Event Data :>> ' + eventData + '   ' + 'Event EventLavel :>> ' + eventLavel);
    }
  }
  const removeEvent = async () => {
    if (!connection) {
      alert("please connect to wallet");
      return;
    }
    let provider = await getProvider();
    let program = new anchor.Program(idl, programID, provider);
    await program.removeEventListener(listener);
  }



  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <div className="App">
          <header className="App-header">
            <div>
              <WalletModalProvider>
                <WalletMultiButton />
              </WalletModalProvider>
              <button className="button-29" onClick={() => { initialize() }} > Initialize</button>
              <button className="button-29" onClick={() => { addEvent() }} > Add Event</button>
              <button className="button-29" onClick={() => { getData() }}>Get Data</button>
              <button className="button-29" onClick={() => { removeEvent() }}>Remove Event</button>
            </div>
          </header>
        </div>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
