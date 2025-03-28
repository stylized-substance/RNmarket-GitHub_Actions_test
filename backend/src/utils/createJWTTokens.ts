import jwt from 'jsonwebtoken';
import { UserWithoutHash, RefreshToken, CartItems } from '#src/types/types';
import { v4 as uuidv4 } from 'uuid';

// Import JWT secrets from config file
import envVariables from '#src/config/envConfig';

const jwtAccessTokenSecret = envVariables.JWTACCESSTOKENSECRET;
const jwtRefreshTokenSecret = envVariables.JWTREFRESHTOKENSECRET;

// Function for creating JWT tokens
const createJWTTokens = (
  user: UserWithoutHash
): {
  refreshTokenForDb: RefreshToken;
  expiredRefreshTokenForDb: RefreshToken;
  accessToken: string;
} => {
  // Set expiry time for refresh token
  const refreshTokenExpiryTime: string =
    // Unix timestamps are too large for JS Number primitive, using string type in database instead
    (
      new Date().getTime() +
      envVariables.JWTREFRESHTOKENEXPIRATION * 1000
    ).toString();

  // Create access token
  const accessToken: string = jwt.sign(user, jwtAccessTokenSecret, {
    expiresIn: envVariables.JWTACCESSTOKENEXPIRATION
  });

  // Create refresh token for sending to client
  const refreshToken: string = jwt.sign(user, jwtRefreshTokenSecret, {
    expiresIn: envVariables.JWTREFRESHTOKENEXPIRATION
  });

  // Create expired refresh token for testing purposes
  const expiredRefreshToken: string = jwt.sign(user, jwtRefreshTokenSecret, {
    expiresIn: '-1h'
  });

  // Create refresh token object for saving to database
  const refreshTokenForDb: RefreshToken = {
    id: uuidv4(),
    token: refreshToken,
    expiry_date: refreshTokenExpiryTime,
    user_id: user.id
  };

  // Create expired refresh token object for saving to database
  const expiredRefreshTokenForDb: RefreshToken = {
    id: uuidv4(),
    token: expiredRefreshToken,
    expiry_date: '0',
    user_id: user.id
  };

  return { refreshTokenForDb, expiredRefreshTokenForDb, accessToken };
};

const createTemporaryToken = (cartItems: CartItems): string => {
  // Create temporary access token for making orders without logging in
  const accessToken: string = jwt.sign(cartItems, jwtAccessTokenSecret, {
    expiresIn: '15m'
  });

  return accessToken;
};

export { createJWTTokens, createTemporaryToken };
