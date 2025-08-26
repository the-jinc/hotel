import type { User } from './user';
import type { Room } from './room';

export interface Booking {
  id: string;
  user: User;
  room: Room;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  nights: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  roomPrice: number;
  roomType: {
    id: string;
    type: string;
  };
  // Add other booking properties as needed
}
