import type { Room } from './room';
import type { User } from './user';
import type { Review } from './review';

export interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  currentUser: User | null;
}
