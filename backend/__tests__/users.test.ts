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
  assert403Response,
  assert404Response,
  assertValidType,
  getToken
} from '#src/utils/testHelpers';
import { User as UserModel } from '#src/models';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const api = supertest(app);

// Declare variables for access tokens
let userAccessToken: string;
let adminAccessToken: string;

beforeEach(async () => {
  // Empty database and run migrations
  await dropAllTables();
  await connectToDatabase();

  // Define regular and admin users and get access tokens for them
  const user = {
    username: 'test_user@example.org',
    password: 'password'
  };
  const adminUser = {
    username: 'admin@example.org',
    password: 'password'
  };

  // Assign access tokens to global variables
  userAccessToken = await getToken(user);
  adminAccessToken = await getToken(adminUser);
});

afterAll(async () => {
  await closeDatabaseConnection();
});

describe('GET requests', () => {
  test('GET - Admin user can get all users in database', async () => {
    const response = await api
      .get('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    assert200Response(response);
    expect(response.body).toHaveProperty('users');
    response.body.users.forEach((user: unknown) => {
      assertValidType('user', user);
    });
  });
  test('GET - Regular user cannot get users from database', async () => {
    const response = await api
      .get('/api/users')
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert403Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Only admin users can get users'
    });
  });
});
describe('POST requests', () => {
  test('POST - Regular user can be added to database without access token in request', async () => {
    const user = {
      username: 'test_username@example.org',
      name: 'test_name',
      password: 'test_password',
      isadmin: false
    };

    const response = await api.post('/api/users').send(user);

    assert201Response(response);
    expect(response.body).toHaveProperty('addedUser');
    assertValidType('user', response.body.addedUser);
  });
  test('POST - Regular user cannot add an admin user', async () => {
    const user = {
      username: 'test_username@example.org',
      name: 'test_name',
      password: 'test_password',
      isadmin: true
    };

    const response = await api
      .post('/api/users')
      .send(user)
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert403Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Only admin users can create admin users'
    });
  });
});
describe('PUT requests', () => {
  test('PUT - User can change their own password', async () => {
    // Find test user in database
    const userInDb: UserModel | null = await UserModel.findOne({
      where: {
        username: 'test_user@example.org'
      }
    });

    const response = await api
      .put(`/api/users/${userInDb?.toJSON().id}`)
      .send({ password: 'newpassword' })
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert200Response(response);
    expect(response.body).toHaveProperty('saveResult');
    assertValidType('user', response.body.saveResult);
  });
  test(`PUT - User cannot change other user's password`, async () => {
    // Find user in database other than the test user
    const userInDb: UserModel | null = await UserModel.findOne({
      where: {
        username: {
          [Op.ne]: 'test_user@example.org'
        }
      }
    });

    const response = await api
      .put(`/api/users/${userInDb?.toJSON().id}`)
      .send({ password: 'newpassword' })
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert403Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Users can only change their own password'
    });
  });
  test(`PUT - Trying to change non-existent user's password returns 404`, async () => {
    // Create UUID that doesn't exist in database
    const fakeId: string = uuidv4();

    const response = await api
      .put(`/api/users/${fakeId}`)
      .send({ password: 'newpassword' })
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert404Response(response);
    expect(response.body).toStrictEqual({
      Error: 'User not found'
    });
  });
});
describe('DELETE requests', () => {
  test('DELETE - Admin users can delete other users', async () => {
    // Find test user in database
    const userInDb: UserModel | null = await UserModel.findOne({
      where: {
        username: 'test_user@example.org'
      }
    });

    const response = await api
      .delete(`/api/users/${userInDb?.toJSON().id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(204);
  });
  test('DELETE - Regular user cannot delete other users', async () => {
    // Find user in database other than the test user
    const userInDb: UserModel | null = await UserModel.findOne({
      where: {
        username: {
          [Op.ne]: 'test_user@example.org'
        }
      }
    });

    const response = await api
      .delete(`/api/users/${userInDb?.toJSON().id}`)
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert403Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Only admin users can delete users'
    });
  });
  test(`DELETE - Trying to delete non-existent user returns 404`, async () => {
    // Create UUID that doesn't exist in database
    const fakeId: string = uuidv4();

    const response = await api
      .delete(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    assert404Response(response);
    expect(response.body).toStrictEqual({
      Error: 'User not found'
    });
  });
});
