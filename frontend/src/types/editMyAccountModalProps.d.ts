import type { User } from './user';

export interface EditMyAccountFormData extends Partial<Omit<User, 'id' | 'role'>> {
  password?: string;
}

export interface EditMyAccountModalProps {
  user: User;
  onClose: () => void;
  onSave: (data: EditMyAccountFormData) => Promise<void>;
}
