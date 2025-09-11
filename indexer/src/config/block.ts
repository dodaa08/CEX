import { JsonRpcProvider } from "ethers";
import type { TransactionResponse } from "ethers";
import { getLastProcessedblock, setLastProcessedBlock } from "../services/bloclService.js";
import { check_balance_update_db } from "../services/Updatedb.js";

const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);

export const processBlock = async (blockNumber: number, addresses: string[]) => {
  try {
    const block = await provider.getBlock(blockNumber, true);
    if (!block || !block.transactions) return;

    for (const tx of block.transactions as unknown as TransactionResponse[]) {
      if (!tx) continue;

      const from = tx.from?.toLowerCase() ?? "";
      const to = tx.to?.toLowerCase() ?? "";

      if (addresses.includes(from) || addresses.includes(to)) {
        console.log(
          `Relevant tx in block ${blockNumber}: ${tx.hash}, from ${from}, to ${to}, value: ${tx.value.toString()}`
        );

        for (const address of [from, to]) {
          if (addresses.includes(address)) {
            await check_balance_update_db(address);
          }
        }
      }
    }
  } catch (error) {
    console.error(error, `Error processing block no: ${blockNumber}`);
  }
};


export const startBlockListener = async (addresses: string[]) => {
  try {
    let latestBlock = await getLastProcessedblock();

    if (latestBlock === null) {
      await setLastProcessedBlock(await provider.getBlockNumber());
      latestBlock = await getLastProcessedblock();
      console.log("Latest block updated to", latestBlock);
    }

    provider.on("block", async (blockNumber) => {
      if (latestBlock !== null) {
        if (blockNumber <= latestBlock) return;
        
        const blocksBehind = blockNumber - latestBlock;
        console.log(`Processing ${blocksBehind} blocks behind (${latestBlock + 1} → ${blockNumber})`);
        
        for (let b = latestBlock + 1; b <= blockNumber; b++) {
          await processBlock(b, addresses);
          await setLastProcessedBlock(b);
          console.log(`Saved checkpoint for block ${b}`);
        }
        
        latestBlock = blockNumber;
      }
    });
  } catch (error) {
    console.error(error);
  }
};

