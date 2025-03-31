import supertest from 'supertest';
import app from '#src/app';
import {
  connectToDatabase,
  closeDatabaseConnection,
  dropAllTables
} from '#src/utils/database';
import {
  assert200Response,
  assert400Response,
  assert404Response,
  assertValidType,
  getToken
} from '#src/utils/testHelpers';
import { Review, NewReview } from '#src/types/types';
import { Review as ReviewModel } from '#src/models';
import { User as UserModel, Product as ProductModel } from '#src/models';
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
  test('GET /api/reviews with query parameter user_id returns reviews for single user', async () => {
    // Get user that has at least one review
    const user: UserModel | null = await UserModel.findOne({
      include: [
        {
          model: ReviewModel,
          required: true
        }
      ]
    });

    const userId: string = user?.dataValues.id;

    const response = await api.get('/api/reviews').query(`user_id=${userId}`);
    assert200Response(response);
    expect(response.body).toHaveProperty('reviews');
    response.body.reviews.forEach((review: unknown) =>
      assertValidType('review', review)
    );
  });
  test('GET /api/reviews with query parameter product_id returns reviews for single product', async () => {
    // Get product that has at least one review
    const product: ProductModel | null = await ProductModel.findOne({
      include: {
        model: ReviewModel,
        required: true
      }
    });

    if (product) {
      const response = await api
        .get('/api/reviews')
        .query(`product_id=${product.dataValues.id}`);
      assert200Response(response);
      expect(response.body).toHaveProperty('reviews');
      response.body.reviews.forEach((review: unknown) =>
        assertValidType('review', review)
      );
    }
  });
  test('GET /api/reviews fails without query parameters', async () => {
    const response = await api.get('/api/reviews');
    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Query parameter missing'
    });
  });
  test('GET /api/reviews with product_id query fails if product has no reviews', async () => {
    // Add a test product that has no reviews
    const productToAdd = {
      title: 'test_title',
      category: 'Mobiles',
      price: 10,
      specs: ['test_specs'],
      brand: 'test_brand',
      ram: '8GB'
    };

    const productAddResponse = await api
      .post('/api/products')
      .send(productToAdd)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    // Try to get product reviews
    const response = await api
      .get('/api/reviews')
      .query(`product_id=${productAddResponse.body.addedProduct.id}`);

    assert404Response(response);
    expect(response.body).toStrictEqual({
      Error: 'No reviews found'
    });
  });
});
describe('POST requests', () => {
  test('POST - Logged in user can add a review', async () => {
    // Get valid product to add review to
    const productToTestWith: ProductModel | null = await ProductModel.findOne(
      {}
    );

    if (productToTestWith) {
      const review: NewReview = {
        product_id: productToTestWith.dataValues.id,
        title: 'test_title',
        content: 'test_content',
        rating: 1
      };

      const response = await api
        .post('/api/reviews/')
        .send(review)
        .set('Authorization', `Bearer ${userAccessToken}`);

      assert200Response(response);
      expect(response.body).toHaveProperty('addedReview');
      assertValidType('review', response.body.addedReview);
    }
  });
  test('POST - adding review fails if product is not found', async () => {
    const review: Review = {
      id: uuidv4(),
      product_id: uuidv4(),
      user_id: uuidv4(),
      name: 'test_name',
      title: 'test_title',
      content: 'test_content',
      rating: 1
    };

    const response = await api
      .post('/api/reviews')
      .send(review)
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Product not found'
    });
  });
});
describe('PUT requests', () => {
  test('PUT - Logged in user can edit own review', async () => {
    // Get valid product to add review to
    const productToTestWith: ProductModel | null = await ProductModel.findOne(
      {}
    );

    // Save a review and try to edit it
    if (productToTestWith) {
      const review: NewReview = {
        product_id: productToTestWith.dataValues.id,
        title: 'test_title',
        content: 'test_content',
        rating: 1
      };

      const reviewAddResponse = await api
        .post('/api/reviews/')
        .send(review)
        .set('Authorization', `Bearer ${userAccessToken}`);

      // Try to edit the review
      if (reviewAddResponse.body.addedReview) {
        const review = reviewAddResponse.body.addedReview;

        const editedReview: Review = {
          ...review,
          content: 'new_test_content'
        };

        const reviewEditResponse = await api
          .put(`/api/reviews/${review.id}`)
          .send(editedReview)
          .set('Authorization', `Bearer ${userAccessToken}`);

        assert200Response(reviewEditResponse);
        expect(reviewEditResponse.body).toHaveProperty('saveResult');
        assertValidType('review', reviewEditResponse.body.saveResult);
      }
    }
  });
  test('PUT - Editing review fails if review is not found in database', async () => {
    // Create UUID that doesn't exist in database
    const fakeId: string = uuidv4();

    const response = await api
      .put(`/api/reviews/${fakeId}`)
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert404Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Review not found in database'
    });
  });
});
describe('DELETE requests', () => {
  test('DELETE - logged in user can delete own reviews', async () => {
    // Get valid product to add review to
    const productToTestWith: ProductModel | null = await ProductModel.findOne(
      {}
    );

    const review: NewReview = {
      product_id: productToTestWith?.dataValues.id,
      title: 'test_title',
      content: 'test_content',
      rating: 1
    };

    const addResponse = await api
      .post('/api/reviews/')
      .send(review)
      .set('Authorization', `Bearer ${userAccessToken}`);

    const deleteResponse = await api
      .delete(`/api/reviews/${addResponse.body.addedReview.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(deleteResponse.status).toBe(204);
  });
});
