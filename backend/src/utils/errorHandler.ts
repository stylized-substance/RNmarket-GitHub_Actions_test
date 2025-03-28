import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { TypeNarrowingError } from './typeNarrowers';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger from '#src/utils/logger';
import { RefreshTokenExpiredError } from '#src/types/types';

const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  logger('errorHandler:', error);

  if (error instanceof Error && error.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ Error: error.message });
  }

  if (error instanceof Error && error.name === 'SequelizeValidationError') {
    return res.status(400).json({ Error: error.message });
  }

  if (error instanceof RefreshTokenExpiredError) {
    return res.status(401).json({ Error: error.message });
  }

  if (
    error instanceof Error &&
    error.name === 'SequelizeForeignKeyConstraintError' &&
    error.message ===
      'update or delete on table "products" violates foreign key constraint "product_orders_product_id_fkey" on table "product_orders"'
  ) {
    return res
      .status(401)
      .json({ Error: 'Cannot delete product that is part of an order' });
  }

  if (error instanceof UniqueConstraintError) {
    return res.status(400).json({ Error: error.errors[0].message });
  }

  if (error instanceof TypeNarrowingError) {
    return res.status(400).json({ Error: error.message });
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(400).json({ Error: error.message });
  }

  if (error instanceof TokenExpiredError) {
    return res.status(401).json({ Error: error.message });
  }

  next(error);
  return;
};

export default errorHandler;
