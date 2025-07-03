
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Calendar, Truck, User, MessageSquare } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

      setRejectionReason('');
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message || "Não foi possível atualizar o agendamento.",
        variant: "destructive"
      });
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
                      <span>{format(new Date(request.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
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

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleApproval(request.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </DialogTrigger>
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
                              onClick={() => handleApproval(request.id, 'rejected', rejectionReason)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Confirmar Rejeição
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                          {format(new Date(request.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })} às {request.scheduled_time}
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
      </div>
    </section>
  );
};

export default ApprovalDashboard;
