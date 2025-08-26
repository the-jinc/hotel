import type { Room } from './room';

export interface RoomFormData {
  type: string;
  price: number;
  quantity: number;
  description: string;
  images?: string[];
}

export interface RoomFormModalProps {
  room: Room | null;
  onClose: () => void;
}
