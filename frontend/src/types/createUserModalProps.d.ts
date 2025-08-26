import type { User } from './user';

export interface CreateUserFormData extends Omit<User, 'id' | 'role'> {
  password?: string;
  role: 'user' | 'admin';
}

export interface CreateUserModalProps {
  onClose: () => void;
  onSave: (data: CreateUserFormData) => Promise<void>;
}
