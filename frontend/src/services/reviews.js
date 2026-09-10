import {
  getProductReviews as getProductReviewsRequest,
  createReview as createReviewRequest,
  updateReview as updateReviewRequest,
  deleteReview as deleteReviewRequest,
} from './api';

export const getProductReviews = async (productId) => {
  const result = await getProductReviewsRequest(productId);
  return result.data;
};

export const createReview = async (reviewData) => {
  const result = await createReviewRequest(reviewData);
  return result.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const result = await updateReviewRequest(
    reviewId,
    reviewData
  );

  return result.data;
};

export const deleteReview = async (reviewId) => {
  return deleteReviewRequest(reviewId);
};