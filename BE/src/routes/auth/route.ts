import express from "express";
import userModel from "../../DB/Schema.js";
const authRouter = express.Router();
import MNUMONICS from "../../config/config.js";
import { HDNodeWallet } from "ethers";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
const seed = mnemonicToSeedSync(MNUMONICS);
import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers";
const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
console.log("Provider", provider);
import { redisClient } from "../../config/redis.js";


const signup = async (req : any, res : any)=>{
    const {email, password} = req.body;
    
    try{
        
        const userFound = await userModel.findOne({
            email : email
        });

        if(userFound){
            res.status(500).json({
                message : "User already exists"
            });
            return;
        }

        const userCount = await userModel.countDocuments();
        const userId = userCount + 1;

        const hdNode = HDNodeWallet.fromSeed(seed);
        const Child  = hdNode.derivePath(`m/44'/60'/${userId}'/0`);
        const private_key = Child.privateKey;
        console.log("Private key", private_key);

        const DepositAddress = Child;
        console.log("Deposit Address", DepositAddress);

        const balance = await provider.getBalance(DepositAddress.address);
        console.log("Balance", balance);

        const balanceInEth = ethers.formatEther(balance);
        console.log("Balance in Eth", balanceInEth);
        // const balanceInEth = ethers.utils.formatEher(balance);
        
        const user = userModel.create({
            email : email,
            password : password,
            DepositAddress : DepositAddress.address,
            userId : userId,
            privateKey : private_key,
            balance : balanceInEth.toString()
        });

        await redisClient.del("interested_addresses");
        console.log("Interested addresses deleted...");

        // console.log("User created...", user);
        res.json({
            message : "user created",
            user : {
                email : email,
                DepositAddress : DepositAddress
            },
            private_key : private_key,
            userID : userId
            // Deposit_key : DepositAddress
        });
    }
    catch(error){
        console.error(error);
        res.send(error);
    }    
}


authRouter.post("/signup", signup);
export default authRouter;