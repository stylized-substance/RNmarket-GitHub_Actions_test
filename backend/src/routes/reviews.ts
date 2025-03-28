import { Request, Response, Router } from 'express';
import { Review as ReviewModel } from '#src/models/';
import { Product as ProductModel } from '#src/models';
import { Op } from 'sequelize';
import { parseString } from '#src/utils/typeNarrowers';
import tokenExtractor from '#src/middleware/tokenExtractor';
import { NewReview, EditedReview, Review } from '#src/types/types';
import { toNewReview, toEditedReview } from '#src/utils/typeNarrowers';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// Get reviews
router.get('/', async (req: Request, res: Response) => {
  if (Object.keys(req.query).length === 0) {
    return res.status(400).json({ Error: 'Query parameter missing' });
  }

  // Extract query parameters from request
  const user_id: string | undefined = req.query.user_id
    ? parseString(req.query.user_id)
    : undefined;
  const product_id: string | undefined = req.query.product_id
    ? parseString(req.query.product_id)
    : undefined;

  // Create empty array for reviews to send to client
  let reviews: ReviewModel[] | [] = [];

  // Get reviews for user
  if (user_id) {
    reviews = await ReviewModel.findAll({
      where: {
        user_id: {
          [Op.eq]: user_id
        }
      }
    });
  }

  // Get reviews for product
  if (product_id) {
    reviews = await ReviewModel.findAll({
      where: {
        product_id: {
          [Op.eq]: product_id
        }
      }
    });
  }

  if (reviews && reviews.length > 0) {
    return res.json({ reviews });
  } else {
    return res.status(404).json({ Error: 'No reviews found' });
  }
});

// Add new review
router.post('/', tokenExtractor, async (req: Request, res: Response) => {
  const newReview: NewReview = toNewReview(req.body);
  const product = await ProductModel.findByPk(newReview.product_id);

  if (!product) {
    return res.status(400).json({ Error: 'Product not found' });
  }

  const reviewWithIds: Review = {
    ...newReview,
    id: uuidv4(),
    user_id: req.verifiedToken.id,
    name: req.verifiedToken.name
  };

  const addedReview: ReviewModel = await ReviewModel.create({
    ...reviewWithIds
  });

  return res.json({ addedReview });
});

// Edit a review
router.put('/:id', tokenExtractor, async (req: Request, res: Response) => {
  const id: string = parseString(req.params.id);
  const review: ReviewModel | null = await ReviewModel.findByPk(id);

  if (review) {
    // Convert database response data to JSON
    const reviewJSON: Review = review.toJSON();

    // Save edited review if request came from it's creator
    if (reviewJSON.user_id === req.verifiedToken.id) {
      const editedReview: EditedReview = toEditedReview(req.body);
      await review.update(editedReview);
      const saveResult = await review.save();
      res.json({ saveResult });
    }
  } else {
    res.status(404).json({ Error: 'Review not found in database' });
  }
});

// Delete a review
router.delete('/:id', tokenExtractor, async (req: Request, res: Response) => {
  const id: string = parseString(req.params.id);
  const review: ReviewModel | null = await ReviewModel.findByPk(id);

  if (review) {
    // Convert database response data to JSON
    const reviewJSON: Review = review.toJSON();

    // Delete review if request came from it's creator
    if (reviewJSON.user_id === req.verifiedToken.id) {
      await review.destroy();
      res.status(204).end();
    } else {
      res
        .status(400)
        .json({ Error: 'Reviews can only be deleted by their creator' });
    }
  } else {
    res.status(404).json({ Error: 'Review not found in database' });
  }
});

export default router;
