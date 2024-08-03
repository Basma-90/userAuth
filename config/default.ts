export default {
    saltWorkFactor: 10,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL || "15m",
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || "1y",
    privateKey: process.env.JWT_PRIVATE_KEY || '',
    publicKey: process.env.JWT_PUBLIC_KEY || '',
};