export const SITE_NAME = 'Project Creator';

export const SITE_DESCRIPTION =
  '게임사와 크리에이터를 연결하는 캠페인 마케팅 플랫폼. 캠페인 등록부터 콘텐츠 검수, 정산까지 한 곳에서.';

export const SITE_TAGLINE = '게임 마케팅, 크리에이터와 함께';

const DEFAULT_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, '') : DEFAULT_SITE_URL;
}

export const SITE_URL = getSiteUrl();

export function truncateText(text: string, max = 100): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

/** Logo: first word + accent (remaining words in primary color) */
export function splitSiteName(name = SITE_NAME): { prefix: string; accent: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { prefix: '', accent: name };
  }
  return { prefix: parts[0], accent: parts.slice(1).join(' ') };
}
