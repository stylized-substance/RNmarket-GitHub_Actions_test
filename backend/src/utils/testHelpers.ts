import Response from 'superagent/lib/node/response';
import {
  isReview,
  isProduct,
  isUser,
  isLoginPayload,
  isNewOrder
} from '#src/utils/typeNarrowers';
import supertest from 'supertest';
import app from '#src/app';

const api = supertest(app);

// Custom assert functions for JSON responses
export const assert200Response = (response: Response) => {
  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

export const assert201Response = (response: Response) => {
  expect(response.status).toBe(201);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

export const assert400Response = (response: Response) => {
  expect(response.status).toBe(400);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

export const assert401Response = (response: Response) => {
  expect(response.status).toBe(401);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

export const assert403Response = (response: Response) => {
  expect(response.status).toBe(403);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

export const assert404Response = (response: Response) => {
  expect(response.status).toBe(404);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

export const assert500Response = (response: Response) => {
  expect(response.status).toBe(500);
  expect(response.headers['content-type']).toMatch(/application\/json/);
};

// Custom assert functions for type checking

// Assertion template function
export const assertValidType = (
  type: 'product' | 'review' | 'user' | 'loginpayload' | 'order',
  item: unknown
): void => {
  let typeCheck;

  switch (type) {
    case 'product':
      typeCheck = isProduct(item);
      break;
    case 'review':
      typeCheck = isReview(item);
      break;
    case 'user':
      typeCheck = isUser(item);
      break;
    case 'loginpayload':
      typeCheck = isLoginPayload(item);
      break;
    case 'order':
      typeCheck = isNewOrder(item);
      break;
    default: {
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
    }
  }

  expect(typeCheck).toEqual(true);
};

// Login user and return accessToken

export const getToken = async (user: {
  username: string;
  password: string;
}): Promise<string> => {
  const loginResponse = await api.post('/api/authorization/login').send(user);
  console.log('loginResponse', loginResponse)
  return loginResponse.body.payload.accessToken;
};
