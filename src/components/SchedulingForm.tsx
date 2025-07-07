
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Truck, Package, User, MessageSquare } from 'lucide-react';
import TimeSlotGrid from './TimeSlotGrid';

interface SchedulingFormProps {
  supplierName: string;
  setSupplierName: (value: string) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  deliveryType: string;
  setDeliveryType: (value: string) => void;
  vehicleType: string;
  setVehicleType: (value: string) => void;
  observations: string;
  setObservations: (value: string) => void;
  availableSlots: string[];
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const SchedulingForm = ({
  supplierName,
  setSupplierName,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  deliveryType,
  setDeliveryType,
  vehicleType,
  setVehicleType,
  observations,
  setObservations,
  availableSlots,
  onSubmit,
  isLoading
}: SchedulingFormProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-center">
          <Calendar className="inline-block mr-2" />
          Agendar Entrega
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="supplier" className="flex items-center text-sm font-medium">
              <User className="mr-2 h-4 w-4" />
              Nome do Fornecedor
            </Label>
            <Input
              id="supplier"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Digite o nome do fornecedor"
              required
              className="h-11"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center text-sm font-medium">
                <Calendar className="mr-2 h-4 w-4" />
                Data da Entrega
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <Package className="mr-2 h-4 w-4" />
                Tipo de Entrega
              </Label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="equipamento">Equipamento</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center text-sm font-medium">
              <Truck className="mr-2 h-4 w-4" />
              Tipo de Veículo
            </Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="caminhao">Caminhão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <Clock className="mr-2 h-4 w-4" />
              Horário Disponível
            </Label>
            {availableSlots.length > 0 ? (
              <TimeSlotGrid
                availableSlots={availableSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            ) : (
              <p className="text-center text-gray-500 py-4">
                Não há horários disponíveis para hoje. Selecione uma data futura.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations" className="flex items-center text-sm font-medium">
              <MessageSquare className="mr-2 h-4 w-4" />
              Observações (opcional)
            </Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações adicionais sobre a entrega..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading || !selectedTime}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              <>
                <Calendar className="mr-2 h-5 w-5" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SchedulingForm;
