import { Review } from './review';

export interface Room {
  id: string;
  type?: string;
  price?: number;
  quantity?: number;
  images?: string[];
  description?: string;
  reviews?: Review[];
  amenities?: string[];
  // Add other room properties as needed
}
