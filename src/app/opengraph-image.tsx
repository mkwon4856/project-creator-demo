import { ImageResponse } from 'next/og';

import { SITE_NAME, SITE_TAGLINE } from '@/lib/siteConfig';

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadNotoSansKr(weight: 600 | 700): Promise<ArrayBuffer> {
  const file =
    weight === 700
      ? 'noto-sans-kr-korean-700-normal.woff'
      : 'noto-sans-kr-korean-600-normal.woff';
  const url = `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.5/files/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load font: ${file}`);
  }
  return res.arrayBuffer();
}

export default async function OpenGraphImage() {
  const [fontBold, fontSemiBold] = await Promise.all([
    loadNotoSansKr(700),
    loadNotoSansKr(600),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#141517',
          padding: '72px 80px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Noto Sans KR',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -80,
            bottom: -80,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(167, 139, 250, 0) 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#A78BFA',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Noto Sans KR', data: fontBold, weight: 700, style: 'normal' },
        { name: 'Noto Sans KR', data: fontSemiBold, weight: 600, style: 'normal' },
      ],
    },
  );
}
