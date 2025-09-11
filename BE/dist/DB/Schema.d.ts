import { Schema } from "mongoose";
declare const userModel: import("mongoose").Model<{
    email: string;
    password: string;
    DepositAddress: string;
    userId: string;
    privateKey: string;
    balance: number;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    email: string;
    password: string;
    DepositAddress: string;
    userId: string;
    privateKey: string;
    balance: number;
}, {}, import("mongoose").DefaultSchemaOptions> & {
    email: string;
    password: string;
    DepositAddress: string;
    userId: string;
    privateKey: string;
    balance: number;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    email: string;
    password: string;
    DepositAddress: string;
    userId: string;
    privateKey: string;
    balance: number;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    email: string;
    password: string;
    DepositAddress: string;
    userId: string;
    privateKey: string;
    balance: number;
}>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
    email: string;
    password: string;
    DepositAddress: string;
    userId: string;
    privateKey: string;
    balance: number;
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
export default userModel;
//# sourceMappingURL=Schema.d.ts.map