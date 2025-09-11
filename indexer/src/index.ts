import { connectDB } from "./config/db.js";
import { LoadInteresetdAddresses } from "./services/addresses.js";
import { startBlockListener } from "./config/block.js";
import { connectRedis } from "./config/redis.js";

async function main() {
    // Connect to Db
  await connectDB();
  await connectRedis();

  // Load interested Addresses from db : 
  const addresses = await LoadInteresetdAddresses();
  console.log("Interested Addresses from db", addresses);

  // start the indexer :
  await startBlockListener(addresses);

  // Start the indexer  
  console.log("Indexer has started and listening to new blocks..");
}

main();

{/*
    1. connectDB

Establish MongoDB connection using Mongoose.

Should be called once at startup.

2. loadInterestedAddresses

Fetch all DepositAddress from MongoDB.

Cache them (maybe Redis or in-memory).

Return as an array for filtering transactions.

3. getLastProcessedBlock

Reads the last processed block number from Redis (or DB).

If not found, start from latest block (or a configured checkpoint).

4. saveLastProcessedBlock

After processing a block, store the block number in Redis (or DB) so indexing resumes correctly after restart.

5. processBlock

Given a block number:

Fetch block + transactions.

Filter for transactions involving interested addresses.

For each relevant tx → call balance check & DB update.

6. checkBalanceAndUpdate

Given userId + address:

Fetch on-chain balance via provider.

Compare with DB balance (findDiff).

If different → update DB + push event (Redis / log).

7. startBlockListener

Subscribes to provider.on("block").

For every new block:

Get last processed block.

Process blocks sequentially (in case one was missed).

Save checkpoint after each block.

8. main

Entry point that:

Loads env/config.

Connects DB.

Loads addresses.

Gets last processed block.

Starts block listener loop.

⚡ Final Function Flow

index.ts should look like this (function flow only, no code yet):

connectDB()

loadInterestedAddresses()

getLastProcessedBlock()

startBlockListener() → inside it:

processBlock(blockNo) → inside it:

checkBalanceAndUpdate(userId, address)
    
    */}