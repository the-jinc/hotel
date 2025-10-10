import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  roomId: string;
  roomNumber: string;
  categoryName: string;
  checkinDate: string;
  checkoutDate: string;
  guests: number;
  pricePerNight: number;
  totalNights: number;
  totalPrice: number;
}

export interface FoodCartItem {
  id: string;
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
}

export interface SelectedRoom {
  id: string;
  roomNumber: string;
  categoryName: string;
  categoryDescription: string;
  basePrice: number;
}

interface CartStore {
  // Legacy cart items (keeping for compatibility)
  items: CartItem[];
  addToCart: (
    item: Omit<CartItem, "totalPrice"> & { totalPrice?: number }
  ) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;

  // Food cart properties
  foodItems: FoodCartItem[];

  // Food cart actions
  addFoodToCart: (item: Omit<FoodCartItem, "id">) => void;
  removeFoodFromCart: (itemId: string) => void;
  updateFoodQuantity: (itemId: string, quantity: number) => void;
  updateFoodInstructions: (itemId: string, specialInstructions: string) => void;
  clearFoodCart: () => void;
  getFoodTotalPrice: () => number;
  getFoodItemCount: () => number;

  // New booking flow properties
  checkInDate: string | null;
  checkOutDate: string | null;
  guestCount: number | null;
  selectedRooms: SelectedRoom[];
  specialRequests: string;

  // New booking flow actions
  setSearchCriteria: (
    checkIn: string,
    checkOut: string,
    guests: number
  ) => void;
  addSelectedRoom: (room: SelectedRoom) => void;
  removeSelectedRoom: (roomId: string) => void;
  setSpecialRequests: (requests: string) => void;
  clearBookingData: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Legacy cart properties
      items: [],

      // Food cart properties
      foodItems: [],

      // New booking flow properties
      checkInDate: null,
      checkOutDate: null,
      guestCount: null,
      selectedRooms: [],
      specialRequests: "",

      // Legacy cart methods
      addToCart: (item) => {
        const totalPrice =
          item.totalPrice ?? item.totalNights * item.pricePerNight;

        set((state) => {
          // Check if room for same dates already exists
          const existingIndex = state.items.findIndex(
            (existingItem) =>
              existingItem.roomId === item.roomId &&
              existingItem.checkinDate === item.checkinDate &&
              existingItem.checkoutDate === item.checkoutDate
          );

          if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = { ...item, totalPrice };
            return { items: updatedItems };
          } else {
            // Add new item
            return {
              items: [...state.items, { ...item, totalPrice }],
            };
          }
        });
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          foodItems: [],
          checkInDate: null,
          checkOutDate: null,
          guestCount: null,
          selectedRooms: [],
          specialRequests: "",
        });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },

      // Food cart methods
      addFoodToCart: (item) => {
        set((state) => {
          const existingIndex = state.foodItems.findIndex(
            (existing) => existing.foodItemId === item.foodItemId
          );

          if (existingIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...state.foodItems];
            updatedItems[existingIndex].quantity += item.quantity;
            return { foodItems: updatedItems };
          } else {
            // Add new item with unique ID
            const newItem: FoodCartItem = {
              ...item,
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
            };
            return {
              foodItems: [...state.foodItems, newItem],
            };
          }
        });
      },

      removeFoodFromCart: (itemId) => {
        set((state) => ({
          foodItems: state.foodItems.filter((item) => item.id !== itemId),
        }));
      },

      updateFoodQuantity: (itemId, quantity) => {
        set((state) => ({
          foodItems: state.foodItems
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      updateFoodInstructions: (itemId, specialInstructions) => {
        set((state) => ({
          foodItems: state.foodItems.map((item) =>
            item.id === itemId ? { ...item, specialInstructions } : item
          ),
        }));
      },

      clearFoodCart: () => {
        set((state) => ({ ...state, foodItems: [] }));
      },

      getFoodTotalPrice: () => {
        return get().foodItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getFoodItemCount: () => {
        return get().foodItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      // New booking flow methods
      setSearchCriteria: (checkIn, checkOut, guests) => {
        set({
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestCount: guests,
        });
      },

      addSelectedRoom: (room) => {
        set((state) => {
          // Check if room is already selected
          const isAlreadySelected = state.selectedRooms.some(
            (r) => r.id === room.id
          );
          if (isAlreadySelected) return state;

          return {
            selectedRooms: [...state.selectedRooms, room],
          };
        });
      },

      removeSelectedRoom: (roomId) => {
        set((state) => ({
          selectedRooms: state.selectedRooms.filter(
            (room) => room.id !== roomId
          ),
        }));
      },

      setSpecialRequests: (requests) => {
        set({ specialRequests: requests });
      },

      clearBookingData: () => {
        set({
          checkInDate: null,
          checkOutDate: null,
          guestCount: null,
          selectedRooms: [],
          specialRequests: "",
        });
      },
    }),
    {
      name: "hotel-cart-storage",
      partialize: (state) => ({
        items: state.items,
        foodItems: state.foodItems,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        guestCount: state.guestCount,
        selectedRooms: state.selectedRooms,
        specialRequests: state.specialRequests,
      }),
    }
  )
);
