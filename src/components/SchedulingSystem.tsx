
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
      
      // Buscar agendamentos aprovados para a data selecionada
      const { data: existingSchedules, error } = await supabase
        .from('schedules')
        .select('scheduled_time')
        .eq('scheduled_date', formattedDate)
        .eq('status', 'approved');

      if (error) {
        throw error;
      }

      // Extrair horários já ocupados
      const occupiedTimes = existingSchedules?.map(schedule => schedule.scheduled_time) || [];
      
      // Filtrar horários disponíveis
      const available = allTimes.filter(time => !occupiedTimes.includes(time));
      
      setAvailableTimes(available);
      
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
    
    const channel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `scheduled_date=eq.${formattedDate}`
        },
        () => {
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
          {/* Calendar Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Selecione a Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border shadow-sm"
              />
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

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário *
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={loadingTimes}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500">
                    <SelectValue placeholder={loadingTimes ? "Carregando horários..." : "Selecione o horário"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.length === 0 && !loadingTimes ? (
                      <SelectItem value="" disabled>
                        Nenhum horário disponível
                      </SelectItem>
                    ) : (
                      availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedDate && (
                  <p className="text-sm text-gray-500">
                    {availableTimes.length} horário(s) disponível(is) para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>

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
                disabled={loading || availableTimes.length === 0}
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
