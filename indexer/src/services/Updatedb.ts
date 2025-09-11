import { redisClient } from "../config/redis.js";
import { JsonRpcProvider } from "ethers";
import userModel from "../db/schema.js";

const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);

export const check_balance_update_db = async (address: string) => {
    try {
        let cached_balance = await redisClient.get(`balance${address}`);
        if (!cached_balance) {
            const balance = await provider.getBalance(address);
            cached_balance = balance.toString();
            await redisClient.set(`balance${address}`, cached_balance);
        }

        const existingUser = await userModel.findOne({DepositAddress: address});
        if (!existingUser) {
            return;
        }
        
        const oldBalance = existingUser.balance;

        if (oldBalance.toString() !== cached_balance) {  
            console.log(`Balance changed for ${address}: ${oldBalance} → ${cached_balance}`);
            
            await userModel.updateOne(  
                {DepositAddress: address},
                {$set: {balance: cached_balance}},
                {upsert: true}
            );
            
            await redisClient.set(`balance${address}`, cached_balance);
        }
    
        return cached_balance;
    } catch (error) {
        console.error(error);
    }
}