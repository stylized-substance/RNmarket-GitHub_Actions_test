import { Request, Response, NextFunction } from 'express';
import {
  isNumber,
  parseNumber,
  parseProductCategory,
  parseString
} from '#src/utils/typeNarrowers';
import { Review } from '#src/models';
import {
  ProductSearchParameters,
  ProductQueryParameters
} from '#src/types/types';
import { Op } from 'sequelize';

const processProductQueryParameters = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const searchParameters: ProductSearchParameters = {};
  let where = {};

  const parseNumericParameter = (param: unknown) => {
    try {
      const parsed = parseNumber(param);
      return parsed;
    } catch {
      return undefined;
    }
  };

  const parseStringParameter = (param: unknown): string | undefined => {
    try {
      const parsed = parseString(param);
      return parsed;
    } catch {
      return undefined;
    }
  };

  const queryParameters: ProductQueryParameters = {
    limit: parseNumericParameter(req.query.limit),
    withReviews: parseStringParameter(req.query.withReviews),
    category: parseStringParameter(req.query.category),
    search: parseStringParameter(req.query.search),
    lowestPrice: parseNumericParameter(req.query.lowestPrice),
    highestPrice: parseNumericParameter(req.query.highestPrice),
    instock: parseStringParameter(req.query.instock),
    lowestRating: parseNumericParameter(req.query.lowestRating),
    highestRating: parseNumericParameter(req.query.highestRating)
  };

  const {
    limit,
    withReviews,
    category,
    search,
    lowestPrice,
    highestPrice,
    instock,
    lowestRating,
    highestRating
  } = queryParameters;

  // Limit number of products returned
  // Handle invalid limit parameter
  if (req.query.limit && !isNumber(Number(req.query.limit))) {
    return res.status(400).json({ Error: 'Invalid product query limit' });
  }

  if (limit) {
    searchParameters.limit = limit;
  }

  // Include product reviews if requested
  if (withReviews && withReviews === 'true') {
    searchParameters.include = {
      model: Review
    };
  }

  if (withReviews && withReviews !== 'true') {
    return res
      .status(400)
      .json({ Error: `Value for 'withReviews' must be 'true' if used` });
  }

  // Filter products by category
  if (category) {
    const parsedCategory = parseProductCategory(category);
    if (parsedCategory) {
      where = {
        category: {
          [Op.eq]: category
        }
      };
    }
  }

  // Filter product titles by case insensitive search keyword
  if (search) {
    if (search.length <= 15) {
      where = {
        ...where,
        title: {
          [Op.iLike]: `%${search}%`
        }
      };
    } else {
      return res.status(400).json({ Error: 'Invalid search query' });
    }
  }

  // Filter products by price
  if (lowestPrice && !highestPrice) {
    return res
      .status(400)
      .json({ Error: 'Highest value in price range query missing' });
  }

  if (!lowestPrice && highestPrice) {
    return res
      .status(400)
      .json({ Error: 'Lowest value in price range query missing' });
  }

  if (lowestPrice && highestPrice) {
    if (lowestPrice < 0 || lowestPrice > 10000) {
      return res.status(400).json({ Error: 'Invalid lowest price query' });
    }

    if (highestPrice < 0 || highestPrice > 10000) {
      return res.status(400).json({ Error: 'Invalid highest price query' });
    }

    where = {
      ...where,
      price: {
        [Op.between]: [lowestPrice, highestPrice]
      }
    };
  }

  // Only return products that are in stock
  if (instock && instock === 'true') {
    where = {
      ...where,
      instock: {
        [Op.gt]: 0
      }
    };
  }

  // Filter products by rating
  if (lowestRating && !highestRating) {
    return res
      .status(400)
      .json({ Error: 'Highest value in rating range query missing' });
  }

  if (!lowestRating && highestRating) {
    return res
      .status(400)
      .json({ Error: 'Lowest value in rating range query missing' });
  }

  if (lowestRating && highestRating) {
    if (lowestRating < 1 || lowestRating > 5) {
      return res.status(400).json({ Error: 'Invalid lowest rating query' });
    }

    if (highestRating < 1 || highestRating > 5) {
      return res.status(400).json({ Error: 'Invalid highest rating query' });
    }

    where = {
      ...where,
      rating: {
        [Op.between]: [lowestRating, highestRating]
      }
    };
  }

  // Add search parameters to request object
  searchParameters.where = where;
  req.searchParameters = searchParameters;

  next();
  return;
};

export { processProductQueryParameters };
