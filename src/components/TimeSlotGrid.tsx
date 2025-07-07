
import React from 'react';
import { Button } from "@/components/ui/button";

interface TimeSlotGridProps {
  availableSlots: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const TimeSlotGrid = ({ availableSlots, selectedTime, onTimeSelect }: TimeSlotGridProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {availableSlots.map((time) => (
        <Button
          key={time}
          variant={selectedTime === time ? "default" : "outline"}
          onClick={() => onTimeSelect(time)}
          className="h-10"
        >
          {time}
        </Button>
      ))}
    </div>
  );
};

export default TimeSlotGrid;
