import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { User as UserModel } from '#src/models';
import { RefreshToken as RefreshTokenModel } from '#src/models';
import { parseString } from '#src/utils/typeNarrowers';
import { createJWTTokens } from '#src/utils/createJWTTokens';
import { LoginPayload, User, RefreshTokenExpiredError } from '#src/types/types';

const router: Router = Router();

// Login user
router.post('/login', async (req: Request, res: Response) => {
  const username: string | null = req.body.username
    ? parseString(req.body.username)
    : null;

  const password: string | null = req.body.password
    ? parseString(req.body.password)
    : null;

  if (!username) {
    return res.status(400).json({ Error: 'Username missing from request' });
  }

  if (!password) {
    return res.status(400).json({ Error: 'Password missing from request' });
  }

  // Get user from database
  const user: UserModel | null = await UserModel.findOne({
    where: {
      username: username
    }
  });

  if (!user) {
    return res.status(400).json({ Error: 'User not found in database' });
  }

  // If password hash is null in database, send error. Else send access token and refresh token
  if (user.dataValues.passwordhash === null) {
    return res.status(500).json({ Error: 'User has no password set' });
  }

  const passwordCorrect: boolean = await bcrypt.compare(
    password,
    user.dataValues.passwordhash
  );

  if (!passwordCorrect) {
    return res.status(401).json({ Error: 'Incorrect password' });
  }

  // Strip passwordhash from user data so it doesn't get sent to client
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passwordhash is discarded
    passwordhash,
    ...userWithoutHash
  }: User = user.dataValues;

  // Create JWT tokens
  const { accessToken, refreshTokenForDb } = createJWTTokens(userWithoutHash);

  // Save refresh token to database
  await RefreshTokenModel.create(refreshTokenForDb);

  // Create response payload to send to client
  const payload: LoginPayload = {
    username: userWithoutHash.username,
    name: userWithoutHash.name,
    id: userWithoutHash.id,
    isadmin: userWithoutHash.isadmin,
    accessToken: accessToken,
    refreshToken: refreshTokenForDb.token
  };

  // Send payload to client
  return res.status(200).json({ payload });
});

// Create new access token for user
router.post(
  '/refresh',
  async (req: Request, res: Response) => {
    // Refresh access token for user
    if (!req.body.refreshToken) {
      return res
        .status(400)
        .json({ Error: 'Refresh token missing from request' });
    }

    const refreshToken: string = parseString(req.body.refreshToken);

    // Find existing refresh token in database, send error if not found
    const tokenInDb: RefreshTokenModel | null = await RefreshTokenModel.findOne(
      {
        where: {
          token: refreshToken
        }
      }
    );

    if (!tokenInDb) {
      return res
        .status(400)
        .json({ Error: 'Refresh token not found in database' });
    }

    // Check if refresh token has expired, delete it and send error if true
    const currentDate: Date = new Date();

    if (Number(tokenInDb.dataValues.expiry_date) < currentDate.getTime()) {
      await tokenInDb.destroy();
      throw new RefreshTokenExpiredError(
        'Refresh token has expired, login again'
      );
    }

    const userInDb: UserModel | null = await UserModel.findByPk(
      tokenInDb.dataValues.user_id
    );

    // Create new access token and send to client
    const newAccessToken = createJWTTokens(userInDb?.dataValues).accessToken;
    return res.status(201).json({ accessToken: newAccessToken });
  }
);

export default router;
