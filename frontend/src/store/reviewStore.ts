import { create } from "zustand";
import API from "../api/axios";

const useReviewStore = create<IReviewStore>((set, get) => ({
  reviews: [],
  publicReviews: [],
  loading: false,
  error: null,
  filters: {
    rating: "",
    roomTypeId: "",
    isVisible: "",
    search: "",
  },

  fetchReviews: async () => {
    const { filters } = get();
    set({ loading: true, error: null });

    const queryParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(
          ([_key, value]) => value !== "" && value !== null && value !== undefined
        ) as [string, string][]
      )
    ).toString();

    try {
      const response = await API.get(`/reviews/admin/all?${queryParams}`);
      const normalizedReviews: Review[] = response.data.map((review: any) => ({
        ...review,
        userName: review.user?.name || "Unknown",
        roomTypeName: review.roomType?.type || "Unknown",
        roomTypeId: review.roomType?.id || null,
      }));
      set({ reviews: normalizedReviews, loading: false });
    } catch (err: any) {
      console.error("Fetch error:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch reviews",
        loading: false,
        reviews: [],
      });
    }
  },

  createReview: async (reviewData: { roomTypeId: string; rating: number; comment: string; }) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post("/reviews", reviewData);
      // Optionally, add the new review to the state
      // set((state) => ({ reviews: [...state.reviews, response.data] }));
      return response.data;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create review",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchPublicReviews: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get("/reviews/public");
      const normalizedReviews: Review[] = response.data.map((review: any) => ({
        ...review,
        userName: review.user?.name || "Unknown",
        roomTypeName: review.roomType?.type || "Unknown",
        roomTypeId: review.roomType?.id || null,
      }));
      set({ publicReviews: normalizedReviews, loading: false });
    } catch (err: any) {
      console.error("Fetch public reviews error:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch public reviews",
        loading: false,
        publicReviews: [],
      });
    }
  },

  deleteReview: async (reviewId: string) => {
    try {
      await API.delete(`/reviews/${reviewId}`);
      set((state: IReviewStore) => ({
        reviews: state.reviews.filter((review) => review.id !== reviewId),
      }));
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete review",
      });
      return false;
    }
  },

  toggleReviewVisibility: async (reviewId: string) => {
    try {
      const reviewToUpdate = get().reviews.find((r) => r.id === reviewId);
      if (!reviewToUpdate) return false;

      const updatedReviewResponse = await API.patch(
        `/reviews/${reviewId}/visibility`,
        {
          isVisible: !reviewToUpdate.isVisible,
        }
      );

      set((state: IReviewStore) => ({
        reviews: state.reviews.map((r) =>
          r.id === reviewId
            ? { ...r, isVisible: updatedReviewResponse.data.review.isVisible }
            : r
        ),
      }));
      return true;
    } catch (err: any) {
      set({
        error:
          err.response?.data?.message || "Failed to update review visibility",
      });
      return false;
    }
  },

  setFilters: (newFilters: Partial<IReviewStore['filters']>) => {
    const { fetchReviews } = get();
    set((state: IReviewStore) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    fetchReviews();
  },

  clearFilters: () => {
    const { fetchReviews } = get();
    set({
      filters: {
        rating: "",
        roomTypeId: "",
        isVisible: "",
        search: "",
      },
    });
    fetchReviews();
  },

  fetchReviewsByRoomId: async (roomTypeId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(
        `/reviews/public?roomTypeId=${roomTypeId}`
      );
      const normalizedReviews: Review[] = response.data.map((review: any) => ({
        ...review,
        userName: review.user?.name || "Unknown",
        roomTypeName: review.roomType?.type || "Unknown",
        roomTypeId: review.roomType?.id || null,
      }));
      set({ reviews: normalizedReviews, loading: false });
    } catch (err: any) {
      console.error("Fetch reviews by room ID error:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch reviews",
        loading: false,
        reviews: [],
      });
    }
  },
}));

export default useReviewStore;