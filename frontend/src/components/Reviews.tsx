import reviewsService from '#src/services/reviews';
import { useQuery } from '@tanstack/react-query';

import Stack from 'react-bootstrap/Stack';
import StarRating from '#src/components/StarRating';

interface ReviewsProps {
  productId: string;
}

const Reviews = (props: ReviewsProps) => {
  // Fetch product reviews with Tanstack Query
  const { data } = useQuery({
    queryKey: ['singleProductReviews'],
    queryFn: () => {
      return reviewsService.getAllForProduct(props.productId);
    }
  });

  const reviewsSortedByDate = data?.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Stack gap={5} className="mt-5 mb-5">
      <h2 className="text-center">Product Reviews</h2>
      {reviewsSortedByDate ? (
        reviewsSortedByDate.map((review) => (
          <Stack key={review.id}>
            <b>
              <u>{review.title}</u>
            </b>
            <p className="border  rounded p-3 mt-2 mb-2">
              <em>{review.content}</em>
            </p>
            <div>
              Sent by: <b> {review.name}</b> at{' '}
              {new Date(review.createdAt).toLocaleString('en-us')}
            </div>
            <StarRating rating={review.rating} />
          </Stack>
        ))
      ) : (
        <b>No reviews</b>
      )}
      <hr className="border-2" />
    </Stack>
  );
};

export default Reviews;
