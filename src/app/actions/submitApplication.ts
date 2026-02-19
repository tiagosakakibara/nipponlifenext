'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ApplicationData {
  name: string;
  whatsapp: string;
  city?: string;
  message?: string;
}

export type SubmitApplicationResult =
  | { success: true }
  | { error: string };

// ─── Email HTML ───────────────────────────────────────────────────────────────

function buildEmailHtml(data: {
  candidateName: string;
  candidateWhatsapp: string;
  candidateCity: string;
  candidateMessage: string;
  jobTitle: string;
  companyName: string;
  prefecture: string;
  city: string;
  jobType: string;
  salaryText: string;
}) {
  const {
    candidateName, candidateWhatsapp, candidateCity, candidateMessage,
    jobTitle, companyName, prefecture, city, jobType, salaryText,
  } = data;

  const waLink = candidateWhatsapp
    ? `https://wa.me/${candidateWhatsapp.replace(/\D/g, '')}`
    : null;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova Candidatura — NipponLife</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header vermelho com logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#D70F24 0%,#a80c1c 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:white;border-radius:50%;display:inline-block;"></div>
                <span style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">NipponLife</span>
              </div>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;letter-spacing:0.5px;">NOVA CANDIDATURA RECEBIDA</p>
            </td>
          </tr>

          <!-- Título da vaga -->
          <tr>
            <td style="padding:32px 40px 0;border-bottom:1px solid #eef0f6;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#D70F24;letter-spacing:1.5px;text-transform:uppercase;">Vaga em aberto</p>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#0f1b3c;line-height:1.3;">${jobTitle}</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7a99;">
                ${companyName}${prefecture ? ` · ${prefecture}` : ''}${city ? `, ${city}` : ''}
                ${jobType ? ` · <span style="background:#f4f6fb;color:#3a5bbf;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:600;">${jobType}</span>` : ''}
                ${salaryText ? ` · <strong style="color:#0f1b3c;">${salaryText}</strong>` : ''}
              </p>
            </td>
          </tr>

          <!-- Dados do candidato -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#9aa4be;letter-spacing:1.5px;text-transform:uppercase;">Dados do candidato</p>

              <!-- Nome -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding:14px 18px;background:#f8f9ff;border-radius:10px;border-left:3px solid #D70F24;">
                    <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:#9aa4be;text-transform:uppercase;letter-spacing:1px;">Nome completo</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#0f1b3c;">${candidateName}</p>
                  </td>
                </tr>
              </table>

              <!-- WhatsApp -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding:14px 18px;background:#f8f9ff;border-radius:10px;border-left:3px solid #25D366;">
                    <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:#9aa4be;text-transform:uppercase;letter-spacing:1px;">WhatsApp</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#0f1b3c;">
                      ${candidateWhatsapp}
                      ${waLink ? `<a href="${waLink}" style="margin-left:12px;font-size:12px;color:#25D366;font-weight:600;text-decoration:none;">Abrir no WhatsApp →</a>` : ''}
                    </p>
                  </td>
                </tr>
              </table>

              ${candidateCity ? `
              <!-- Cidade -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding:14px 18px;background:#f8f9ff;border-radius:10px;border-left:3px solid #3a5bbf;">
                    <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:#9aa4be;text-transform:uppercase;letter-spacing:1px;">Cidade / Província</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#0f1b3c;">${candidateCity}</p>
                  </td>
                </tr>
              </table>` : ''}

              ${candidateMessage ? `
              <!-- Mensagem -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding:14px 18px;background:#fffbf0;border-radius:10px;border-left:3px solid #c9a84c;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#9aa4be;text-transform:uppercase;letter-spacing:1px;">Mensagem do candidato</p>
                    <p style="margin:0;font-size:14px;color:#3d4f6e;line-height:1.6;">${candidateMessage.replace(/\n/g, '<br/>')}</p>
                  </td>
                </tr>
              </table>` : ''}

            </td>
          </tr>

          <!-- CTA WhatsApp -->
          ${waLink ? `
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="${waLink}" style="display:block;text-align:center;background:#25D366;color:white;text-decoration:none;padding:16px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
                💬 Responder via WhatsApp
              </a>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9ff;padding:24px 40px;border-top:1px solid #eef0f6;">
              <p style="margin:0;font-size:12px;color:#9aa4be;text-align:center;line-height:1.6;">
                Este email foi enviado automaticamente pelo <strong style="color:#D70F24;">NipponLife</strong> em nome da candidatura recebida na sua vaga.<br/>
                Não responda este email — entre em contato diretamente com o candidato.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Server Action principal ──────────────────────────────────────────────────

export async function submitApplication(
  jobId: string,
  data: ApplicationData
): Promise<SubmitApplicationResult> {
  try {
    if (!data.name?.trim() || !data.whatsapp?.trim()) {
      return { error: 'Nome e WhatsApp são obrigatórios.' };
    }

    const admin = getAdminClient();

    // 1. Buscar a vaga para pegar o email da empreiteira
    const { data: job, error: jobError } = await admin
      .from('jobs')
      .select('title, company_name, prefecture, city, job_type, salary_text, contact')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return { error: 'Vaga não encontrada.' };
    }

    const recipientEmail = job.contact as string | null;

    if (!recipientEmail) {
      console.log('[submitApplication] Vaga sem email de contato (job.contact). Retornando sucesso silencioso.');
      return { success: true };
    }

    console.log(`[submitApplication] Enviando email para: ${recipientEmail} (Vaga: ${job.title})`);

    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      console.error('[submitApplication] Email de destino inválido:', recipientEmail);
      return { error: 'Email de destino inválido.' };
    }

    // 2. Enviar email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 're_SUBSTITUA_PELA_SUA_CHAVE') {
      console.warn('[submitApplication] RESEND_API_KEY não configurada. Email não enviado.');
      return { success: true };
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'candidaturas@nippon-life.com';

    const emailHtml = buildEmailHtml({
      candidateName: data.name,
      candidateWhatsapp: data.whatsapp,
      candidateCity: data.city || '',
      candidateMessage: data.message || '',
      jobTitle: job.title,
      companyName: job.company_name,
      prefecture: job.prefecture || '',
      city: job.city || '',
      jobType: job.job_type || '',
      salaryText: job.salary_text || '',
    });

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: `NipponLife Candidaturas <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: 'tiagosakakibara@gmail.com',
      subject: `📋 Nova candidatura para "${job.title}" — ${data.name}`,
      html: emailHtml,
    });

    if (sendError) {
      console.error('[submitApplication] Resend error:', sendError);
      return { error: 'Erro ao enviar notificação. Tente novamente.' };
    }

    console.log('[submitApplication] Email enviado com sucesso via Resend. ID:', sendData?.id);

    return { success: true };
  } catch (e: any) {
    console.error('[submitApplication] Unexpected error:', e);
    return { error: e?.message || 'Erro inesperado.' };
  }
}
