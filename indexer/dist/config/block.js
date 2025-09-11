import { JsonRpcProvider, TransactionResponse } from "ethers";
import { getLastProcessedblock, setLastProcessedBlock } from "../services/bloclService.js";
import { check_balance_update_db } from "../services/Updatedb.js";
const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
// get the txn details addresses and values being traded on the interested addresses
export const processBlock = async (blockNumber, addresses) => {
    try {
        const block = await provider.getBlock(blockNumber, true); // only hashes
        if (!block || !block.transactions)
            return;
        const updatedUsers = new Map(); // data structure, for storing key value pairs ?
        for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash);
            if (!tx)
                continue;
            // console.log(tx.hash);
            const from = tx.from?.toLowerCase() ?? "";
            const to = tx.to?.toLowerCase() ?? "";
            if (addresses.includes(from) || addresses.includes(to)) {
                console.log(`Relevant tx in block ${blockNumber}: ${tx.hash}, from ${from}, to ${to}, value: ${tx.value.toString()}`);
                let updated_balance;
                // step 6: checkBalanceAndUpdate(address)
                for (const address of [from, to]) {
                    if (addresses.includes(address)) {
                        updated_balance = await check_balance_update_db(address);
                        updatedUsers.set(address, updated_balance);
                    }
                }
                console.log("Users up to data with the current block txns");
            }
        }
        return Array.from(updatedUsers, ([address, updated_balance]) => ({ address, updated_balance }));
    }
    catch (error) {
        console.error(error, `Error processing block no: ${blockNumber}`);
    }
};
export const startBlockListener = async (addresses) => {
    try {
        let latestBlock = await getLastProcessedblock();
        if (latestBlock === null) {
            await setLastProcessedBlock(await provider.getBlockNumber());
            latestBlock = await getLastProcessedblock();
            console.log("Latest block updated to", latestBlock);
        }
        provider.on("block", async (blockNumber) => {
            if (latestBlock !== null) {
                if (blockNumber <= latestBlock)
                    return;
                for (let b = latestBlock + 1; b <= blockNumber; b++) {
                    await processBlock(b, addresses);
                    await setLastProcessedBlock(b);
                    console.log("Saved checkpoint..");
                }
                latestBlock = blockNumber;
                console.log("Latest block updated to", latestBlock);
            }
        });
    }
    catch (error) {
        console.error(error);
    }
};
//# sourceMappingURL=block.js.map