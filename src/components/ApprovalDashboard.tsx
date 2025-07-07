import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Calendar, Truck, User, MessageSquare, Mail, CalendarDays } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';

interface ScheduleRequest {
  id: string;
  supplier_name: string;
  scheduled_date: string;
  scheduled_time: string;
  vehicle_type: string;
  delivery_type: string;
  observations: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

const ApprovalDashboard = () => {
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDeliveryType, setRescheduleDeliveryType] = useState('');
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Hook para horários disponíveis na data de reagendamento com tipo de entrega
  const { availableTimes, loadingTimes } = useAvailableTimeSlots(rescheduleDate, rescheduleDeliveryType);

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

  const sendApprovalEmail = async (scheduleId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      setSendingEmail(scheduleId);
      
      console.log('Sending email for schedule:', scheduleId, 'with status:', status);
      
      const { data, error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          scheduleId,
          status,
          rejectionReason
        }
      });

      if (error) {
        throw error;
      }

      console.log('Email sent successfully:', data);
      
      toast({
        title: "📧 Email enviado!",
        description: "O usuário foi notificado por email sobre a decisão.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Erro ao enviar email",
        description: "A decisão foi salva, mas houve problema no envio do email.",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'rejected' && reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setScheduleRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status, rejection_reason: reason || null }
            : request
        )
      );

      const action = status === 'approved' ? 'aprovado' : 'rejeitado';
      toast({
        title: `Agendamento ${action}!`,
        description: `O agendamento foi ${action} com sucesso.`,
        variant: status === 'approved' ? 'default' : 'destructive'
      });

      // Enviar email automaticamente
      await sendApprovalEmail(id, status, reason);

      setRejectionReason('');
      setRejectDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message || "Não foi possível atualizar o agendamento.",
        variant: "destructive"
      });
    }
  };

  const handleReschedule = async (id: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data e horário para reagendar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .update({ 
          scheduled_date: format(rescheduleDate, 'yyyy-MM-dd'),
          scheduled_time: rescheduleTime,
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setScheduleRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { 
                ...request, 
                scheduled_date: format(rescheduleDate, 'yyyy-MM-dd'),
                scheduled_time: rescheduleTime,
                status: 'approved'
              }
            : request
        )
      );

      toast({
        title: "Agendamento reagendado!",
        description: `O agendamento foi reagendado para ${format(rescheduleDate, 'dd/MM/yyyy', { locale: ptBR })} às ${rescheduleTime}.`,
        variant: "default"
      });

      // Enviar email automaticamente
      await sendApprovalEmail(id, 'approved');

      // Reset form
      setRescheduleDate(undefined);
      setRescheduleTime('');
      setRescheduleDialogOpen(false);
      setCurrentRequestId(null);
    } catch (error: any) {
      console.error('Error rescheduling:', error);
      toast({
        title: "Erro ao reagendar",
        description: error.message || "Não foi possível reagendar o agendamento.",
        variant: "destructive"
      });
    }
  };

  const openRescheduleDialog = (requestId: string) => {
    const request = scheduleRequests.find(req => req.id === requestId);
    setCurrentRequestId(requestId);
    setRescheduleDate(undefined);
    setRescheduleTime('');
    setRescheduleDeliveryType(request?.delivery_type || '');
    setRescheduleDialogOpen(true);
  };

  const openRejectDialog = (requestId: string) => {
    setCurrentRequestId(requestId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  // Função para formatar data corretamente
  const formatDisplayDate = (dateString: string) => {
    try {
      // Parse da string de data ISO
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Aprovado
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejeitado
        </Badge>;
      default:
        return null;
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

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Pendentes</p>
                  <p className="text-3xl font-bold">{pendingRequests.length}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Aprovados</p>
                  <p className="text-3xl font-bold">
                    {scheduleRequests.filter(req => req.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Rejeitados</p>
                  <p className="text-3xl font-bold">
                    {scheduleRequests.filter(req => req.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-12 w-12 text-red-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicitações Pendentes</h3>
          <div className="grid gap-6">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    {getStatusBadge(request.status)}
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
                      onClick={() => handleApproval(request.id, 'approved')}
                      className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
                      disabled={sendingEmail === request.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {sendingEmail === request.id ? 'Enviando...' : 'Aprovar'}
                      {sendingEmail === request.id && <Mail className="h-4 w-4 ml-2 animate-pulse" />}
                    </Button>
                    
                    <Button 
                      onClick={() => openRejectDialog(request.id)}
                      variant="outline" 
                      className="flex-1 min-w-[120px] border-red-300 text-red-600 hover:bg-red-50"
                      disabled={sendingEmail === request.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>

                    <Button 
                      onClick={() => openRescheduleDialog(request.id)}
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
              <Card key={request.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{request.supplier_name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDisplayDate(request.scheduled_date)} às {request.scheduled_time}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dialog for Rejection */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Informe o motivo da rejeição:</p>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Motivo da rejeição..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => currentRequestId && handleApproval(currentRequestId, 'rejected', rejectionReason)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={sendingEmail === currentRequestId || !rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {sendingEmail === currentRequestId ? 'Enviando...' : 'Confirmar Rejeição'}
                  {sendingEmail === currentRequestId && <Mail className="h-4 w-4 ml-2 animate-pulse" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setRejectDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog for Rescheduling */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
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
                    setRescheduleDeliveryType(e.target.value);
                    setRescheduleTime(''); // Reset time when delivery type changes
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
                      setRescheduleDate(new Date(e.target.value + 'T00:00:00'));
                    } else {
                      setRescheduleDate(undefined);
                    }
                    setRescheduleTime(''); // Reset time when date changes
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
                  onChange={(e) => setRescheduleTime(e.target.value)}
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
                  onClick={() => currentRequestId && handleReschedule(currentRequestId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={sendingEmail === currentRequestId || !rescheduleDate || !rescheduleTime || !rescheduleDeliveryType}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {sendingEmail === currentRequestId ? 'Reagendando...' : 'Confirmar Reagendamento'}
                  {sendingEmail === currentRequestId && <Mail className="h-4 w-4 ml-2 animate-pulse" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setRescheduleDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ApprovalDashboard;
