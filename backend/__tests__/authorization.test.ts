import supertest from 'supertest';
import app from '#src/app';
import {
  connectToDatabase,
  closeDatabaseConnection,
  dropAllTables
} from '#src/utils/database';
import {
  assert200Response,
  assert201Response,
  assert400Response,
  assert401Response,
  assert500Response,
  assertValidType
} from '#src/utils/testHelpers';
import {
  User as UserModel,
  RefreshToken as RefreshTokenModel
} from '#src/models';
import { isString } from '#src/utils/typeNarrowers';
import { createJWTTokens } from '#src/utils/createJWTTokens';
import { v4 as uuidv4 } from 'uuid';

const api = supertest(app);

// Define test user
const user = {
  username: 'test_user@example.org',
  password: 'password'
};

beforeAll(async () => {
  // Empty database and run migrations
  await dropAllTables();
  await connectToDatabase();
});

afterAll(async () => {
  await closeDatabaseConnection();
});

describe('POST requests', () => {
  test('POST - Login works with username and password', async () => {
    const response = await api.post('/api/authorization/login').send(user);

    assert200Response(response);
    assertValidType('loginpayload', response.body.payload);
  });
  test('POST - Login fails with wrong password', async () => {
    const wrongPasswordUser = {
      username: user.username,
      password: 'wrongpassword'
    };

    const response = await api
      .post('/api/authorization/login')
      .send(wrongPasswordUser);

    assert401Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Incorrect password'
    });
  });
  test('POST - Login fails if username or password is missing from request body', async () => {
    let response = await api
      .post('/api/authorization/login')
      .send({ username: user.username });

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Password missing from request'
    });

    response = await api
      .post('/api/authorization/login')
      .send({ password: user.password });

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Username missing from request'
    });
  });
  test(`POST - Login fails if user doesn't have a password set`, async () => {
    const userInDb: UserModel | null = await UserModel.findOne({
      where: {
        passwordhash: null
      }
    });

    const response = await api.post('/api/authorization/login').send({
      username: userInDb?.dataValues.username,
      password: 'password'
    });

    assert500Response(response);
    expect(response.body).toStrictEqual({
      Error: 'User has no password set'
    });
  });
  test('POST - Login fails with non-existent user', async () => {
    const nonExistingUser = {
      username: 'non-existing@example.org',
      password: 'password'
    };

    const response = await api
      .post('/api/authorization/login')
      .send(nonExistingUser);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'User not found in database'
    });
  });
  test('POST - Logged in user can get a new refresh token', async () => {
    const loginResponse = await api.post('/api/authorization/login').send(user);
    const refreshToken: string = loginResponse.body.payload.refreshToken;

    const response = await api
      .post('/api/authorization/refresh')
      .send({ refreshToken: refreshToken });

    assert201Response(response);
    expect(response.body).toHaveProperty('accessToken');
    expect(isString(response.body.accessToken)).toBe(true);
  });
  test('POST - Getting a new refresh token fails if old one is not included in request body', async () => {
    const response = await api.post('/api/authorization/refresh');

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Refresh token missing from request'
    });
  });
  test('POST - Getting a new refresh token fails if sending refresh token that does not exist in database', async () => {
    const fakeToken = uuidv4();
    const response = await api
      .post('/api/authorization/refresh')
      .send({ refreshToken: fakeToken });

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Refresh token not found in database'
    });
  });
  test('POST - Getting a new refresh token fails if sending expired refresh token', async () => {
    // Get test user from database and generate expired refresh token
    const userInDb: UserModel | null = await UserModel.findOne({
      where: {
        username: user.username
      }
    });

    const expiredToken = createJWTTokens(
      userInDb?.dataValues
    ).expiredRefreshTokenForDb;

    // Save expired token to database
    await RefreshTokenModel.create(expiredToken);

    const response = await api
      .post('/api/authorization/refresh')
      .send({ refreshToken: expiredToken.token });

    assert401Response(response);
    expect(response.body).toStrictEqual({
      'Error': 'Refresh token has expired, login again'
    });
  });
});
