import { Schema, model } from "mongoose";

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    DepositAddress : {
        type : String,
        required : true,
        unique : true
    },
    userId : {
        type : String,
        required : true,
        unique : true
    },
    privateKey : {
        type : String,
        required : true,
        unique : true
    },
    balance : {
        type : Number,
        required : true,
        // unique : true
    }
});

const userModel = model("User", userSchema);


export default userModel;

