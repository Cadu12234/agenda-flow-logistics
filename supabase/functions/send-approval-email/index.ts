
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  scheduleId: number;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scheduleId, status, rejectionReason }: ApprovalEmailRequest = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar os dados do agendamento
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (scheduleError || !scheduleData) {
      throw new Error('Agendamento não encontrado');
    }

    // Buscar o email do usuário
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(scheduleData.user_id);

    if (userError || !userData?.user?.email) {
      throw new Error('Usuário não encontrado');
    }

    const userEmail = userData.user.email;

    // Formatar data e hora para exibição
    const formattedDate = new Date(scheduleData.scheduled_date).toLocaleDateString('pt-BR');
    const formattedTime = scheduleData.scheduled_time;

    let subject = '';
    let htmlContent = '';

    if (status === 'approved') {
      subject = `✅ Agendamento Aprovado - ID: ${scheduleData.id}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Agendamento Aprovado!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
            <h2 style="color: #059669; margin-top: 0;">Detalhes do Seu Agendamento</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 10px 0;"><strong>🆔 ID do Agendamento:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${scheduleData.id}</code></p>
              <p style="margin: 10px 0;"><strong>🏢 Fornecedor:</strong> ${scheduleData.supplier_name}</p>
              <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>⏰ Horário:</strong> ${formattedTime}</p>
              <p style="margin: 10px 0;"><strong>🚛 Tipo de Veículo:</strong> ${scheduleData.vehicle_type}</p>
              <p style="margin: 10px 0;"><strong>📦 Tipo de Entrega:</strong> ${scheduleData.delivery_type}</p>
              <p style="margin: 10px 0;"><strong>📋 Ordem de Compra:</strong> ${scheduleData.purchase_order}</p>
              <p style="margin: 10px 0;"><strong>📊 Quantidade de Pallet:</strong> ${scheduleData.pallet_quantity}</p>
              ${scheduleData.observations ? `<p style="margin: 10px 0;"><strong>📝 Observações:</strong> ${scheduleData.observations}</p>` : ''}
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #059669;"><strong>✅ Status:</strong> Seu agendamento foi aprovado e está confirmado!</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Guarde este email como comprovante do seu agendamento. Em caso de dúvidas, utilize o ID do agendamento para referência.
            </p>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">Sistema de Agendamento</p>
          </div>
        </div>
      `;
    } else {
      subject = `❌ Agendamento Rejeitado - ID: ${scheduleData.id}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">❌ Agendamento Rejeitado</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
            <h2 style="color: #dc2626; margin-top: 0;">Detalhes do Agendamento</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 10px 0;"><strong>🆔 ID do Agendamento:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${scheduleData.id}</code></p>
              <p style="margin: 10px 0;"><strong>🏢 Fornecedor:</strong> ${scheduleData.supplier_name}</p>
              <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>⏰ Horário:</strong> ${formattedTime}</p>
              <p style="margin: 10px 0;"><strong>🚛 Tipo de Veículo:</strong> ${scheduleData.vehicle_type}</p>
              <p style="margin: 10px 0;"><strong>📦 Tipo de Entrega:</strong> ${scheduleData.delivery_type}</p>
              <p style="margin: 10px 0;"><strong>📋 Ordem de Compra:</strong> ${scheduleData.purchase_order}</p>
              <p style="margin: 10px 0;"><strong>📊 Quantidade de Pallet:</strong> ${scheduleData.pallet_quantity}</p>
              ${scheduleData.observations ? `<p style="margin: 10px 0;"><strong>📝 Observações:</strong> ${scheduleData.observations}</p>` : ''}
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #dc2626;"><strong>❌ Status:</strong> Agendamento rejeitado</p>
              ${rejectionReason ? `<p style="margin: 0; color: #7f1d1d;"><strong>Motivo:</strong> ${rejectionReason}</p>` : ''}
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Você pode fazer um novo agendamento considerando o motivo da rejeição.
            </p>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">Sistema de Agendamento</p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Sistema de Agendamento <onboarding@resend.dev>",
      to: [userEmail, "adm7mzz@mmm.com"],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: 'Email enviado com sucesso'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
