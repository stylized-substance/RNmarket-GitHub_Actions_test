import { backendAddress } from '#src/utils/config';
import axios from 'axios';
import { ReviewFromBackend, NewReview, LoginPayload } from '#src/types/types';
import { isApiErrorResponse } from '#src/utils/typeNarrowers';

const baseUrl = process.env.NODE_ENV === 'production' ? '/api/reviews' : `${backendAddress}/api/reviews`;

const getAllForProduct = async (
  productId: string
): Promise<ReviewFromBackend[]> => {
  try {
    const response = await axios.get<{ reviews: ReviewFromBackend[] }>(
      `${baseUrl}/?product_id=${productId}`
    );
    return response.data.reviews;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while getting reviews');
    }
  }
};

const postNew = async (
  review: NewReview,
  loggedOnUser?: LoginPayload
): Promise<ReviewFromBackend> => {
  if (!loggedOnUser) {
    throw new Error('Not logged in');
  }

  try {
    const response = await axios.post<{ addedReview: ReviewFromBackend }>(
      baseUrl,
      review,
      {
        headers: {
          Authorization: `Bearer ${loggedOnUser.accessToken}`
        }
      }
    );

    return response.data.addedReview;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while posting review');
    }
  }
};

export default { getAllForProduct, postNew };
