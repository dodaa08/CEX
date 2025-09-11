import userModel from "../db/schema.js";
import { redisClient } from "../config/redis.js";

const CACHE_KEY = "interested_addresses";

export const LoadInteresetdAddresses = async () => {
  try {
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const users = await userModel.find({}, {DepositAddress: 1, _id: 0});
    const addresses = users.map((user) => user.DepositAddress.toLowerCase());

    await redisClient.set(CACHE_KEY, JSON.stringify(addresses));
    return addresses;
  } catch (error) {
    console.error(error);
    return [];
  }
};
