
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ScheduleRequest } from '@/types/schedule';

export const useScheduleActions = () => {
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  const sendApprovalEmail = async (scheduleId: number, status: 'approved' | 'rejected', rejectionReason?: string) => {
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

  const handleApproval = async (
    id: number, 
    status: 'approved' | 'rejected', 
    reason: string | undefined,
    onSuccess: (id: number, status: string, reason?: string) => void
  ) => {
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

      onSuccess(id, status, reason);

      const action = status === 'approved' ? 'aprovado' : 'rejeitado';
      toast({
        title: `Agendamento ${action}!`,
        description: `O agendamento foi ${action} com sucesso.`,
        variant: status === 'approved' ? 'default' : 'destructive'
      });

      // Enviar email automaticamente
      await sendApprovalEmail(id, status, reason);
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message || "Não foi possível atualizar o agendamento.",
        variant: "destructive"
      });
    }
  };

  const handleReschedule = async (
    id: number,
    rescheduleDate: Date,
    rescheduleTime: string,
    onSuccess: (id: number, date: string, time: string) => void
  ) => {
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

      const formattedDate = format(rescheduleDate, 'yyyy-MM-dd');
      onSuccess(id, formattedDate, rescheduleTime);

      toast({
        title: "Agendamento reagendado!",
        description: `O agendamento foi reagendado para ${format(rescheduleDate, 'dd/MM/yyyy')} às ${rescheduleTime}.`,
        variant: "default"
      });

      // Enviar email automaticamente
      await sendApprovalEmail(id, 'approved');
    } catch (error: any) {
      console.error('Error rescheduling:', error);
      toast({
        title: "Erro ao reagendar",
        description: error.message || "Não foi possível reagendar o agendamento.",
        variant: "destructive"
      });
    }
  };

  return {
    sendingEmail,
    handleApproval,
    handleReschedule
  };
};
