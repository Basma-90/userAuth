import  UserModel  from '../models/user.model';
import bcrypt from 'bcrypt';
import { generateRefreshToken } from '../utils/jwt.utils';
import { IUser } from '../models/user.model';


export const findUser= async (email : string) => {
    return await UserModel.findOne({ email: email });
}

export const createUser= async( name: string, email: string, password: string) => {
    let user  = new UserModel({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    
    const userId: string = (user._id) as string;
    const refreshToken = generateRefreshToken(userId);
    user.refreshToken = refreshToken;

    await user.save();
    return user;
}

export const findUserById= async (id : string) => {
    return await UserModel.findById(id);
}

export const updateUser = async( id: string, update: Partial<IUser>) => {
    await  UserModel.findByIdAndUpdate(id, update)
}
