'use client';

import { useState } from 'react';
import {
  GAMES,
  CREATORS,
  CAMPAIGNS,
  SAMPLE_CAMPAIGN,
  SUBMISSIONS,
  MISSION_RATES,
  MISSION_LABELS,
  TIER_INFO,
  formatKRW,
  formatSubs,
  formatViews,
  type MissionType,
  type Tier,
  type Campaign,
} from '@/lib/mockData';

void SAMPLE_CAMPAIGN; // 호환용 유지

type Tab = 'publisher' | 'creator' | 'admin';

export default function Home() {
  const [tab, setTab] = useState<Tab>('publisher');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      {/* 샘플 데이터 안내 */}
      <div className="bg-[#1a1a0e] border-b border-[#3f3a1a] text-[#fde68a] text-center text-[11px] py-1.5 font-medium tracking-tight">
        이 페이지는 데모용 샘플 데이터입니다. 실제 운영 화면이 아닙니다.
      </div>

      {/* 상단 헤더 */}
      <header className="bg-[#0a0a0a] border-b border-[#262626] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-stretch justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold tracking-tight">
              Project <span style={{ color: '#FF3366' }}>Creator</span>
            </span>
            <span className="text-[10px] font-medium px-1.5 py-px rounded border border-[#262626] text-[#737373] uppercase tracking-wider">Demo</span>
          </div>

          <nav className="flex items-stretch">
            <HeaderTab active={tab === 'publisher'} onClick={() => setTab('publisher')}>게임사</HeaderTab>
            <HeaderTab active={tab === 'creator'} onClick={() => setTab('creator')}>크리에이터</HeaderTab>
            <HeaderTab active={tab === 'admin'} onClick={() => setTab('admin')}>관리자</HeaderTab>
          </nav>

          <div className="flex items-center gap-3 self-center">
            <button className="relative w-7 h-7 rounded hover:bg-[#1f1f1f] flex items-center justify-center transition" aria-label="알림">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a3a3a3]">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#FF3366' }}></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[#262626]">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: '#FF3366' }}>PG</div>
              <span className="text-[12px] font-medium text-[#e5e5e5]">Pulse Games</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'publisher' && <PublisherView />}
        {tab === 'creator' && <CreatorView />}
        {tab === 'admin' && <AdminView />}
      </main>
    </div>
  );
}

function HeaderTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 text-[13px] font-medium transition relative flex items-center"
      style={{ color: active ? 'white' : '#737373' }}
    >
      {children}
      {active && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5" style={{ background: '#FF3366' }} />}
    </button>
  );
}

// =====================================================================
// 공용 컴포넌트
// =====================================================================

function PageHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between pb-5 border-b border-[#262626] mb-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-[13px] text-[#737373] mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Card({ children, className = '', dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  if (dark) {
    return (
      <div className={`rounded-lg p-5 text-white relative overflow-hidden ${className}`} style={{ background: 'linear-gradient(135deg, #0a0a0a, #1f1f1f)' }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,51,102,0.18) 0%, transparent 70%)' }} />
        <div className="relative">{children}</div>
      </div>
    );
  }
  return <div className={`bg-[#171717] border border-[#262626] rounded-md ${className}`}>{children}</div>;
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="bg-[#171717] border border-[#262626] rounded-md p-4">
      <div className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: accent ? '#FF3366' : 'white' }}>{value}</div>
      <div className="text-[11px] text-[#737373] mt-1">{sub}</div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${full ? 'w-full' : ''} px-3.5 py-2 rounded-md text-[13px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition`}
      style={{ background: '#FF3366' }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-2 rounded-md text-[13px] font-medium border border-[#262626] hover:bg-[#1f1f1f] transition"
      style={{ color: '#e5e5e5' }}
    >
      {children}
    </button>
  );
}

function getStatusInfo(status: Campaign['status']): { label: string; isLive: boolean } {
  switch (status) {
    case 'recruiting': return { label: 'Recruiting', isLive: false };
    case 'progress':   return { label: 'Live',       isLive: true  };
    case 'completed':  return { label: 'Completed',  isLive: false };
  }
}

function StatusPill({ status }: { status: Campaign['status'] }) {
  const s = getStatusInfo(status);
  return (
    <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border border-[#262626] text-[#a3a3a3] bg-[#0a0a0a] uppercase tracking-wider">
      {s.isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>}
      {s.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border border-[#262626] text-[#e5e5e5] bg-[#0a0a0a] tabular-nums">
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'paid' }) {
  const map = {
    pending:  { label: '검수 중',   color: '#fbbf24' },
    approved: { label: '승인',     color: '#60a5fa' },
    paid:     { label: '지급 완료', color: '#34d399' },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-[#262626] bg-[#0a0a0a]" style={{ color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }}></span>
      {s.label}
    </span>
  );
}

// =====================================================================
// 게임사 탭
// =====================================================================

function PublisherView() {
  const [mode, setMode] = useState<'dashboard' | 'create'>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(CAMPAIGNS[0].id);

  return (
    <div>
      <PageHeading
        title="게임사 워크스페이스"
        subtitle="캠페인을 등록하고 진행 상황을 확인합니다"
        action={
          mode === 'dashboard'
            ? <PrimaryButton onClick={() => setMode('create')}>+ 새 캠페인</PrimaryButton>
            : <GhostButton onClick={() => setMode('dashboard')}>← 대시보드</GhostButton>
        }
      />
      {mode === 'dashboard'
        ? <PublisherDashboard selectedCampaignId={selectedCampaignId} onSelectCampaign={setSelectedCampaignId} />
        : <PublisherCreate />}
    </div>
  );
}

// 더미 URL을 그럴듯한 외부 링크로 변환 (영업 자리 시연용)
function getDisplayUrl(url: string | undefined): { display: string; href: string } {
  if (!url) return { display: '', href: '#' };
  const display = url.replace(/^https?:\/\//, '').slice(0, 40) + (url.length > 50 ? '...' : '');
  let href = 'https://youtube.com';
  if (url.includes('chzzk')) href = 'https://chzzk.naver.com';
  else if (url.includes('sooplive')) href = 'https://sooplive.co.kr';
  return { display, href };
}

function getPlatformBadge(url: string | undefined): string {
  if (!url) return '';
  if (url.includes('youtube'))  return 'YouTube';
  if (url.includes('chzzk'))    return '치지직';
  if (url.includes('sooplive')) return 'SOOP';
  return 'External';
}

function PublisherDashboard({
  selectedCampaignId,
  onSelectCampaign
}: {
  selectedCampaignId: string;
  onSelectCampaign: (id: string) => void;
}) {
  const campaign = CAMPAIGNS.find(c => c.id === selectedCampaignId) ?? CAMPAIGNS[0];
  const game = GAMES.find(g => g.id === campaign.gameId)!;
  const subs = SUBMISSIONS.filter(s => s.campaignId === campaign.id);
  const joinedCount = campaign.joinedCreators.length;
  const progress = Math.min(100, Math.round((joinedCount / campaign.targetCreators) * 100));

  const paid = subs.filter(s => s.status === 'paid');
  const approved = subs.filter(s => s.status === 'approved');
  const pending = subs.filter(s => s.status === 'pending');
  const paidAmount = paid.reduce((sum, s) => sum + s.amount, 0);
  const approvedAmount = approved.reduce((sum, s) => sum + s.amount, 0);
  const remaining = Math.max(0, campaign.budget - paidAmount - approvedAmount);

  return (
    <div className="space-y-5">
      {/* 캠페인 선택 행 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CAMPAIGNS.map(c => {
          const g = GAMES.find(x => x.id === c.gameId)!;
          const active = selectedCampaignId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCampaign(c.id)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-md border whitespace-nowrap transition bg-[#171717]"
              style={{ borderColor: active ? '#FF3366' : '#262626' }}
            >
              <span className="text-xl leading-none">{g.thumbnail}</span>
              <div className="text-left">
                <div className="font-semibold text-[13px] flex items-center gap-1.5">
                  {g.name}
                  <StatusPill status={c.status} />
                </div>
                <div className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
                  {formatKRW(c.budget)} · {c.joinedCreators.length}/{c.targetCreators}명
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 캠페인 상세 다크 헤더 */}
      <Card dark>
        <div className="flex items-start gap-5">
          <div className="text-5xl leading-none">{game.thumbnail}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
              <span>{campaign.id}</span>
              <span className="text-[#a3a3a3]">·</span>
              <span>{campaign.createdAt} → {campaign.endDate}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mt-1">{game.name}</h2>
            <p className="text-[13px] text-[#a3a3a3] mt-0.5">
              {game.publisher} · {game.publisherType} · {game.genre}
            </p>
            <div className="flex gap-1.5 mt-2.5">
              {game.tags.map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded border text-[10px] font-medium" style={{ borderColor: '#525252', color: '#d4d4d4' }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>Campaign Pool</div>
            <div className="text-3xl font-semibold tabular-nums mt-1" style={{ color: '#FF3366' }}>{formatKRW(campaign.budget)}</div>
          </div>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        <Stat label="모집 진행률" value={`${progress}%`} sub={`${joinedCount} / ${campaign.targetCreators} 명`} />
        <Stat label="제출 콘텐츠" value={`${subs.length}`} sub={`지급 ${paid.length} · 승인 ${approved.length} · 검수 ${pending.length}`} />
        <Stat label="지급 완료" value={formatKRW(paidAmount)} sub={`예산의 ${Math.round((paidAmount / campaign.budget) * 100)}%`} />
        <Stat label="잔여 예산" value={formatKRW(remaining)} sub="추가 참여 가능" accent />
      </div>

      {/* 진행률 바 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold">크리에이터 모집 진행률</div>
          <div className="text-[11px] text-[#737373] tabular-nums">목표 {campaign.targetCreators}명 · 현재 {joinedCount}명</div>
        </div>
        <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#FF3366' }} />
        </div>
      </Card>

      {/* 참여 크리에이터 - 등급별 탭 필터 */}
      <CreatorPanel joinedCreators={campaign.joinedCreators} subs={subs} />

      {/* 제출 콘텐츠 - 3중 필터 (미션 · 등급 · 상태) */}
      <SubmissionPanel subs={subs} />
    </div>
  );
}

// === 참여 크리에이터 패널 (등급 탭 필터) ===
function CreatorPanel({ joinedCreators, subs }: { joinedCreators: string[]; subs: typeof SUBMISSIONS }) {
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');

  const allCreators = joinedCreators.map(cid => CREATORS.find(c => c.id === cid)!);
  const counts: Record<'all' | Tier, number> = {
    all: allCreators.length,
    A: allCreators.filter(c => c.tier === 'A').length,
    B: allCreators.filter(c => c.tier === 'B').length,
    C: allCreators.filter(c => c.tier === 'C').length,
    D: allCreators.filter(c => c.tier === 'D').length,
  };
  const filtered = tierFilter === 'all' ? allCreators : allCreators.filter(c => c.tier === tierFilter);

  const tabs: { id: 'all' | Tier; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: 'A',   label: 'A등급' },
    { id: 'B',   label: 'B등급' },
    { id: 'C',   label: 'C등급' },
    { id: 'D',   label: 'D등급' },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold">참여 크리에이터</div>
        <div className="text-[11px] text-[#737373] tabular-nums">총 {allCreators.length}명</div>
      </div>

      {/* 등급 탭 */}
      <div className="flex gap-0.5 mb-3 border-b border-[#262626]">
        {tabs.map(t => {
          const active = tierFilter === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTierFilter(t.id)}
              className="px-3 py-1.5 text-[12px] font-medium transition relative"
              style={{ color: active ? '#e5e5e5' : '#737373' }}
            >
              {t.label} <span className="text-[#525252] tabular-nums">({counts[t.id]})</span>
              {active && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5" style={{ background: '#FF3366' }} />}
            </button>
          );
        })}
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto -mr-2 pr-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#737373] text-[12px]">해당 등급의 참여자가 없습니다</div>
        )}
        {filtered.map(c => {
          const mySubs = subs.filter(s => s.creatorId === c.id);
          return (
            <div key={c.id} className="flex items-center gap-3 py-2 border-b border-[#262626] last:border-0">
              <div className="w-8 h-8 rounded flex items-center justify-center text-base bg-[#0a0a0a] border border-[#262626]">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: '#e5e5e5' }}>
                  {c.nickname}
                  <TierBadge tier={c.tier} />
                </div>
                <div className="text-[11px] text-[#737373] truncate">{c.platform} · {formatSubs(c.subscribers)} · {c.specialty}</div>
              </div>
              <div className="text-[11px] tabular-nums text-[#a3a3a3]">
                {mySubs.length}건 제출
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// === 제출 콘텐츠 패널 (미션 · 등급 · 상태 3중 필터 + 더미 링크) ===
function SubmissionPanel({ subs }: { subs: typeof SUBMISSIONS }) {
  const [missionFilter, setMissionFilter] = useState<'all' | MissionType>('all');
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  const filtered = subs.filter(s => {
    if (missionFilter !== 'all' && s.mission !== missionFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (tierFilter !== 'all') {
      const c = CREATORS.find(x => x.id === s.creatorId);
      if (!c || c.tier !== tierFilter) return false;
    }
    return true;
  });

  const resetAll = () => {
    setMissionFilter('all');
    setTierFilter('all');
    setStatusFilter('all');
  };

  const hasFilter = missionFilter !== 'all' || tierFilter !== 'all' || statusFilter !== 'all';

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold">제출 콘텐츠</div>
        <div className="text-[11px] text-[#737373] tabular-nums">
          {hasFilter ? `${filtered.length} / ${subs.length}` : `${subs.length}건`}
        </div>
      </div>

      {/* 3중 필터 칩 */}
      <div className="space-y-2 mb-3 pb-3 border-b border-[#262626]">
        <FilterRow label="콘텐츠 종류">
          <Chip active={missionFilter === 'all'}   onClick={() => setMissionFilter('all')}>전체</Chip>
          <Chip active={missionFilter === 'short'} onClick={() => setMissionFilter('short')}>숏폼</Chip>
          <Chip active={missionFilter === 'long'}  onClick={() => setMissionFilter('long')}>롱폼</Chip>
          <Chip active={missionFilter === 'live'}  onClick={() => setMissionFilter('live')}>라이브</Chip>
        </FilterRow>
        <FilterRow label="크리에이터 등급">
          <Chip active={tierFilter === 'all'} onClick={() => setTierFilter('all')}>전체</Chip>
          <Chip active={tierFilter === 'A'}   onClick={() => setTierFilter('A')}>A</Chip>
          <Chip active={tierFilter === 'B'}   onClick={() => setTierFilter('B')}>B</Chip>
          <Chip active={tierFilter === 'C'}   onClick={() => setTierFilter('C')}>C</Chip>
          <Chip active={tierFilter === 'D'}   onClick={() => setTierFilter('D')}>D</Chip>
        </FilterRow>
        <FilterRow label="진행 상황">
          <Chip active={statusFilter === 'all'}      onClick={() => setStatusFilter('all')}>전체</Chip>
          <Chip active={statusFilter === 'pending'}  onClick={() => setStatusFilter('pending')}>검수 중</Chip>
          <Chip active={statusFilter === 'approved'} onClick={() => setStatusFilter('approved')}>승인</Chip>
          <Chip active={statusFilter === 'paid'}     onClick={() => setStatusFilter('paid')}>지급 완료</Chip>
        </FilterRow>
        {hasFilter && (
          <button onClick={resetAll} className="text-[11px] font-medium hover:underline" style={{ color: '#FF3366' }}>
            필터 초기화
          </button>
        )}
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto -mr-2 pr-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#737373] text-[12px]">조건에 맞는 콘텐츠가 없습니다</div>
        )}
        {filtered.map(s => {
          const c = CREATORS.find(x => x.id === s.creatorId)!;
          const urlInfo = getDisplayUrl(s.url);
          const platform = getPlatformBadge(s.url);
          return (
            <div key={s.id} className="py-2.5 border-b border-[#262626] last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded flex items-center justify-center text-base bg-[#0a0a0a] border border-[#262626] flex-shrink-0">
                  {s.thumbnail ?? c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: '#e5e5e5' }}>
                    {s.title ?? MISSION_LABELS[s.mission]}
                  </div>
                  <div className="text-[11px] text-[#737373] flex items-center gap-1.5 flex-wrap">
                    <span>{c.nickname}</span>
                    <TierBadge tier={c.tier} />
                    <span>·</span>
                    <span>{MISSION_LABELS[s.mission]}</span>
                    <span>·</span>
                    <span>{s.submittedAt}</span>
                  </div>
                  {/* 더미 외부 링크 */}
                  {s.url && (
                    <a
                      href={urlInfo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-[11px] tabular-nums hover:underline"
                      style={{ color: '#FF9BB3' }}
                    >
                      <span className="inline-block px-1 py-px rounded text-[9px] font-semibold border border-[#262626] bg-[#0a0a0a]" style={{ color: '#a3a3a3' }}>{platform}</span>
                      <span className="truncate max-w-[280px]">{urlInfo.display}</span>
                      <span className="text-[#525252]">↗</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#737373] tabular-nums">
                    {s.views !== undefined && s.views > 0 && <span>{formatViews(s.views)} views</span>}
                    {s.comments !== undefined && s.comments > 0 && <span>· {s.comments.toLocaleString()} comments</span>}
                    <StatusBadge status={s.status} />
                  </div>
                </div>
                <div className="text-[13px] font-semibold tabular-nums flex-shrink-0" style={{ color: '#e5e5e5' }}>
                  {formatKRW(s.amount)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// === 필터 행 / 필터 칩 헬퍼 ===
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#737373] uppercase tracking-wider w-24 flex-shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-0.5 rounded text-[11px] font-medium border transition"
      style={{
        background: active ? '#FF3366' : '#0a0a0a',
        borderColor: active ? '#FF3366' : '#262626',
        color: active ? 'white' : '#a3a3a3',
      }}
    >
      {children}
    </button>
  );
}

function PublisherCreate() {
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0].id);
  const [budget, setBudget] = useState(3000000);
  const [selectedMissions, setSelectedMissions] = useState<MissionType[]>(['short', 'long', 'live']);
  const [submitted, setSubmitted] = useState(false);

  // 등급별 단가를 게임사가 직접 설정 (기본값은 MISSION_RATES)
  const [customRates, setCustomRates] = useState<Record<MissionType, Record<Tier, number>>>(() => ({
    short: { ...MISSION_RATES.short },
    long:  { ...MISSION_RATES.long },
    live:  { ...MISSION_RATES.live },
  }));

  const selectedGame = GAMES.find(g => g.id === selectedGameId)!;

  const toggleMission = (m: MissionType) => {
    setSelectedMissions(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const updateRate = (mission: MissionType, tier: Tier, raw: string) => {
    const parsed = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    let value = isNaN(parsed) ? MISSION_RATES[mission][tier] : parsed;
    // 검증: 최소 ₩10,000, 최대 ₩100,000,000
    if (value < 10000) value = 10000;
    if (value > 100000000) value = 100000000;
    setCustomRates(prev => ({
      ...prev,
      [mission]: { ...prev[mission], [tier]: value }
    }));
  };

  if (submitted) {
    return (
      <Card className="p-12 text-center">
        <div className="text-2xl font-semibold mb-1">캠페인이 생성되었습니다</div>
        <p className="text-[13px] text-[#737373] mb-6">크리에이터들이 자율적으로 응모하기 시작합니다.</p>
        <PrimaryButton onClick={() => setSubmitted(false)}>대시보드로 이동</PrimaryButton>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <Card className="p-5">
          <div className="text-[13px] font-semibold mb-3">1. 게임 선택</div>
          <div className="grid grid-cols-3 gap-2">
            {GAMES.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGameId(g.id)}
                className="p-3 rounded-md border text-left transition bg-[#171717]"
                style={{ borderColor: selectedGameId === g.id ? '#FF3366' : '#262626' }}
              >
                <div className="text-2xl mb-1.5">{g.thumbnail}</div>
                <div className="font-semibold text-[13px]">{g.name}</div>
                <div className="text-[11px] text-[#737373] mt-0.5">{g.publisherType} · {g.genre}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13px] font-semibold mb-3">2. 예산 거치</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              step={500000}
              min={500000}
              className="flex-1 px-3 py-2 text-xl font-semibold border border-[#262626] rounded-md focus:outline-none focus:border-[#FF3366] tabular-nums"
            />
            <span className="text-[13px] font-medium text-[#737373]">KRW</span>
          </div>
          <div className="text-[11px] text-[#737373] mt-1.5">최소 ₩500,000부터 시작 가능</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-end justify-between mb-1">
            <div className="text-[13px] font-semibold">3. 원하는 미션 선택 · 등급별 단가 설정</div>
            <div className="text-[10px] text-[#737373]">각 단가 셀을 클릭하여 직접 수정</div>
          </div>
          <p className="text-[11px] text-[#737373] mt-0.5 mb-4">선택한 미션의 단가는 크리에이터 등급에 따라 자동 적용됩니다</p>
          <div className="space-y-2">
            {(Object.keys(MISSION_LABELS) as MissionType[]).map(m => {
              const active = selectedMissions.includes(m);
              const rates = customRates[m];
              return (
                <div
                  key={m}
                  className="p-3 rounded-md border bg-[#171717] transition"
                  style={{ borderColor: active ? '#FF3366' : '#262626' }}
                >
                  <button
                    onClick={() => toggleMission(m)}
                    className="w-full flex items-center justify-between mb-2.5 text-left"
                  >
                    <div className="text-[13px] font-semibold">
                      {active && '✓ '}{MISSION_LABELS[m]}
                    </div>
                    <span className="text-[10px] text-[#737373]">
                      {active ? '미션 사용 중' : '클릭하여 선택'}
                    </span>
                  </button>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['D','C','B','A'] as Tier[]).map(tier => (
                      <RateInput
                        key={tier}
                        tier={tier}
                        value={rates[tier]}
                        disabled={!active}
                        onCommit={(val) => updateRate(m, tier, val)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div>
        <Card dark className="sticky top-20">
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#a3a3a3' }}>Campaign Summary</div>
          <div className="text-4xl">{selectedGame.thumbnail}</div>
          <div className="font-semibold text-[15px] mt-2">{selectedGame.name}</div>
          <div className="text-[11px] text-[#a3a3a3] mb-4">{selectedGame.publisher}</div>

          <div className="border-t border-[#262626] pt-3 space-y-2">
            <Row label="예산"        value={formatKRW(budget)} />
            <Row label="선택 미션"   value={`${selectedMissions.length}개`} />
            <Row label="예상 참여"   value="10–25명" />
          </div>

          {selectedMissions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#262626]">
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: '#a3a3a3' }}>설정 단가 (B등급 기준)</div>
              <div className="space-y-1">
                {selectedMissions.map(m => (
                  <div key={m} className="flex justify-between text-[11px]">
                    <span style={{ color: '#a3a3a3' }}>{MISSION_LABELS[m]}</span>
                    <span className="font-semibold tabular-nums">{formatKRW(customRates[m].B)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setSubmitted(true)}
            disabled={selectedMissions.length === 0 || budget < 500000}
            className="w-full mt-5 py-2.5 rounded-md font-semibold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{ background: '#FF3366' }}
          >
            예산 거치 & 캠페인 오픈
          </button>
        </Card>
      </div>
    </div>
  );
}

// 단가 입력 컴포넌트 - 클릭하면 input으로 변환
function RateInput({
  tier,
  value,
  disabled,
  onCommit,
}: {
  tier: Tier;
  value: number;
  disabled: boolean;
  onCommit: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const startEdit = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  };

  const finishEdit = () => {
    onCommit(draft);
    setEditing(false);
  };

  return (
    <div
      className="rounded border transition"
      style={{
        borderColor: editing ? '#FF3366' : '#262626',
        background: disabled ? '#262626' : '#0a0a0a',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className="text-[10px] text-[#737373] uppercase tracking-wider text-center pt-1.5">{tier}</div>
      {editing ? (
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') finishEdit();
            if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
          }}
          className="w-full text-center text-[12px] font-semibold tabular-nums bg-[#171717] text-[#e5e5e5] border-0 focus:outline-none px-1 py-1 rounded-b"
          style={{ MozAppearance: 'textfield' }}
        />
      ) : (
        <button
          onClick={startEdit}
          disabled={disabled}
          className="w-full text-center text-[12px] font-semibold tabular-nums py-1 hover:bg-[#1f1f1f] rounded-b transition"
          title={disabled ? '미션을 먼저 선택하세요' : '클릭하여 단가 수정'}
        >
          {formatKRW(value)}
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span style={{ color: '#a3a3a3' }}>{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

// =====================================================================
// 크리에이터 탭
// =====================================================================

function CreatorView() {
  const [myId, setMyId] = useState<string>('c5');
  const me = CREATORS.find(c => c.id === myId)!;
  const mySubmissions = SUBMISSIONS.filter(s => s.creatorId === myId);
  const totalEarned = mySubmissions.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = mySubmissions.filter(s => s.status !== 'paid').reduce((sum, s) => sum + s.amount, 0);
  const availableCampaigns = CAMPAIGNS.filter(c => c.status === 'recruiting' || c.status === 'progress');

  return (
    <div>
      <PageHeading
        title="크리에이터 워크스페이스"
        subtitle="참여 가능한 캠페인을 둘러보고 활동으로 수익을 만드세요"
        action={<span className="text-[11px] text-[#a3a3a3] italic">데모: 다른 크리에이터로 전환하여 등급별 화면을 비교</span>}
      />

      <div className="space-y-5">
        {/* 크리에이터 전환 바 */}
        <Card className="p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#737373] mb-2 px-1">현재 로그인</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CREATORS.map(c => {
              const active = myId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setMyId(c.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded border whitespace-nowrap transition bg-[#171717] flex-shrink-0"
                  style={{ borderColor: active ? '#FF3366' : '#262626' }}
                >
                  <span className="text-base leading-none">{c.avatar}</span>
                  <span className="text-[12px] font-medium">{c.nickname}</span>
                  <TierBadge tier={c.tier} />
                </button>
              );
            })}
          </div>
        </Card>

        {/* 내 프로필 다크 카드 */}
        <Card dark>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded flex items-center justify-center text-3xl bg-[#1f1f1f] border border-[#262626]">
              {me.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight">{me.nickname}</h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold border border-[#262626] uppercase tracking-wider" style={{ color: '#FF9BB3' }}>
                  {me.tier} · {TIER_INFO[me.tier].label}
                </span>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: '#a3a3a3' }}>
                {me.platform} · {formatSubs(me.subscribers)} 구독자 · {me.specialty}
              </p>
              <p className="text-[11px] mt-1" style={{ color: '#737373' }}>
                가입 {me.joinedDate} · 누적 완료 캠페인 {me.completedCampaigns}건
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>누적 수익</div>
              <div className="text-3xl font-semibold tabular-nums mt-1" style={{ color: '#FF3366' }}>{formatKRW(totalEarned)}</div>
              {pendingAmount > 0 && (
                <div className="text-[11px] mt-0.5" style={{ color: '#a3a3a3' }}>정산 대기 {formatKRW(pendingAmount)}</div>
              )}
            </div>
          </div>
        </Card>

        {/* 참여 가능 캠페인 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">참여 가능한 캠페인</div>
            <div className="text-[11px] text-[#737373] tabular-nums">{availableCampaigns.length}개</div>
          </div>
          <div className="space-y-2">
            {availableCampaigns.map(c => (
              <CampaignCardForCreator key={c.id} campaign={c} creatorTier={me.tier} creatorId={myId} />
            ))}
          </div>
        </div>

        {/* 내 활동 내역 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">내 활동 내역</div>
            <div className="text-[11px] text-[#737373] tabular-nums">{mySubmissions.length}건</div>
          </div>
          {mySubmissions.length === 0 ? (
            <div className="text-center py-8 text-[#a3a3a3] text-[12px]">아직 제출한 활동이 없습니다</div>
          ) : (
            <div className="space-y-1">
              {mySubmissions.map(s => {
                const camp = CAMPAIGNS.find(x => x.id === s.campaignId)!;
                const game = GAMES.find(g => g.id === camp.gameId)!;
                return (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[#262626] last:border-0">
                    <div className="w-10 h-10 rounded flex items-center justify-center text-base bg-[#0a0a0a] border border-[#262626] flex-shrink-0">
                      {s.thumbnail ?? game.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{s.title ?? MISSION_LABELS[s.mission]}</div>
                      <div className="text-[11px] text-[#737373]">
                        {game.name} · {MISSION_LABELS[s.mission]} · {s.submittedAt}
                      </div>
                      {s.views !== undefined && s.views > 0 && (
                        <div className="text-[11px] text-[#737373] tabular-nums mt-0.5">
                          {formatViews(s.views)} views · {s.comments?.toLocaleString() ?? 0} comments
                        </div>
                      )}
                    </div>
                    <StatusBadge status={s.status} />
                    <div className="text-[13px] font-semibold tabular-nums w-20 text-right">{formatKRW(s.amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function CampaignCardForCreator({
  campaign,
  creatorTier,
  creatorId
}: {
  campaign: Campaign;
  creatorTier: Tier;
  creatorId: string;
}) {
  const game = GAMES.find(g => g.id === campaign.gameId)!;
  const alreadyJoined = campaign.joinedCreators.includes(creatorId);
  const [expanded, setExpanded] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionType | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [step, setStep] = useState<'browse' | 'submitted'>('browse');

  return (
    <div className="bg-[#171717] border rounded-md overflow-hidden transition" style={{ borderColor: expanded ? '#FF3366' : '#262626' }}>
      <div className="p-4 flex items-center gap-4">
        <div className="text-3xl leading-none flex-shrink-0">{game.thumbnail}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[14px] font-semibold">{game.name}</h3>
            <StatusPill status={campaign.status} />
            {alreadyJoined && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border border-[#262626] bg-[#0a0a0a]" style={{ color: '#FF3366' }}>참여 중</span>
            )}
          </div>
          <p className="text-[12px] text-[#a3a3a3] truncate">{game.description}</p>
          <div className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
            {game.publisher} · 예산 {formatKRW(campaign.budget)} · 모집 {campaign.joinedCreators.length}/{campaign.targetCreators}명
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3.5 py-2 rounded-md text-[12px] font-semibold text-white flex-shrink-0"
          style={{ background: expanded ? '#525252' : '#FF3366' }}
        >
          {expanded ? '닫기' : '미션 보기'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#262626] p-4 bg-[#0a0a0a]">
          {step === 'browse' ? (
            <>
              <div className="text-[12px] text-[#a3a3a3] mb-3">
                <strong>{creatorTier}등급</strong>인 당신이 받을 수 있는 리워드:
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(Object.keys(MISSION_LABELS) as MissionType[]).map(m => {
                  const reward = MISSION_RATES[m][creatorTier];
                  const isSelected = selectedMission === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMission(m)}
                      className="p-3 rounded-md border text-left transition bg-[#171717]"
                      style={{ borderColor: isSelected ? '#FF3366' : '#262626' }}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-[#737373]">{isSelected ? '선택됨' : '\u00a0'}</div>
                      <div className="text-[12px] font-semibold mt-1">{MISSION_LABELS[m]}</div>
                      <div className="mt-2 text-xl font-semibold tabular-nums" style={{ color: '#FF3366' }}>{formatKRW(reward)}</div>
                    </button>
                  );
                })}
              </div>

              {selectedMission && (
                <div className="bg-[#171717] border border-[#262626] rounded-md p-3">
                  <div className="text-[12px] font-semibold mb-2">완성한 콘텐츠 URL을 제출하세요</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={submittedUrl}
                      onChange={e => setSubmittedUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 px-3 py-2 border border-[#262626] rounded-md focus:outline-none focus:border-[#FF3366] text-[12px]"
                    />
                    <button
                      onClick={() => setStep('submitted')}
                      disabled={!submittedUrl}
                      className="px-4 py-2 rounded-md font-semibold text-white text-[12px] disabled:opacity-40"
                      style={{ background: '#FF3366' }}
                    >
                      제출
                    </button>
                  </div>
                  <div className="text-[11px] text-[#737373] mt-2">
                    제출 후 검수(보통 24시간) → 승인 → 자동 정산 · 3.3% 원천징수 처리 포함
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-[14px] font-semibold mb-1">제출 완료</div>
              <div className="text-[12px] text-[#737373] mb-3">
                {MISSION_LABELS[selectedMission!]} · 예상 리워드 <strong style={{ color: '#FF3366' }}>{formatKRW(MISSION_RATES[selectedMission!][creatorTier])}</strong>
              </div>
              <button
                onClick={() => { setStep('browse'); setSelectedMission(null); setSubmittedUrl(''); setExpanded(false); }}
                className="px-3.5 py-1.5 rounded-md text-[12px] font-medium border border-[#262626]"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 관리자 탭
// =====================================================================

function AdminView() {
  const [selectedId, setSelectedId] = useState<string>(CAMPAIGNS[0].id);
  const campaign = CAMPAIGNS.find(c => c.id === selectedId) ?? CAMPAIGNS[0];
  const game = GAMES.find(g => g.id === campaign.gameId)!;
  const subs = SUBMISSIONS.filter(s => s.campaignId === campaign.id);

  const totalGMV = CAMPAIGNS.reduce((sum, c) => sum + c.budget, 0);
  const activeCampaigns = CAMPAIGNS.filter(c => c.status !== 'completed').length;
  const activeCreators = new Set(CAMPAIGNS.flatMap(c => c.joinedCreators)).size;
  const totalSubmissions = SUBMISSIONS.length;

  const joined = campaign.joinedCreators.map(cid => CREATORS.find(c => c.id === cid)!);
  const byTier: Record<Tier, typeof joined> = { A: [], B: [], C: [], D: [] };
  joined.forEach(c => byTier[c.tier].push(c));

  const paid = subs.filter(s => s.status === 'paid');
  const approved = subs.filter(s => s.status === 'approved');
  const pending = subs.filter(s => s.status === 'pending');
  const paidAmount = paid.reduce((sum, s) => sum + s.amount, 0);
  const approvedAmount = approved.reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = pending.reduce((sum, s) => sum + s.amount, 0);
  const remaining = Math.max(0, campaign.budget - paidAmount - approvedAmount - pendingAmount);

  const byMission: Record<MissionType, { count: number; amount: number }> = {
    short: { count: 0, amount: 0 },
    long: { count: 0, amount: 0 },
    live: { count: 0, amount: 0 },
  };
  subs.forEach(s => {
    byMission[s.mission].count += 1;
    byMission[s.mission].amount += s.amount;
  });

  return (
    <div>
      <PageHeading title="관리자 대시보드" subtitle="전체 플랫폼 운영 현황을 한눈에 확인합니다" />

      <div className="space-y-5">
        {/* 플랫폼 통계 */}
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Total GMV"        value={formatKRW(totalGMV)} sub="누적 거치 예산" accent />
          <Stat label="활성 캠페인"      value={`${activeCampaigns}`} sub={`전체 ${CAMPAIGNS.length}개`} />
          <Stat label="활성 크리에이터"  value={`${activeCreators}`} sub="현재 캠페인 참여 중" />
          <Stat label="제출 콘텐츠"      value={`${totalSubmissions}`} sub="전체 캠페인 합산" />
        </div>

        {/* 전체 캠페인 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">전체 캠페인</div>
            <div className="text-[11px] text-[#737373] tabular-nums">{CAMPAIGNS.length}개</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CAMPAIGNS.map(c => {
              const g = GAMES.find(x => x.id === c.gameId)!;
              const cSubs = SUBMISSIONS.filter(s => s.campaignId === c.id);
              const cPaid = cSubs.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
              const progress = Math.min(100, Math.round((c.joinedCreators.length / c.targetCreators) * 100));
              const active = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="text-left p-3 rounded-md border transition bg-[#171717]"
                  style={{ borderColor: active ? '#FF3366' : '#262626' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl leading-none">{g.thumbnail}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <div className="font-semibold text-[13px] truncate">{g.name}</div>
                        <StatusPill status={c.status} />
                      </div>
                      <div className="text-[11px] text-[#737373]">{g.publisher}</div>
                      <div className="mt-2 text-[11px] text-[#a3a3a3] tabular-nums">
                        예산 <strong className="font-semibold text-[#e5e5e5]">{formatKRW(c.budget)}</strong> · {c.joinedCreators.length}/{c.targetCreators}명
                      </div>
                      <div className="h-1 bg-[#262626] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#FF3366' }} />
                      </div>
                      <div className="mt-1.5 text-[10px] text-[#737373] tabular-nums">집행 {formatKRW(cPaid)} · 제출 {cSubs.length}건</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 선택 캠페인 다크 카드 */}
        <Card dark>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl leading-none">{game.thumbnail}</div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>{campaign.id} · {campaign.createdAt}</div>
              <div className="text-xl font-semibold tracking-tight">{game.name}</div>
              <div className="text-[12px]" style={{ color: '#a3a3a3' }}>{game.publisher}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>Campaign Pool</div>
              <div className="text-3xl font-semibold tabular-nums" style={{ color: '#FF3366' }}>{formatKRW(campaign.budget)}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#262626]">
            <AdminKPI label="참여 크리에이터" value={`${joined.length}`} sub={`목표 ${campaign.targetCreators}명`} />
            <AdminKPI label="제출 콘텐츠"     value={`${subs.length}`} sub={`${paid.length}/${approved.length}/${pending.length}`} />
            <AdminKPI label="지급 완료액"     value={formatKRW(paidAmount)} sub={`${campaign.budget > 0 ? Math.round((paidAmount / campaign.budget) * 100) : 0}%`} />
            <AdminKPI label="잔여 예산"       value={formatKRW(remaining)} sub="추가 참여 가능" accent />
          </div>
        </Card>

        {/* 예산 분배 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">예산 분배 현황</div>
            <div className="text-[11px] text-[#737373] tabular-nums">총 {formatKRW(campaign.budget)}</div>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex bg-[#262626]">
            <FlowSegment amount={paidAmount}     total={campaign.budget} color="#10b981" />
            <FlowSegment amount={approvedAmount} total={campaign.budget} color="#3b82f6" />
            <FlowSegment amount={pendingAmount}  total={campaign.budget} color="#f59e0b" />
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-[11px] tabular-nums">
            <Legend color="#10b981" label={`지급 ${formatKRW(paidAmount)}`} />
            <Legend color="#3b82f6" label={`승인 ${formatKRW(approvedAmount)}`} />
            <Legend color="#f59e0b" label={`검수 ${formatKRW(pendingAmount)}`} />
            <Legend color="#262626" label={`잔여 ${formatKRW(remaining)}`} />
          </div>
        </Card>

        {/* 2단 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-[13px] font-semibold mb-3">등급별 참여</div>
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as Tier[]).map(tier => {
                const list = byTier[tier];
                const ratio = joined.length > 0 ? (list.length / joined.length) * 100 : 0;
                return (
                  <div key={tier}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-6">{tier}</span>
                        <span className="text-[#737373]">{TIER_INFO[tier].label}</span>
                      </div>
                      <span className="font-semibold tabular-nums">{list.length}명</span>
                    </div>
                    <div className="h-1 bg-[#262626] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${ratio}%`, background: '#FF3366' }} />
                    </div>
                    {list.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {list.map(c => (
                          <span key={c.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#0a0a0a] border border-[#262626]">
                            <span>{c.avatar}</span>
                            <span className="text-[#a3a3a3]">{c.nickname}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-[13px] font-semibold mb-3">미션별 활동</div>
            <div className="space-y-3">
              {(Object.keys(MISSION_LABELS) as MissionType[]).map(m => {
                const stat = byMission[m];
                const ratio = subs.length > 0 ? (stat.count / subs.length) * 100 : 0;
                return (
                  <div key={m} className="p-3 rounded-md border border-[#262626]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[12px] font-semibold">{MISSION_LABELS[m]}</div>
                      <div className="text-lg font-semibold tabular-nums" style={{ color: '#FF3366' }}>{stat.count}</div>
                    </div>
                    <div className="h-1 bg-[#262626] rounded-full overflow-hidden mb-1.5">
                      <div className="h-full" style={{ width: `${ratio}%`, background: '#FF3366' }} />
                    </div>
                    <div className="text-[11px] text-[#737373] tabular-nums">집행 {formatKRW(stat.amount)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 활동 타임라인 */}
        <Card className="p-4">
          <div className="text-[13px] font-semibold mb-3">실시간 활동 타임라인</div>
          <div className="space-y-1">
            {[...subs].reverse().slice(0, 10).map(s => {
              const c = CREATORS.find(x => x.id === s.creatorId)!;
              return (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[#262626] last:border-0">
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#FF3366' }} />
                  <div className="text-base">{s.thumbnail ?? c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] truncate">
                      <strong className="font-semibold">{c.nickname}</strong>
                      <span className="text-[#737373]"> · {c.tier}등급</span>
                      <span className="text-[#a3a3a3]"> · {MISSION_LABELS[s.mission]} 제출</span>
                    </div>
                    {s.title && <div className="text-[11px] text-[#737373] truncate">{s.title}</div>}
                  </div>
                  <div className="text-[10px] text-[#a3a3a3] tabular-nums">{s.submittedAt}</div>
                  <StatusBadge status={s.status} />
                  <div className="text-[12px] font-semibold tabular-nums w-20 text-right">{formatKRW(s.amount)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdminKPI({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded p-2.5" style={{ background: accent ? 'rgba(255,51,102,0.08)' : 'rgba(255,255,255,0.03)' }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: accent ? '#FF9BB3' : '#a3a3a3' }}>{label}</div>
      <div className="text-xl font-semibold tabular-nums mt-0.5" style={{ color: accent ? '#FF3366' : 'white' }}>{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: '#737373' }}>{sub}</div>
    </div>
  );
}

function FlowSegment({ amount, total, color }: { amount: number; total: number; color: string }) {
  const ratio = total > 0 ? (amount / total) * 100 : 0;
  if (ratio <= 0) return null;
  return <div className="h-full" style={{ width: `${ratio}%`, background: color }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#a3a3a3]">
      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
