import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { AnchorEventTest } from '../target/types/anchor_event_test';

describe('anchor-event-test', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.AnchorEventTest as Program<AnchorEventTest>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
