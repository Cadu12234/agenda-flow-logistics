
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rescheduleDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  rescheduleTime: string;
  onTimeChange: (time: string) => void;
  rescheduleDeliveryType: string;
  onDeliveryTypeChange: (type: string) => void;
  availableTimes: string[];
  loadingTimes: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

const RescheduleDialog = ({
  open,
  onOpenChange,
  rescheduleDate,
  onDateChange,
  rescheduleTime,
  onTimeChange,
  rescheduleDeliveryType,
  onDeliveryTypeChange,
  availableTimes,
  loadingTimes,
  onConfirm,
  isLoading
}: RescheduleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Entrega:</label>
            <select
              value={rescheduleDeliveryType}
              onChange={(e) => {
                onDeliveryTypeChange(e.target.value);
                onTimeChange(''); // Reset time when delivery type changes
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione o tipo de entrega</option>
              <option value="materias-primas">Matérias-primas</option>
              <option value="inflamavel">Inflamável</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nova Data:</label>
            <input
              type="date"
              value={rescheduleDate ? format(rescheduleDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(new Date(e.target.value + 'T00:00:00'));
                } else {
                  onDateChange(undefined);
                }
                onTimeChange(''); // Reset time when date changes
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Novo Horário:</label>
            {loadingTimes && <p className="text-sm text-gray-500">Carregando horários...</p>}
            <select
              value={rescheduleTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loadingTimes || !rescheduleDate || !rescheduleDeliveryType}
            >
              <option value="">Selecione um horário</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {rescheduleDate && rescheduleDeliveryType && availableTimes.length === 0 && !loadingTimes && (
              <p className="text-sm text-red-500 mt-1">Nenhum horário disponível para esta data e tipo de entrega</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !rescheduleDate || !rescheduleTime || !rescheduleDeliveryType}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {isLoading ? 'Reagendando...' : 'Confirmar Reagendamento'}
              {isLoading && <Mail className="h-4 w-4 ml-2 animate-pulse" />}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
