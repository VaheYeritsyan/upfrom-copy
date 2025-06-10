import { useState } from 'react';

export const useCalendarEvent = (startsAt?: number, endsAt?: number, withCalendarModal = false) => {
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(withCalendarModal);

  return { isCalendarModalVisible, setIsCalendarModalVisible };
};
