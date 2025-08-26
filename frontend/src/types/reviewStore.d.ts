import type { Review } from './review';

export interface IReviewStore {
  reviews: Review[];
  publicReviews: Review[];
  loading: boolean;
  error: string | null;
  filters: {
    rating: string | number;
    roomTypeId: string;
    isVisible: string; // Added isVisible to filters
    search: string;
  };
  fetchReviews: () => Promise<void>;
  fetchPublicReviews: () => Promise<void>;
  createReview: (reviewData: { roomTypeId: string; rating: number; comment: string; }) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<boolean>; // Changed return type
  toggleReviewVisibility: (reviewId: string) => Promise<boolean>; // Changed return type
  setFilters: (newFilters: Partial<IReviewStore['filters']>) => void;
  clearFilters: () => void;
  fetchReviewsByRoomId: (roomTypeId: string) => Promise<void>;
}
