import supertest from 'supertest';
import server from '../index'; 
import { dbConnect, dbDisconnect } from '../configDB/dbConfig';
import { findUser, createUser } from '../services/user.services';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.utils';
import { generateEmailToken, sendEmail } from '../utils/email.utils';
import { verifyEmailToken } from '../utils/email.utils';
import { findUserById } from '../services/user.services';
import bcrypt from 'bcrypt';



beforeAll(async () => {
    await dbConnect();
});
jest.mock('../utils/email.utils', () => ({
    generateEmailToken: jest.fn(),
    sendEmail: jest.fn(),
    verifyEmailToken: jest.fn()
}));

jest.mock('../utils/jwt.utils', () => ({
    generateToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyToken: jest.fn()
}));

jest.mock('../services/user.services', () => ({
    findUser: jest.fn(),
    createUser: jest.fn(),
    findUserById: jest.fn()
}));

afterAll(async () => {
    await server.close();
    await dbDisconnect();
});


jest.mock('bcrypt');

describe('User Login', () => {
    test('Successful login', async () => {
        const mockUser = {
            id: 'userId123',
            isEmailConfirmed: true,
            password: await bcrypt.hash('password123', 10),
            save: jest.fn().mockResolvedValue(true)
        };

        (findUser as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (generateToken as jest.Mock).mockReturnValue('token123');
        (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken123');

        await supertest(server)
            .post('/auth/login')
            .send({ email: 'user@example.com', password: 'password123' })
            .expect(200)
            .expect('Set-Cookie', 'refreshToken=refreshToken123; Path=/; HttpOnly; Secure; SameSite=Strict')
            .expect({ accessToken: 'token123' });
    });


    test('Invalid credentials', async () => {
        (findUser as jest.Mock).mockResolvedValue(null);

        await supertest(server)
            .post('/auth/login')
            .send({ email: 'user@example.com', password: 'wrongpassword' })
            .expect(400, { msg: 'Invalid Credentials' });
    });

    test('Email not confirmed', async () => {
        const mockUser = {
            id: 'userId123',
            isEmailConfirmed: false,
            password: await bcrypt.hash('password123', 10),
            save: jest.fn().mockResolvedValue(true)
        };

        (findUser as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        await supertest(server)
            .post('/auth/login')
            .send({ email: 'user@example.com', password: 'password123' })
            .expect(400, { msg: 'Email not confirmed' });
    });

    test('Invalid password', async () => {
        const mockUser = {
            id: 'userId123',
            isEmailConfirmed: true,
            password: await bcrypt.hash('password123', 10),
            save: jest.fn().mockResolvedValue(true)
        };

        (findUser as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await supertest(server)
            .post('/auth/login')
            .send({ email: 'user@example.com', password: 'wrongpassword' })
            .expect(400, { msg: 'Invalid Credentials' });
    });

    test('Server error', async () => {
        (findUser as jest.Mock).mockImplementation(() => { throw new Error('Database error'); });

        await supertest(server)
            .post('/auth/login')
            .send({ email: 'user@example.com', password: 'password123' })
            .expect(500, 'Server error');
    });
});

describe('User Register', () => {
    beforeEach(() => {
        (createUser as jest.Mock).mockClear();
        (createUser as jest.Mock).mockRejectedValue(new Error('User already exists'));
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test('Successful registration', async () => {
        (createUser as jest.Mock).mockResolvedValue({ id: 'userId123' });
        (generateEmailToken as jest.Mock).mockReturnValue('emailToken123');

        await supertest(server)
            .post('/auth/register')
            .send({ email: 'user@example.com', password: 'password123' })
            .expect(200);
        expect(sendEmail).toHaveBeenCalledWith('user@example.com', 'Confirm Email', 'Click this link to confirm your email: http://localhost:3000/auth/confirm-email?token=emailToken123');
    });

    test.concurrent('User already exists', async () => {
        await supertest(server)
            .post('/auth/register')
            .send({ email: 'user@example.com', password: 'password123' })
            .expect(400, { message: 'User already exists' });
    });
});

describe('Email confirmation', () => {
    test('Successful confirmation', async () => {
        (verifyEmailToken as jest.Mock).mockReturnValue({ userId: 'userId123' });
        (findUserById as jest.Mock).mockResolvedValue({ id: 'userId123', isEmailConfirmed: false, save: jest.fn().mockResolvedValue(true) });

        await supertest(server)
            .get('/auth/confirm-email?token=emailToken123')
            .expect(200);
    }
    );
    test('No Token Provided', async () => {
        await supertest(server)
            .get('/auth/confirm-email')
            .expect(400, { "msg": "No token provided" });
    }
    );
    test('Invalid or expired token', async () => {
        (verifyEmailToken as jest.Mock).mockImplementation(() => { throw new Error('Invalid or expired token'); });
        await supertest(server)
            .get('/auth/confirm-email?token=emailToken123')
            .expect(400, { msg: 'Invalid token' });
    });

});
describe('Logout', () => {
    test('Successful logout clears cookie and returns message', async () => {
        await supertest(server)
            .post('/auth/logout')
            .expect(200)
            .expect('Set-Cookie', /refreshToken=;/)
            .expect({ msg: 'Logged out' });
    });
});


describe('Refresh Token', () => {
    test('Successful token refresh', async () => {
        const mockUser = {
            id: 'userId123',
            refreshToken: 'validRefreshToken',
            save: jest.fn().mockResolvedValue(true)
        };

        (verifyToken as jest.Mock).mockReturnValue({ userId: 'userId123' });
        (findUserById as jest.Mock).mockResolvedValue(mockUser);
        (generateToken as jest.Mock).mockReturnValue('newAccessToken');

        await supertest(server)
            .post('/auth/refresh-token')
            .set('Cookie', 'refreshToken=validRefreshToken')
            .expect(200)
            .expect({ accessToken: 'newAccessToken' });
    });

    test('No refresh token provided', async () => {
        await supertest(server)
            .post('/auth/refresh-token')
            .expect(401, { msg: 'No refresh token provided' });
    });

    test('Invalid refresh token', async () => {
        (verifyToken as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });
        (findUserById as jest.Mock).mockResolvedValue(null);

        await supertest(server)
            .post('/auth/refresh-token')
            .set('Cookie', 'refreshToken=invalidRefreshToken')
            .expect(401, { msg: 'Invalid token' });
    });

    test('Server error', async () => {
        (verifyToken as jest.Mock).mockImplementation(() => { throw new Error('Some server error'); });

        await supertest(server)
            .post('/auth/refresh-token')
            .set('Cookie', 'refreshToken=someToken')
            .expect(500, 'Server error');
    });
});