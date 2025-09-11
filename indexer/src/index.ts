import { connectDB } from "./config/db.js";
import { LoadInteresetdAddresses } from "./services/addresses.js";
import { startBlockListener } from "./config/block.js";
import { connectRedis } from "./config/redis.js";

async function main() {
  await connectDB();
  await connectRedis();

  const addresses = await LoadInteresetdAddresses();
  console.log("Interested Addresses from db", addresses);

  await startBlockListener(addresses);
  console.log("Indexer has started and listening to new blocks..");
}

main();