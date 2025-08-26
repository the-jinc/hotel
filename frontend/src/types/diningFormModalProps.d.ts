import type { Dining } from './dining';

export interface DiningFormData {
  name: string;
  description: string;
  images?: string[];
}

export interface DiningFormModalProps {
  isOpen: boolean;
  dining: Dining | null;
  onClose: () => void;
  onSubmit: (data: DiningFormData) => Promise<void>;
}
