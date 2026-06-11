import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { sendEmail } from '@/lib/email/resend';
import {
  applicationReceivedEmail,
  applicationResultEmail,
  paymentCompletedEmail,
  submissionReceivedEmail,
  submissionResultEmail,
} from '@/lib/email/templates';

type WebhookEventType = 'INSERT' | 'UPDATE';

interface DbWebhookPayload {
  type: WebhookEventType;
  table: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown> | null;
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function statusChanged(
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown> | null | undefined,
): boolean {
  if (!oldRecord) return false;
  const next = str(record.status);
  const prev = str(oldRecord.status);
  return next !== null && prev !== null && next !== prev;
}

async function getCampaignName(
  admin: ReturnType<typeof createAdminClient>,
  campaignId: string,
): Promise<string> {
  const { data } = await admin
    .from('campaigns')
    .select('name')
    .eq('id', campaignId)
    .maybeSingle();
  return data?.name ?? '캠페인';
}

async function getStudioOwnerEmail(
  admin: ReturnType<typeof createAdminClient>,
  campaignId: string,
): Promise<string | null> {
  const { data: campaign } = await admin
    .from('campaigns')
    .select('studio_id')
    .eq('id', campaignId)
    .maybeSingle();
  if (!campaign?.studio_id) return null;

  const { data: studio } = await admin
    .from('studios')
    .select('user_id')
    .eq('id', campaign.studio_id)
    .maybeSingle();
  const userId = studio?.user_id;
  if (!userId) return null;

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle();
  return profile?.email ?? null;
}

async function getCreatorEmail(
  admin: ReturnType<typeof createAdminClient>,
  creatorId: string,
): Promise<string | null> {
  const { data: creator } = await admin
    .from('creators')
    .select('user_id')
    .eq('id', creatorId)
    .maybeSingle();
  const userId = creator?.user_id;
  if (!userId) return null;

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle();
  return profile?.email ?? null;
}

async function handleApplicationInsert(
  admin: ReturnType<typeof createAdminClient>,
  record: Record<string, unknown>,
): Promise<void> {
  const campaignId = str(record.campaign_id);
  if (!campaignId) return;

  const email = await getStudioOwnerEmail(admin, campaignId);
  if (!email) return;

  const campaignName = await getCampaignName(admin, campaignId);
  const { subject, html } = applicationReceivedEmail(campaignName);
  await sendEmail({ to: email, subject, html });
}

async function handleApplicationUpdate(
  admin: ReturnType<typeof createAdminClient>,
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown> | null | undefined,
): Promise<void> {
  if (!statusChanged(record, oldRecord)) return;

  const status = str(record.status);
  if (status !== 'accepted' && status !== 'rejected') return;

  const creatorId = str(record.creator_id);
  const campaignId = str(record.campaign_id);
  if (!creatorId || !campaignId) return;

  const email = await getCreatorEmail(admin, creatorId);
  if (!email) return;

  const campaignName = await getCampaignName(admin, campaignId);
  const { subject, html } = applicationResultEmail(campaignName, status === 'accepted');
  await sendEmail({ to: email, subject, html });
}

async function handleSubmissionInsert(
  admin: ReturnType<typeof createAdminClient>,
  record: Record<string, unknown>,
): Promise<void> {
  const campaignId = str(record.campaign_id);
  if (!campaignId) return;

  const email = await getStudioOwnerEmail(admin, campaignId);
  if (!email) return;

  const campaignName = await getCampaignName(admin, campaignId);
  const { subject, html } = submissionReceivedEmail(campaignName);
  await sendEmail({ to: email, subject, html });
}

async function handleSubmissionUpdate(
  admin: ReturnType<typeof createAdminClient>,
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown> | null | undefined,
): Promise<void> {
  if (!statusChanged(record, oldRecord)) return;

  const status = str(record.status);
  if (status !== 'approved' && status !== 'rejected') return;

  const creatorId = str(record.creator_id);
  const campaignId = str(record.campaign_id);
  if (!creatorId || !campaignId) return;

  const email = await getCreatorEmail(admin, creatorId);
  if (!email) return;

  const campaignName = await getCampaignName(admin, campaignId);
  const { subject, html } = submissionResultEmail(campaignName, status === 'approved');
  await sendEmail({ to: email, subject, html });
}

async function handlePaymentUpdate(
  admin: ReturnType<typeof createAdminClient>,
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown> | null | undefined,
): Promise<void> {
  if (!statusChanged(record, oldRecord)) return;

  const status = str(record.status);
  if (status !== 'completed') return;

  const creatorId = str(record.creator_id);
  const submissionId = str(record.submission_id);
  if (!creatorId) return;

  const email = await getCreatorEmail(admin, creatorId);
  if (!email) return;

  let campaignName = '캠페인';
  if (submissionId) {
    const { data: submission } = await admin
      .from('submissions')
      .select('campaign_id')
      .eq('id', submissionId)
      .maybeSingle();
    if (submission?.campaign_id) {
      campaignName = await getCampaignName(admin, submission.campaign_id);
    }
  }

  const amount = typeof record.amount === 'number' ? record.amount : 0;
  const { subject, html } = paymentCompletedEmail(campaignName, amount);
  await sendEmail({ to: email, subject, html });
}

async function processWebhook(payload: DbWebhookPayload): Promise<void> {
  const admin = createAdminClient();
  const { type, table, record, old_record: oldRecord } = payload;

  switch (table) {
    case 'applications':
      if (type === 'INSERT') {
        await handleApplicationInsert(admin, record);
      } else if (type === 'UPDATE') {
        await handleApplicationUpdate(admin, record, oldRecord);
      }
      break;
    case 'submissions':
      if (type === 'INSERT') {
        await handleSubmissionInsert(admin, record);
      } else if (type === 'UPDATE') {
        await handleSubmissionUpdate(admin, record, oldRecord);
      }
      break;
    case 'payments':
      if (type === 'UPDATE') {
        await handlePaymentUpdate(admin, record, oldRecord);
      }
      break;
    default:
      break;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET?.trim();
  const incoming = request.headers.get('x-webhook-secret');

  if (!secret || incoming !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as DbWebhookPayload;
    if (payload?.type && payload?.table && payload?.record) {
      await processWebhook(payload);
    }
  } catch (err) {
    console.error('[webhook/db] handler error:', err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
