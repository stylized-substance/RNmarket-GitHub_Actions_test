import express from 'express';
import 'express-async-errors';
import productsRouter from '#src/routes/products';
import usersRouter from '#src/routes/users';
import reviewsRouter from '#src/routes/reviews';
import authorizationRouter from '#src/routes/authorization';
import ordersRouter from '#src/routes/orders';
import checkoutRouter from '#src/routes/checkout';
import errorHandler from '#src/utils/errorHandler';
import cors from 'cors';
import { connectToDatabase } from '#src/utils/database';
import envVariables from '#src/config/envConfig';
import logger from '#src/utils/logger';

const listeningPort = envVariables.PORT;

const imagesPath =
  process.env.NODE_ENV === 'production'
    ? './backend/data/images'
    : './data/images';

const app = express();

app.use(cors());

app.use(express.json());

app.use(['/images', '/data/images'], express.static(imagesPath));

app.use(['/products', '/api/products'], productsRouter);

app.use(['/users', '/api/users'], usersRouter);

app.use(['/reviews', '/api/reviews'], reviewsRouter);

app.use(['/authorization', '/api/authorization'], authorizationRouter);

app.use(['/orders', '/api/orders'], ordersRouter);

app.use(['/checkout', '/api/checkout'], checkoutRouter);

app.use('/test', (_req, res) => {
  res.send('test');
});

app.use(errorHandler);

const connectToDb = async () => {
  try {
    logger('Connecting to database');
    await connectToDatabase();
  } catch (error) {
    logger(
      'Error while connecting to database. Error:',
      error
    );

    return;
  }
};

connectToDb();

if (process.env.NODE_ENV === 'development') {
  app.listen(listeningPort, () => {
    logger(`Server listening on port ${envVariables.PORT}`);
  });
}

export default app;

// Export for node in production mode
export { app };
