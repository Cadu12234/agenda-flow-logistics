
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Calendar, Truck, User, MessageSquare, Mail, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScheduleRequest } from '@/types/schedule';
import StatusBadge from './StatusBadge';
import { formatDisplayDate } from '@/utils/dateUtils';

interface PendingRequestCardProps {
  request: ScheduleRequest;
  sendingEmail: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onReschedule: (id: number) => void;
}

const PendingRequestCard = ({ request, sendingEmail, onApprove, onReject, onReschedule }: PendingRequestCardProps) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {request.supplier_name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Solicitado em: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Data:</span>
            <span>{formatDisplayDate(request.scheduled_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Horário:</span>
            <span>{request.scheduled_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Veículo:</span>
            <span>{request.vehicle_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Tipo:</span>
            <span>{request.delivery_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Ordem de Compra:</span>
            <span>{request.purchase_order}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Qtd. Pallet:</span>
            <span>{request.pallet_quantity}</span>
          </div>
        </div>
        
        {request.observations && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-sm text-gray-700">Observações:</span>
                <p className="text-sm text-gray-600 mt-1">{request.observations}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={() => onApprove(request.id)}
            className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
            disabled={sendingEmail === request.id}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {sendingEmail === request.id ? 'Enviando...' : 'Aprovar'}
            {sendingEmail === request.id && <Mail className="h-4 w-4 ml-2 animate-pulse" />}
          </Button>
          
          <Button 
            onClick={() => onReject(request.id)}
            variant="outline" 
            className="flex-1 min-w-[120px] border-red-300 text-red-600 hover:bg-red-50"
            disabled={sendingEmail === request.id}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>

          <Button 
            onClick={() => onReschedule(request.id)}
            variant="outline" 
            className="flex-1 min-w-[120px] border-blue-300 text-blue-600 hover:bg-blue-50"
            disabled={sendingEmail === request.id}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Reagendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingRequestCard;
