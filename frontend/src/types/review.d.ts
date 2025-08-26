import type { User } from './user';
import type { Room } from './room';

export interface Review {
  id: string;
  user: User;
  room?: Room; // Made optional as it might not always be present
  rating: number;
  comment: string;
  createdAt: string; // ISO date string
  isVisible: boolean;
  userName?: string; // Optional, for testimonials
  roomTypeName?: string; // Optional, for testimonials
  userImage?: string; // Optional, for testimonials
  roomTypeId?: string; // Optional, for review creation
  roomType?: { id: string; type: string }; // Added for AdminReviewsPage.tsx
  // Add other review properties as needed
}
