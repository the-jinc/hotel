declare module 'react-date-range' {
  import * as React from 'react';

  export interface Range {
    startDate: Date;
    endDate: Date;
    key: string;
  }

  export interface DateRangePickerProps {
    ranges: Range[];
    onChange: (item: { selection: Range }) => void;
    showSelectionPreview?: boolean;
    moveRangeOnFirstSelection?: boolean;
    months?: number;
    direction?: 'horizontal' | 'vertical';
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    rangeColors?: string[]; // Added missing property
    // Add other props as needed
  }

  export class DateRangePicker extends React.Component<DateRangePickerProps> {}
  export class DateRange extends React.Component<DateRangePickerProps> {}
}
