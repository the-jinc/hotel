import type { User } from './user';

export interface EditUserFormData extends Partial<Omit<User, 'id'>> {
  // No password field here, as it's optional and handled separately
}

export interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (data: EditUserFormData) => Promise<void>;
}
