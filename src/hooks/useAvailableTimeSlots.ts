
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const allTimes = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

export const useAvailableTimeSlots = (selectedDate: Date | undefined) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Função para filtrar horários baseado na hora atual
  const getFilteredTimes = (times: string[], selectedDate: Date) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Se a data selecionada não é hoje, mostrar todos os horários
    if (selectedDateStr !== today) {
      return times;
    }
    
    // Se é hoje, filtrar horários que já passaram
    const currentTime = format(now, 'HH:mm');
    return times.filter(time => time > currentTime);
  };

  const fetchAvailableTimes = async (date: Date) => {
    setLoadingTimes(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log('Fetching schedules for date:', formattedDate);
      
      // Buscar agendamentos aprovados E pendentes para a data selecionada
      const { data: existingSchedules, error } = await supabase
        .from('schedules')
        .select('scheduled_time')
        .eq('scheduled_date', formattedDate)
        .in('status', ['approved', 'pending']); // Incluir tanto aprovados quanto pendentes

      if (error) {
        throw error;
      }

      console.log('Existing schedules:', existingSchedules);

      // Extrair horários já ocupados e normalizar formato
      const occupiedTimes = existingSchedules?.map(schedule => {
        const time = schedule.scheduled_time;
        return time.length > 5 ? time.substring(0, 5) : time;
      }) || [];
      
      console.log('Occupied times:', occupiedTimes);
      
      // Filtrar horários baseado na hora atual
      const filteredTimes = getFilteredTimes(allTimes, date);
      
      // Filtrar horários disponíveis (não ocupados e não passados)
      const available = filteredTimes.filter(time => !occupiedTimes.includes(time));
      
      console.log('Available times:', available);
      
      setAvailableTimes(available);
      setOccupiedTimes(occupiedTimes);
    } catch (error: any) {
      console.error('Error fetching available times:', error);
      toast({
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive"
      });
      // Em caso de erro, mostrar horários filtrados por tempo
      const filteredTimes = getFilteredTimes(allTimes, date);
      setAvailableTimes(filteredTimes);
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

  // Atualizar horários a cada minuto para remover horários que passaram
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDate) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Só atualizar se a data selecionada é hoje
        if (selectedDateStr === today) {
          fetchAvailableTimes(selectedDate);
        }
      }
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [selectedDate]);

  // Configurar real-time para atualizar horários quando houver mudanças
  useEffect(() => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    console.log('Setting up realtime for date:', formattedDate);
    
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
          console.log('Realtime update received:', payload);
          fetchAvailableTimes(selectedDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return {
    availableTimes,
    occupiedTimes,
    loadingTimes,
    refetch: () => selectedDate && fetchAvailableTimes(selectedDate)
  };
};
