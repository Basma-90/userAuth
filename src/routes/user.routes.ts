import { Request, Response, Router } from 'express';
import { register, login, logout, refreshToken, confirmEmail } from '../controllers/user.controller';
const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User registered successfully. Returns a token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: User already exists or validation error
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successfully logged in. Returns an access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Invalid credentials or email not confirmed
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out the user
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       500:
 *         description: Server error
 */
router.post('/logout', logout);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
 *     responses:
 *       200:
 *         description: Successfully refreshed access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: No refresh token provided or invalid refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh-token', refreshToken);

/**
 * @openapi
 * /auth/confirm-email:
 *   get:
 *     summary: Confirm user email using a token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *       400:
 *         description: No token provided or invalid token
 *       500:
 *         description: Server error
 */
router.get('/confirm-email', confirmEmail);

export default router;
