import { Resend } from 'resend';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY is not configured — skipping send');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function resolveRecipient(to: string, subject: string): { to: string; subject: string } {
  const devRedirect = process.env.EMAIL_DEV_REDIRECT?.trim();
  if (devRedirect) {
    return {
      to: devRedirect,
      subject: `[원래수신자: ${to}] ${subject}`,
    };
  }
  return { to, subject };
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  const from = process.env.EMAIL_FROM?.trim() || 'onboarding@resend.dev';
  const resolved = resolveRecipient(to, subject);

  try {
    const { error } = await client.emails.send({
      from,
      to: resolved.to,
      subject: resolved.subject,
      html,
    });
    if (error) {
      console.error('[email] Resend API error:', error);
    }
  } catch (err) {
    console.error('[email] Failed to send:', err);
  }
}
