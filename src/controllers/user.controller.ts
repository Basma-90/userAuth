import { Request, Response } from "express";
import { generateToken, verifyToken, generateRefreshToken} from "../utils/jwt.utils";
import { verifyEmailToken } from "../utils/email.utils";
import UserModel, { IUser } from "../models/user.model";
import bcrypt from "bcrypt";
import { sendEmail ,generateEmailToken} from "../utils/email.utils";

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    
    let user = await UserModel.findOne({ email: email });
    if (user) {
        return res.status(400).json({ message: "User already exists" });
    }

    user = new UserModel({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    const userId: string = (user._id) as string;
    const refreshToken = generateRefreshToken(userId);
    user.refreshToken = refreshToken;

    await user.save();

    const token = generateToken(userId);

    res.cookie(
        'refreshToken',
        refreshToken,
        {
            httpOnly: true,
            sameSite: 'strict',
            secure: true
        }
    )
    
    const emailToken = generateEmailToken(userId);
    const url = `http://localhost:3000/auth/confirm-email?token=${emailToken}`;
    const emailText = `Click this link to confirm your email: ${url}`;
    await sendEmail(email, 'Confirm Email', emailText);
    
    return res.status(200).json({ token });
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isEmailConfirmed = user.isEmailConfirmed;

        if (!isEmailConfirmed) {
            return res.status(400).json({ msg: 'Email not confirmed' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.json({ accessToken });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};



export const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ msg: 'No refresh token provided' });
    }

    try {
        const decoded = verifyToken(refreshToken) as any;
        console.log('decoded', decoded);
        const userId = decoded.userId;

        const user = await UserModel.findById(userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ msg: 'Invalid refresh token' });
        }

        const accessToken = generateToken(userId);
        res.json({ accessToken });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

export const confirmEmail = async (req: Request, res: Response) => {
    const token = req.query.token;

    console.log('email token', token);    

    if (!token) {
        return res.status(400).json({ msg: 'No token provided' });
    }

    try {
        const decoded = verifyEmailToken(token as string) as any;
        console.log('emaildecoded', decoded);
        const userId = decoded.userId;

        const user = await UserModel.findById(userId);
        console.log('user', user);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid token' });
        }

        user.isEmailConfirmed = true;
        await user.save();

        res.json({ msg: 'Email confirmed successfully' });
    } catch (err:any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


export const logout = async (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logged out' });
}

