import mongoose, { Schema, Document } from "mongoose"
import { IUser } from "./user-model";

export interface IRefreshTokenSchema extends Document {
    userId: string
    token: string,
    expires: Date,
    created: Date
    createdByIp: string,
    revoked: Date,
    revokedByIp: string,
    replacedByToken: string,
    isActive: boolean,
    isExpired: boolean
}

const refreshTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String,


});

refreshTokenSchema.virtual('isExpired').get(function (this: IRefreshTokenSchema) {
    return Date.now() >= this.expires.getTime();
});

refreshTokenSchema.virtual('isActive').get(function (this: IRefreshTokenSchema) {
    return !this.revoked && !this.isExpired;
});

refreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_: any, ret: any) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.user;
    }
});


const RefreshToken = mongoose.model<IRefreshTokenSchema>("RefreshToken", refreshTokenSchema);

export default RefreshToken;