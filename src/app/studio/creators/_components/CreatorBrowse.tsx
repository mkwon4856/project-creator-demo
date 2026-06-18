'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { TopNav } from '@/components/layout/TopNav';
import type { ContentType, Grade, Platform } from '@/lib/db.types';
import type { BrowseCreator } from '@/lib/api/creators.server';

interface Props {
  creators: BrowseCreator[];
  total: number;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
};

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: '유튜브',
  chzzk: '치지직',
  soop: 'SOOP',
  tiktok: '틱톡',
};

// 등급 뱃지 색: S/A 골드 계열, B/C 우베, D/E 차분한 톤
const GRADE_BADGE: Record<Grade, string> = {
  S: 'bg-[#E5B567]/20 text-[#E5B567] border-[#E5B567]/40',
  A: 'bg-[#E5B567]/15 text-[#E5B567] border-[#E5B567]/30',
  B: 'bg-[#9B7EC8]/20 text-[#9B7EC8] border-[#9B7EC8]/40',
  C: 'bg-[#9B7EC8]/15 text-[#9B7EC8] border-[#9B7EC8]/30',
  D: 'bg-white/10 text-white/60 border-white/20',
  E: 'bg-white/5 text-white/40 border-white/10',
};

const AVATAR_BG = ['#6D4FA0', '#A0524F', '#4F73A0', '#4FA08A', '#A0904F', '#8A4FA0'];
function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
}

// 구독자 수 → 한국어 축약 (250만 / 90만 / 1.2억)
function formatSubs(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만`;
  return n.toLocaleString();
}

const ALL_GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E'];
const ALL_TYPES: ContentType[] = ['live', 'longform', 'shortform'];

type GradeFilter = 'all' | Grade;
type TypeFilter = 'all' | ContentType;

export function CreatorBrowse({ creators, total }: Props) {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // 채널 단위 AND 매칭: 같은 채널이 등급/타입 조건을 모두 만족하면 노출
  const filtered = useMemo(
    () =>
      creators.filter((cr) =>
        cr.channels.some(
          (ch) =>
            (gradeFilter === 'all' || ch.grade === gradeFilter) &&
            (typeFilter === 'all' || ch.content_type === typeFilter),
        ),
      ),
    [creators, gradeFilter, typeFilter],
  );

  const resetFilters = () => {
    setGradeFilter('all');
    setTypeFilter('all');
  };

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm transition-all ${
      active ? 'bg-[#9B7EC8] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="studio" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* 헤더 */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              크리에이터 찾기
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Project Creator와 함께하는 크리에이터를 둘러보세요
            </p>
          </div>
          <div className="text-sm text-white/40">
            총 <span className="text-[#E5B567] font-bold">{total.toLocaleString()}</span>명
          </div>
        </div>

        {/* 필터 바 */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-white/40 mb-2">등급</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setGradeFilter('all')} className={pill(gradeFilter === 'all')}>
                전체
              </button>
              {ALL_GRADES.map((g) => (
                <button key={g} onClick={() => setGradeFilter(g)} className={pill(gradeFilter === g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-2">콘텐츠 타입</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTypeFilter('all')} className={pill(typeFilter === 'all')}>
                전체
              </button>
              {ALL_TYPES.map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={pill(typeFilter === t)}>
                  {CONTENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 */}
        {filtered.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-12 text-center border border-dashed border-white/10">
            <p className="text-white/40 text-sm">조건에 맞는 크리에이터가 없습니다</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: '#9B7EC8' }}
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <>
            <div className="text-xs text-white/30">{filtered.length}명</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((cr) => (
                <Link
                  key={cr.id}
                  href={`/creators/${cr.id}`}
                  className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 transition-all hover:-translate-y-1 hover:border-[#9B7EC8]/40"
                >
                  {/* 아바타 + 이름 + 대표 등급 */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                      style={{ background: avatarColor(cr.name) }}
                    >
                      {cr.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cr.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-white/80" style={{ fontFamily: 'Arial Black' }}>
                          {cr.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{cr.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {cr.platforms.map((p) => (
                          <PlatformIcon key={p} platform={p} size={15} />
                        ))}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${GRADE_BADGE[cr.topChannel.grade]}`}
                    >
                      {cr.topChannel.grade}
                    </span>
                  </div>

                  {/* 구독자 (대표 최대 2채널 멀티 표기) */}
                  <div className="text-xs text-white/50 mt-3">
                    {cr.channels
                      .slice(0, 2)
                      .map((ch) => `${PLATFORM_LABELS[ch.platform]} ${formatSubs(ch.subscribers)}`)
                      .join(' · ')}
                    {cr.channels.length > 2 && (
                      <span className="text-white/30"> +{cr.channels.length - 2}</span>
                    )}
                  </div>

                  {/* 가능한 콘텐츠 타입 */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cr.contentTypes.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#9B7EC8]/15 text-[#9B7EC8]"
                      >
                        {CONTENT_TYPE_LABELS[t]}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
