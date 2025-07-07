
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import SchedulingForm from './SchedulingForm';

const SchedulingSystem = () => {
  const [supplierName, setSupplierName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const availableSlots = useAvailableTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('schedules')
        .insert({
          supplier_name: supplierName,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          delivery_type: deliveryType,
          vehicle_type: vehicleType,
          observations: observations || null,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Agendamento enviado!",
        description: "Seu agendamento foi enviado para aprovação.",
      });

      // Reset form
      setSupplierName('');
      setSelectedDate('');
      setSelectedTime('');
      setDeliveryType('');
      setVehicleType('');
      setObservations('');
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Sistema de Agendamento
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agende sua entrega de forma rápida e eficiente. 
            Preencha os dados abaixo e aguarde a aprovação.
          </p>
        </div>

        <SchedulingForm
          supplierName={supplierName}
          setSupplierName={setSupplierName}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          deliveryType={deliveryType}
          setDeliveryType={setDeliveryType}
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          observations={observations}
          setObservations={setObservations}
          availableSlots={availableSlots}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default SchedulingSystem;
