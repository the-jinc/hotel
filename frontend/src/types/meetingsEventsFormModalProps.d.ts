import type { MeetingAndEvent } from './meetingAndEvent';

export interface MeetingsEventsFormData {
  name: string;
  description: string;
  capacity: number;
  eventType: string;
  images?: string[];
}

export interface MeetingsEventsFormModalProps {
  isOpen: boolean;
  event: MeetingAndEvent | null;
  onClose: () => void;
  onSubmit: (data: MeetingsEventsFormData) => Promise<void>;
}
