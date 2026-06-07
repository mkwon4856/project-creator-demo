import { formatCompactKRW } from '@/lib/formatCurrency';

const DEFAULT_SITE_URL = 'https://project-creator-demo.vercel.app';

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, '') : DEFAULT_SITE_URL;
}

function emailLayout(title: string, body: string, buttonLabel: string, buttonHref: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
          <tr>
            <td style="padding:32px 28px 24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#7c3aed;letter-spacing:0.04em;">Project Creator</p>
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;line-height:1.4;">${title}</h1>
              <div style="font-size:15px;color:#3f3f46;line-height:1.6;">${body}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 32px;">
              <a href="${buttonHref}" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${buttonLabel}</a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">이 메일은 Project Creator 알림입니다.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function applicationReceivedEmail(campaignName: string): { subject: string; html: string } {
  const href = `${getSiteUrl()}/studio/applicants`;
  return {
    subject: `[Project Creator] 새 캠페인 지원 — ${campaignName}`,
    html: emailLayout(
      '새로운 크리에이터가 캠페인에 지원했습니다',
      `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인에 새 지원이 접수되었습니다.</p>
       <p style="margin:0;">지원자 목록에서 상세 내용을 확인하고 승인 여부를 결정해주세요.</p>`,
      '지원자 보기',
      href,
    ),
  };
}

export function applicationResultEmail(
  campaignName: string,
  approved: boolean,
): { subject: string; html: string } {
  const href = `${getSiteUrl()}/creator/activity`;
  const title = approved ? '캠페인 지원이 승인되었습니다' : '캠페인 지원이 거절되었습니다';
  const body = approved
    ? `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인 지원이 승인되었습니다.</p>
       <p style="margin:0;">활동 페이지에서 제작 일정과 미션 안내를 확인해주세요.</p>`
    : `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인 지원이 거절되었습니다.</p>
       <p style="margin:0;">다른 캠페인에 지원해 보실 수 있습니다.</p>`;

  return {
    subject: `[Project Creator] ${approved ? '지원 승인' : '지원 거절'} — ${campaignName}`,
    html: emailLayout(title, body, '내 활동 보기', href),
  };
}

export function submissionReceivedEmail(campaignName: string): { subject: string; html: string } {
  const href = `${getSiteUrl()}/studio/review`;
  return {
    subject: `[Project Creator] 새 콘텐츠 제출 — ${campaignName}`,
    html: emailLayout(
      '새 콘텐츠가 제출되었습니다',
      `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인에 크리에이터가 콘텐츠를 제출했습니다.</p>
       <p style="margin:0;">검수 큐에서 콘텐츠를 확인하고 승인 또는 반려해주세요.</p>`,
      '검수하기',
      href,
    ),
  };
}

export function submissionResultEmail(
  campaignName: string,
  approved: boolean,
): { subject: string; html: string } {
  const href = `${getSiteUrl()}/creator/activity`;
  const title = approved ? '콘텐츠가 승인되었습니다' : '콘텐츠가 반려되었습니다';
  const body = approved
    ? `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인 콘텐츠가 승인되었습니다.</p>
       <p style="margin:0;">정산 일정은 활동 페이지에서 확인할 수 있습니다.</p>`
    : `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인 콘텐츠가 반려되었습니다.</p>
       <p style="margin:0;">가이드라인을 확인한 뒤 수정·재제출해주세요.</p>`;

  return {
    subject: `[Project Creator] ${approved ? '콘텐츠 승인' : '콘텐츠 반려'} — ${campaignName}`,
    html: emailLayout(title, body, '내 활동 보기', href),
  };
}

export function paymentCompletedEmail(
  campaignName: string,
  amount: number,
): { subject: string; html: string } {
  const href = `${getSiteUrl()}/creator/earnings`;
  const formatted = formatCompactKRW(amount);
  return {
    subject: `[Project Creator] 정산 완료 — ${campaignName}`,
    html: emailLayout(
      '정산이 완료되었습니다',
      `<p style="margin:0 0 12px;"><strong>${campaignName}</strong> 캠페인 정산이 완료되었습니다.</p>
       <p style="margin:0;">실수령액: <strong>${formatted}</strong></p>`,
      '수익 내역 보기',
      href,
    ),
  };
}
