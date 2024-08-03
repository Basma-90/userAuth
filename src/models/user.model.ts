import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isEmailConfirmed?: boolean;
    refreshToken?: string;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    isEmailConfirmed: {
        type: Boolean,
        default: false,
    },
});

const User = model<IUser>('User', userSchema);

export default User;
