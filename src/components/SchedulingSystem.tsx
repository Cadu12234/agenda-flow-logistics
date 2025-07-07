
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Truck } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import SchedulingForm from './SchedulingForm';

const SchedulingSystem = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");
  
  const { availableTimes, occupiedTimes, loadingTimes } = useAvailableTimeSlots(selectedDate, deliveryType);

  // Get all possible times from the hook
  const allTimes = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", 
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", 
    "19:00", "19:30", "20:00"
  ];

  const handleTimeSelect = (time: string) => {
    if (availableTimes.includes(time)) {
      setSelectedTime(time);
    }
  };

  // Função para determinar se um horário deve ser mostrado
  const shouldShowTime = (time: string) => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Se a data selecionada não é hoje, mostrar todos os horários
    if (selectedDateStr !== today) {
      return true;
    }
    
    // Se é hoje, filtrar horários que já passaram
    const currentTime = format(now, 'HH:mm');
    return time > currentTime;
  };

  // Reset time when delivery type changes
  const handleDeliveryTypeChange = (newDeliveryType: string) => {
    setDeliveryType(newDeliveryType);
    setSelectedTime(""); // Reset selected time when delivery type changes
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Agendamento
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Agende sua entrega de forma rápida e eficiente
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Calendar and Time Selection Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Selecione a Data e Horário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border shadow-sm mx-auto"
              />
              
              {/* Time Grid */}
              {selectedDate && deliveryType && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Horários para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                    </h3>
                    {loadingTimes && (
                      <div className="text-sm text-gray-500">Carregando...</div>
                    )}
                  </div>
                  
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    Tipo de entrega selecionado: <strong>{deliveryType}</strong>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {allTimes.map((time) => {
                      const isAvailable = availableTimes.includes(time);
                      const isSelected = selectedTime === time;
                      const isOccupied = occupiedTimes.includes(time);
                      const shouldShow = shouldShowTime(time);
                      
                      // Não mostrar horários que já passaram
                      if (!shouldShow) {
                        return null;
                      }
                      
                      return (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          disabled={!isAvailable || loadingTimes}
                          className={`
                            p-3 rounded-lg font-medium text-sm transition-all duration-200 border-2
                            ${isSelected 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                              : isAvailable 
                                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400 hover:scale-105' 
                                : 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed opacity-75'
                            }
                          `}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            {time}
                          </div>
                          {isOccupied && (
                            <div className="text-xs mt-1">Ocupado</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                      <span className="text-gray-600">Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                      <span className="text-gray-600">Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded"></div>
                      <span className="text-gray-600">Selecionado</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedDate && !deliveryType && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    Selecione o tipo de entrega no formulário para ver os horários disponíveis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Detalhes do Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SchedulingForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                availableTimes={availableTimes}
                deliveryType={deliveryType}
                onDeliveryTypeChange={handleDeliveryTypeChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SchedulingSystem;
