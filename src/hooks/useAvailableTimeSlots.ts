
import { useState, useEffect } from 'react';

export const useAvailableTimeSlots = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Only show future time slots
        if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
          slots.push(timeString);
        }
      }
    }
    
    return slots;
  };

  useEffect(() => {
    const updateSlots = () => {
      setAvailableSlots(generateTimeSlots());
    };

    // Update immediately
    updateSlots();

    // Update every minute
    const interval = setInterval(updateSlots, 60000);

    return () => clearInterval(interval);
  }, []);

  return availableSlots;
};
