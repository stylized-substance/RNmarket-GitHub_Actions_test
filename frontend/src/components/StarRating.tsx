const StarRating = ({ rating }: { rating: number }) => {
  const stars = Array(5)
    .fill(null)
    .map((_, index) => {
      const starIsFilled = index < rating;
      return starIsFilled ? (
        <i key={index} className="bi bi-star-fill text-warning fs-5"></i>
      ) : (
        <i key={index} className="bi bi-star text-warning fs-5"></i>
      );
    });

  return <div>{stars}</div>;
};

export default StarRating;
