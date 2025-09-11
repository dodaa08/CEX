import { redisClient } from "../config/redis.js";
import { JsonRpcProvider } from "ethers";
import userModel from "../db/schema.js";
const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
export const check_balance_update_db = async (address) => {
    try {
        let cached_balance = await redisClient.get(`balance${address}`);
        if (!cached_balance) {
            const balance = await provider.getBalance(address);
            cached_balance = balance.toString();
            await redisClient.set(`balance${address}`, cached_balance);
        }
        await userModel.updateOne({ address }, { $set: { balance: cached_balance } }, //
        { upsert: true } // insert it to the end
        );
        return cached_balance;
    }
    catch (error) {
        console.error(error);
    }
};
//# sourceMappingURL=Updatedb.js.map