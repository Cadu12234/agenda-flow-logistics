import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Truck, User } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SchedulingSystem = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const { user } = useAuth();

  const allTimes = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const fetchAvailableTimes = async (date: Date) => {
    setLoadingTimes(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log('Fetching schedules for date:', formattedDate); // Debug log
      
      // Buscar agendamentos aprovados para a data selecionada
      const { data: existingSchedules, error } = await supabase
        .from('schedules')
        .select('scheduled_time')
        .eq('scheduled_date', formattedDate)
        .eq('status', 'approved');

      if (error) {
        throw error;
      }

      console.log('Existing schedules:', existingSchedules); // Debug log

      // Extrair horários já ocupados e normalizar formato
      const occupiedTimes = existingSchedules?.map(schedule => {
        // Converter formato HH:MM:SS para HH:MM
        const time = schedule.scheduled_time;
        return time.length > 5 ? time.substring(0, 5) : time;
      }) || [];
      
      console.log('Occupied times:', occupiedTimes); // Debug log
      
      // Filtrar horários disponíveis
      const available = allTimes.filter(time => !occupiedTimes.includes(time));
      
      console.log('Available times:', available); // Debug log
      
      setAvailableTimes(available);
      setOccupiedTimes(occupiedTimes);
      
      // Se o horário selecionado não está mais disponível, limpar seleção
      if (selectedTime && occupiedTimes.includes(selectedTime)) {
        setSelectedTime("");
      }
    } catch (error: any) {
      console.error('Error fetching available times:', error);
      toast({
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive"
      });
      // Em caso de erro, mostrar todos os horários
      setAvailableTimes(allTimes);
      setOccupiedTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  // Carregar horários disponíveis quando a data muda
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  // Configurar real-time para atualizar horários quando houver mudanças
  useEffect(() => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    console.log('Setting up realtime for date:', formattedDate); // Debug log
    
    const channel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        (payload) => {
          console.log('Realtime update received:', payload); // Debug log
          // Recarregar horários disponíveis quando houver mudanças
          fetchAvailableTimes(selectedDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !supplierName || !vehicleType || !deliveryType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para agendar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('schedules')
        .insert({
          user_id: user.id,
          supplier_name: supplierName,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          vehicle_type: vehicleType,
          delivery_type: deliveryType,
          observations: observations || null,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Agendamento solicitado!",
        description: `Agendamento para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime} enviado para aprovação.`,
      });

      // Reset form
      setSelectedTime("");
      setSupplierName("");
      setVehicleType("");
      setDeliveryType("");
      setObservations("");
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Erro ao agendar",
        description: error.message || "Ocorreu um erro ao criar o agendamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (availableTimes.includes(time)) {
      setSelectedTime(time);
    }
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
              {selectedDate && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Horários para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                    </h3>
                    {loadingTimes && (
                      <div className="text-sm text-gray-500">Carregando...</div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {allTimes.map((time) => {
                      const isAvailable = availableTimes.includes(time);
                      const isSelected = selectedTime === time;
                      const isOccupied = occupiedTimes.includes(time);
                      
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
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome do Fornecedor *
                </Label>
                <Input
                  id="supplier"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Digite o nome do fornecedor"
                  className="border-gray-300 focus:border-green-500"
                />
              </div>

              {selectedTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Horário selecionado: {selectedTime}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipo de Veículo *</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500">
                    <SelectValue placeholder="Selecione o tipo de veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="caminhao-pequeno">Caminhão Pequeno</SelectItem>
                    <SelectItem value="caminhao-medio">Caminhão Médio</SelectItem>
                    <SelectItem value="caminhao-grande">Caminhão Grande</SelectItem>
                    <SelectItem value="carreta">Carreta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Entrega *</Label>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500">
                    <SelectValue placeholder="Selecione o tipo de entrega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materias-primas">Matérias-primas</SelectItem>
                    <SelectItem value="produtos-acabados">Produtos Acabados</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="insumos">Insumos</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais sobre a entrega..."
                  className="border-gray-300 focus:border-green-500 min-h-[80px]"
                />
              </div>

              <Button 
                onClick={handleSchedule}
                disabled={loading || !selectedTime || !supplierName || !vehicleType || !deliveryType}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Enviando...' : 'Solicitar Agendamento'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SchedulingSystem;
