
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { useScheduleActions } from '@/hooks/useScheduleActions';
import { ScheduleRequest } from '@/types/schedule';
import StatisticsCards from './approval/StatisticsCards';
import PendingRequestCard from './approval/PendingRequestCard';
import ProcessedRequestCard from './approval/ProcessedRequestCard';
import RejectionDialog from './approval/RejectionDialog';
import RescheduleDialog from './approval/RescheduleDialog';

const ApprovalDashboard = () => {
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDeliveryType, setRescheduleDeliveryType] = useState('');
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);

  const { availableTimes, loadingTimes } = useAvailableTimeSlots(rescheduleDate, rescheduleDeliveryType);
  const { sendingEmail, handleApproval, handleReschedule } = useScheduleActions();

  useEffect(() => {
    fetchScheduleRequests();
  }, []);

  const fetchScheduleRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setScheduleRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message || "Não foi possível carregar os agendamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocalState = (id: number, status: string, reason?: string) => {
    setScheduleRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, status, rejection_reason: reason || null }
          : request
      )
    );
  };

  const updateRescheduleState = (id: number, date: string, time: string) => {
    setScheduleRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { 
              ...request, 
              scheduled_date: date,
              scheduled_time: time,
              status: 'approved'
            }
          : request
      )
    );
  };

  const onApprove = (id: number) => {
    handleApproval(id, 'approved', undefined, updateLocalState);
  };

  const onReject = (id: number) => {
    setCurrentRequestId(id);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const onReschedule = (id: number) => {
    const request = scheduleRequests.find(req => req.id === id);
    setCurrentRequestId(id);
    setRescheduleDate(undefined);
    setRescheduleTime('');
    setRescheduleDeliveryType(request?.delivery_type || '');
    setRescheduleDialogOpen(true);
  };

  const confirmRejection = () => {
    if (currentRequestId) {
      handleApproval(currentRequestId, 'rejected', rejectionReason, updateLocalState);
      setRejectDialogOpen(false);
    }
  };

  const confirmReschedule = () => {
    if (currentRequestId && rescheduleDate && rescheduleTime) {
      handleReschedule(currentRequestId, rescheduleDate, rescheduleTime, updateRescheduleState);
      setRescheduleDate(undefined);
      setRescheduleTime('');
      setRescheduleDialogOpen(false);
      setCurrentRequestId(null);
    }
  };

  const pendingRequests = scheduleRequests.filter(req => req.status === 'pending');
  const processedRequests = scheduleRequests.filter(req => req.status !== 'pending');

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p>Carregando agendamentos...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Painel de Aprovação
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gerencie e aprove solicitações de agendamento
          </p>
        </div>

        <StatisticsCards scheduleRequests={scheduleRequests} />

        {/* Pending Requests */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicitações Pendentes</h3>
          <div className="grid gap-6">
            {pendingRequests.map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                sendingEmail={sendingEmail}
                onApprove={onApprove}
                onReject={onReject}
                onReschedule={onReschedule}
              />
            ))}
          </div>
          
          {pendingRequests.length === 0 && (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma solicitação pendente no momento</p>
            </Card>
          )}
        </div>

        {/* Processed Requests */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Solicitações</h3>
          <div className="grid gap-4">
            {processedRequests.map((request) => (
              <ProcessedRequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>

        <RejectionDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={confirmRejection}
          isLoading={sendingEmail === currentRequestId}
        />

        <RescheduleDialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          rescheduleDate={rescheduleDate}
          onDateChange={setRescheduleDate}
          rescheduleTime={rescheduleTime}
          onTimeChange={setRescheduleTime}
          rescheduleDeliveryType={rescheduleDeliveryType}
          onDeliveryTypeChange={setRescheduleDeliveryType}
          availableTimes={availableTimes}
          loadingTimes={loadingTimes}
          onConfirm={confirmReschedule}
          isLoading={sendingEmail === currentRequestId}
        />
      </div>
    </section>
  );
};

export default ApprovalDashboard;
