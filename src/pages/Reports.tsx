import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScheduleRequest } from '@/types/schedule';
import { formatDisplayDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatusBadge from '@/components/approval/StatusBadge';
import Navigation from '@/components/Navigation';

const Reports = () => {
  const [schedules, setSchedules] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [todaySchedules, setTodaySchedules] = useState<ScheduleRequest[]>([]);
  const [activeSection, setActiveSection] = useState('reports');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSchedules(data || []);
      
      // Filtrar agendamentos de hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayData = (data || []).filter(schedule => schedule.scheduled_date === today);
      setTodaySchedules(todayData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de status
  const statusData = [
    { name: 'Pendente', value: schedules.filter(s => s.status === 'pending').length, color: '#f59e0b' },
    { name: 'Aprovado', value: schedules.filter(s => s.status === 'approved').length, color: '#10b981' },
    { name: 'Rejeitado', value: schedules.filter(s => s.status === 'rejected').length, color: '#ef4444' }
  ];

  // Dados para gráfico de agendamentos por dia
  const dailyData = schedules.reduce((acc: any[], schedule) => {
    const date = formatDisplayDate(schedule.scheduled_date);
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.total += 1;
    } else {
      acc.push({ date, total: 1 });
    }
    
    return acc;
  }, []).slice(0, 7); // Últimos 7 dias

  // Dados para gráfico de tipos de entrega
  const deliveryTypeData = schedules.reduce((acc: any[], schedule) => {
    const existing = acc.find(item => item.type === schedule.delivery_type);
    
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: schedule.delivery_type, count: 1 });
    }
    
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Relatórios e Agendamentos
          </h1>
          <p className="text-xl text-gray-600">
            Visão geral dos agendamentos e estatísticas
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {schedules.filter(s => s.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {schedules.filter(s => s.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {todaySchedules.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Tipos de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Agendamentos por Dia */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Agendamentos por Dia (Últimos 7 registros)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agendamentos de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos de Hoje ({format(new Date(), 'dd/MM/yyyy', { locale: ptBR })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedules.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Nenhum agendamento para hoje
              </p>
            ) : (
              <div className="space-y-4">
                {todaySchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">ID: {schedule.id}</h3>
                        <p className="text-gray-600">{schedule.supplier_name}</p>
                      </div>
                      <StatusBadge status={schedule.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p><strong>Horário:</strong> {schedule.scheduled_time}</p>
                        <p><strong>Veículo:</strong> {schedule.vehicle_type}</p>
                      </div>
                      <div>
                        <p><strong>Tipo:</strong> {schedule.delivery_type}</p>
                        <p><strong>OC:</strong> {schedule.purchase_order}</p>
                      </div>
                      <div>
                        <p><strong>Pallets:</strong> {schedule.pallet_quantity}</p>
                        <p><strong>Criado:</strong> {format(new Date(schedule.created_at), 'HH:mm', { locale: ptBR })}</p>
                      </div>
                    </div>
                    
                    {schedule.observations && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm"><strong>Observações:</strong> {schedule.observations}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Reports;