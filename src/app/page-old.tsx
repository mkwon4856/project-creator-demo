'use client';

import { useState } from 'react';
import { DemoStateProvider, useDemoState } from '@/context/DemoStateContext';
import {
  GAMES,
  CREATORS,
  SAMPLE_CAMPAIGN,
  GAME_PLATFORM_ICONS,
  MISSION_RATES,
  MISSION_LABELS,
  TIER_INFO,
  formatKRW,
  formatSubs,
  formatSubscribers,
  formatViews,
  getCreatorMissionReward,
  GRADE_COLORS,
  CREATOR_GENRE_FILTERS,
  creatorMatchesGenreFilter,
  creatorHasPlatform,
  creatorHasContentType,
  type Creator,
  type CreatorGenreFilter,
  type CreatorPlatformFilter,
  type CreatorContentFilter,
  getSpentPercent,
  getBudgetBarColor,
  getCampaignFeatureBadges,
  getCampaignStatusLabel,
  getCampaignStatusColor,
  campaignHasFeature,
  CAMPAIGN_FEATURE_LABELS,
  getCampaignThumbnailEmoji,
  type MissionType,
  type Tier,
  type Campaign,
  type CampaignStatusFilter,
  type CampaignFeatureFilter,
  type CampaignThumbnail,
  type Submission,
  type SubmissionStatus,
} from '@/lib/mockData';

void SAMPLE_CAMPAIGN; // 호환용 유지

type Tab = 'publisher' | 'creator' | 'admin';

const ACCENT = 'var(--ube)';
const ACCENT_TEXT = 'var(--ube-bright)';
const ACCENT_TINT = 'var(--ube-tint)';
const CREATOR_BG = 'var(--bg-base)';
const CARD_BG = 'var(--bg-card)';

export default function Home() {
  return (
    <DemoStateProvider>
      <HomeContent />
    </DemoStateProvider>
  );
}

function HomeContent() {
  const [tab, setTab] = useState<Tab>('publisher');
  const { toast, dismissToast } = useDemoState();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      {toast && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-md border border-[#333] text-[12px] font-medium shadow-lg flex items-center gap-3"
          style={{ background: '#1a1a1a', color: '#e5e5e5', maxWidth: '90vw' }}
        >
          <span>{toast}</span>
          <button type="button" onClick={dismissToast} className="text-[#737373] hover:text-white text-[11px]">
            닫기
          </button>
        </div>
      )}
      {/* 샘플 데이터 안내 */}
      <div className="bg-[#1a1a0e] border-b border-[#3f3a1a] text-[#fde68a] text-center text-[11px] py-1.5 font-medium tracking-tight">
        이 페이지는 데모용 샘플 데이터입니다. 실제 운영 화면이 아닙니다.
      </div>

      {/* 상단 헤더 */}
      <header className="bg-[#0a0a0a] border-b border-[#262626] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-stretch justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold tracking-tight">
              Project <span style={{ color: 'var(--ube-bright)' }}>Creator</span>
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
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ube)' }}></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[#262626]">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: 'var(--ube)' }}>PG</div>
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
      {active && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5" style={{ background: 'var(--ube)' }} />}
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
      <div className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: accent ? 'var(--ube-bright)' : 'white' }}>{value}</div>
      <div className="text-[11px] text-[#737373] mt-1">{sub}</div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled
          ? 'rgba(155,126,200,0.3)'
          : 'linear-gradient(135deg, #9B7EC8, #7B5EA7)',
        color: '#ffffff',
        border: 'none',
        padding: '11px 22px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 1.2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        width: full ? '100%' : 'auto',
        boxShadow: disabled
          ? 'none'
          : '0 2px 8px rgba(123,94,167,0.3)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'linear-gradient(135deg, #B89AD8, #9B7EC8)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(155,126,200,0.4)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'linear-gradient(135deg, #9B7EC8, #7B5EA7)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(123,94,167,0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
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
    case 'live':       return { label: 'Live',       isLive: true  };
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

function GradeBadge({ grade }: { grade: Tier }) {
  const g = GRADE_COLORS[grade];
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border tabular-nums"
      style={{ background: g.bg, color: g.text, borderColor: g.border }}
    >
      {grade}
    </span>
  );
}

function CreatorAvatar({ creator, size = 'md' }: { creator: Creator; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-14 h-14 text-3xl' : size === 'md' ? 'w-10 h-10 text-xl' : 'w-8 h-8 text-base';
  return (
    <div
      className={`${dim} rounded flex items-center justify-center flex-shrink-0 border border-[#333]`}
      style={{ background: creator.profileColor }}
    >
      {creator.profileEmoji}
    </div>
  );
}

const PLATFORM_ICON_COLORS: Record<string, string> = {
  youtube: '#ef4444',
  soop: '#3b82f6',
  chzzk: '#22c55e',
};

function PlatformIcons({ platforms }: { platforms: string[] }) {
  const labels: Record<string, string> = { youtube: 'YT', soop: 'SOOP', chzzk: 'CHZZK' };
  return (
    <div className="flex items-center gap-1">
      {platforms.map(p => (
        <span
          key={p}
          className="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center text-white"
          style={{ background: PLATFORM_ICON_COLORS[p] ?? '#525252' }}
          title={p === 'youtube' ? 'YouTube' : p === 'soop' ? 'SOOP' : '치지직'}
        >
          {labels[p]?.slice(0, 1) ?? p[0].toUpperCase()}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const map: Record<SubmissionStatus, { label: string; color: string }> = {
    producing: { label: '제작 중',   color: '#a78bfa' },
    pending:   { label: '검수 중',   color: '#fbbf24' },
    approved:  { label: '승인',     color: '#60a5fa' },
    paid:      { label: '지급 완료', color: '#34d399' },
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
  const { campaigns } = useDemoState();
  const [mode, setMode] = useState<'dashboard' | 'create'>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id ?? 'camp-001');

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
  const { campaigns, submissions } = useDemoState();
  const campaign = campaigns.find(c => c.id === selectedCampaignId) ?? campaigns[0];
  const subs = submissions.filter(s => s.campaignId === campaign.id);
  const joinedCount = campaign.joinedCreators.length;
  const progress = Math.min(100, Math.round((joinedCount / campaign.targetCreators) * 100));

  const paid = subs.filter(s => s.status === 'paid');
  const approved = subs.filter(s => s.status === 'approved');
  const producing = subs.filter(s => s.status === 'producing');
  const pending = subs.filter(s => s.status === 'pending');
  const paidAmount = paid.reduce((sum, s) => sum + s.amount, 0);
  const approvedAmount = approved.reduce((sum, s) => sum + s.amount, 0);
  const remaining = Math.max(0, campaign.totalBudget - campaign.spentBudget);

  return (
    <div className="space-y-5">
      {/* 캠페인 선택 행 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {campaigns.map(c => {
          const active = selectedCampaignId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCampaign(c.id)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-md border whitespace-nowrap transition bg-[#171717]"
              style={{ borderColor: active ? 'var(--ube)' : '#262626' }}
            >
              <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                <CampaignThumbnail thumbnail={c.thumbnail} alt={c.name} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-[13px] flex items-center gap-1.5">
                  {c.name}
                  <StatusPill status={c.status} />
                </div>
                <div className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
                  {formatKRW(c.totalBudget)} · {c.joinedCreators.length}/{c.targetCreators}명
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 캠페인 상세 다크 헤더 */}
      <Card dark>
        <div className="flex items-start gap-5">
          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
            <CampaignThumbnail thumbnail={campaign.thumbnail} alt={campaign.name} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
              <span>{campaign.id}</span>
              <span className="text-[#a3a3a3]">·</span>
              <span>{campaign.createdAt} → {campaign.endDate}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mt-1">{campaign.name}</h2>
            <p className="text-[13px] text-[#a3a3a3] mt-0.5">
              {campaign.developer} · {campaign.genre}
            </p>
            <div className="flex gap-1.5 mt-2.5">
              {campaign.platform.map(p => (
                <span key={p} className="px-1.5 py-0.5 rounded border text-[10px] font-medium" style={{ borderColor: '#525252', color: '#d4d4d4' }}>
                  {GAME_PLATFORM_ICONS[p]} {p}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>Campaign Pool</div>
            <div className="text-3xl font-semibold tabular-nums mt-1" style={{ color: 'var(--ube-bright)' }}>{formatKRW(campaign.totalBudget)}</div>
          </div>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        <Stat label="모집 진행률" value={`${progress}%`} sub={`${joinedCount} / ${campaign.targetCreators} 명`} />
        <Stat label="제출 콘텐츠" value={`${subs.length}`} sub={`지급 ${paid.length} · 제작 ${producing.length} · 검수 ${pending.length}`} />
        <Stat label="지급 완료" value={formatKRW(paidAmount)} sub={`예산의 ${Math.round((paidAmount / campaign.totalBudget) * 100)}%`} />
        <Stat label="잔여 예산" value={formatKRW(remaining)} sub="추가 참여 가능" accent />
      </div>

      {/* 진행률 바 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold">크리에이터 모집 진행률</div>
          <div className="text-[11px] text-[#737373] tabular-nums">목표 {campaign.targetCreators}명 · 현재 {joinedCount}명</div>
        </div>
        <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--ube)' }} />
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
function CreatorPanel({ joinedCreators, subs }: { joinedCreators: string[]; subs: Submission[] }) {
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');

  const allCreators = joinedCreators.map(cid => CREATORS.find(c => c.id === cid)!);
  const counts: Record<'all' | Tier, number> = {
    all: allCreators.length,
    A: allCreators.filter(c => c.grade === 'A').length,
    B: allCreators.filter(c => c.grade === 'B').length,
    C: allCreators.filter(c => c.grade === 'C').length,
    D: allCreators.filter(c => c.grade === 'D').length,
  };
  const filtered = tierFilter === 'all' ? allCreators : allCreators.filter(c => c.grade === tierFilter);

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
              {active && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5" style={{ background: 'var(--ube)' }} />}
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
              <CreatorAvatar creator={c} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: '#e5e5e5' }}>
                  {c.name}
                  {c.isVerified && <span className="text-[10px] text-[#3b82f6]" title="인증">✓</span>}
                  <GradeBadge grade={c.grade} />
                </div>
                <div className="text-[11px] text-[#737373] truncate">{c.handle} · {formatSubscribers(c.subscribers)}</div>
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
function SubmissionPanel({ subs }: { subs: Submission[] }) {
  const [missionFilter, setMissionFilter] = useState<'all' | MissionType>('all');
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  const filtered = subs.filter(s => {
    if (missionFilter !== 'all' && s.mission !== missionFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (tierFilter !== 'all') {
      const c = CREATORS.find(x => x.id === s.creatorId);
      if (!c || c.grade !== tierFilter) return false;
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
          <button onClick={resetAll} className="text-[11px] font-medium hover:underline" style={{ color: 'var(--ube-bright)' }}>
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
                  {s.thumbnail ?? c.profileEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: '#e5e5e5' }}>
                    {s.title ?? MISSION_LABELS[s.mission]}
                  </div>
                  <div className="text-[11px] text-[#737373] flex items-center gap-1.5 flex-wrap">
                    <span>{c.name}</span>
                    <GradeBadge grade={c.grade} />
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
        background: active ? 'var(--ube)' : '#0a0a0a',
        borderColor: active ? 'var(--ube)' : '#262626',
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
                style={{ borderColor: selectedGameId === g.id ? 'var(--ube)' : '#262626' }}
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
              className="flex-1 px-3 py-2 text-xl font-semibold border border-[#262626] rounded-md focus:outline-none focus:border-[var(--ube)] tabular-nums"
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
                  style={{ borderColor: active ? 'var(--ube)' : '#262626' }}
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
            style={{ background: 'var(--ube)' }}
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
        borderColor: editing ? 'var(--ube)' : '#262626',
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

function CreatorDirectory({
  selectedId,
  onSelect,
  creators = CREATORS,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  creators?: Creator[];
}) {
  const [gradeFilters, setGradeFilters] = useState<Tier[]>([]);
  const [genreFilter, setGenreFilter] = useState<CreatorGenreFilter | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<CreatorPlatformFilter | 'all'>('all');
  const [contentFilter, setContentFilter] = useState<CreatorContentFilter | 'all'>('all');

  const toggleGrade = (g: Tier) => {
    setGradeFilters(prev => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]));
  };

  const filtered = creators.filter(c => {
    if (gradeFilters.length > 0 && !gradeFilters.includes(c.grade)) return false;
    if (genreFilter !== 'all' && !creatorMatchesGenreFilter(c, genreFilter)) return false;
    if (platformFilter !== 'all' && !creatorHasPlatform(c, platformFilter)) return false;
    if (contentFilter !== 'all' && !creatorHasContentType(c, contentFilter)) return false;
    return true;
  });

  const pill = (active: boolean) => ({
    borderColor: active ? 'var(--ube)' : '#333',
    background: active ? 'rgba(230,60,92,0.12)' : '#1a1a1a',
    color: active ? 'var(--ube-bright)' : '#a3a3a3',
  });

  return (
    <div className="bg-[var(--bg-base)] border border-[#262626] rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold">크리에이터 목록</div>
        <div className="text-[11px] text-[#737373] tabular-nums">{filtered.length} / {creators.length}명</div>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#525252] w-12 shrink-0">등급</span>
          {(['A', 'B', 'C', 'D'] as Tier[]).map(g => {
            const active = gradeFilters.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold border transition"
                style={pill(active)}
              >
                {g}
              </button>
            );
          })}
          {gradeFilters.length > 0 && (
            <button type="button" onClick={() => setGradeFilters([])} className="text-[10px] text-[#737373] hover:text-white ml-1">
              초기화
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#525252] w-12 shrink-0">장르</span>
          <button type="button" onClick={() => setGenreFilter('all')} className="px-2 py-0.5 rounded-full text-[10px] border transition" style={pill(genreFilter === 'all')}>전체</button>
          {CREATOR_GENRE_FILTERS.map(g => (
            <button key={g} type="button" onClick={() => setGenreFilter(g)} className="px-2 py-0.5 rounded-full text-[10px] border transition" style={pill(genreFilter === g)}>{g}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#525252] w-12 shrink-0">플랫폼</span>
          {(['all', 'youtube', 'soop', 'chzzk'] as const).map(p => (
            <button key={p} type="button" onClick={() => setPlatformFilter(p)} className="px-2 py-0.5 rounded-full text-[10px] border transition" style={pill(platformFilter === p)}>
              {p === 'all' ? '전체' : p === 'youtube' ? 'YouTube' : p === 'soop' ? 'SOOP' : '치지직'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#525252] w-12 shrink-0">콘텐츠</span>
          {(['all', 'shortform', 'longform', 'live'] as const).map(ct => (
            <button key={ct} type="button" onClick={() => setContentFilter(ct)} className="px-2 py-0.5 rounded-full text-[10px] border transition" style={pill(contentFilter === ct)}>
              {ct === 'all' ? '전체' : ct === 'shortform' ? '숏폼' : ct === 'longform' ? '롱폼' : '라이브'}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid gap-2 max-h-[480px] overflow-y-auto pr-1"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 text-[12px] text-[#737373]">조건에 맞는 크리에이터가 없습니다</div>
        ) : (
          filtered.map(c => (
            <CreatorListCard key={c.id} creator={c} selected={selectedId === c.id} onSelect={() => onSelect(c.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function CreatorListCard({
  creator,
  selected,
  onSelect,
}: {
  creator: Creator;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left p-3 rounded-md border transition w-full"
      style={{
        background: 'var(--bg-card)',
        borderColor: selected ? 'var(--ube)' : '#262626',
      }}
    >
      <div className="flex gap-3">
        <CreatorAvatar creator={creator} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold truncate">{creator.name}</span>
            {creator.isVerified && <span className="text-[10px] text-[#3b82f6] font-bold">✓</span>}
            <GradeBadge grade={creator.grade} />
          </div>
          <div className="text-[10px] text-[#737373] truncate">{creator.handle}</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {creator.genres.slice(0, 3).map(g => (
              <span key={g} className="px-1.5 py-px rounded text-[9px] bg-[#1a1a1a] border border-[#333] text-[#a3a3a3]">{g}</span>
            ))}
          </div>
        </div>
        <PlatformIcons platforms={creator.platforms} />
      </div>
      <div className="flex justify-between mt-2.5 pt-2 border-t border-[#262626] text-[10px] text-[#737373] tabular-nums">
        <span>{formatSubscribers(creator.subscribers)} 구독</span>
        <span>평균 {formatViews(creator.avgViews)}</span>
        <span>캠페인 {creator.completedCampaigns}건</span>
      </div>
    </button>
  );
}

function CreatorView() {
  const { submissions } = useDemoState();
  const [myId, setMyId] = useState<string>('cr-006');
  const me = CREATORS.find(c => c.id === myId)!;
  const mySubmissions = submissions.filter(s => s.creatorId === myId);
  const totalEarned = mySubmissions.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = mySubmissions
    .filter(s => s.status === 'producing' || s.status === 'pending' || s.status === 'approved')
    .reduce((sum, s) => sum + s.amount, 0);
  return (
    <div>
      <PageHeading
        title="크리에이터 워크스페이스"
        subtitle="참여 가능한 캠페인을 둘러보고 활동으로 수익을 만드세요"
        action={<span className="text-[11px] text-[#a3a3a3] italic">데모: 크리에이터 선택 후 등급별 화면 비교</span>}
      />

      <div className="space-y-5">
        {/* 크리에이터 목록 + 필터 */}
        <CreatorDirectory selectedId={myId} onSelect={setMyId} />

        {/* 내 프로필 다크 카드 */}
        <Card dark>
          <div className="flex items-center gap-5">
            <CreatorAvatar creator={me} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold tracking-tight">{me.name}</h2>
                {me.isVerified && (
                  <span className="text-[11px] font-semibold text-[#3b82f6] border border-[#1e3a5f] px-1.5 py-0.5 rounded">✓ 인증</span>
                )}
                <GradeBadge grade={me.grade} />
                <span className="text-[11px] text-[#737373]">★ {me.rating.toFixed(1)}</span>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: '#a3a3a3' }}>{me.handle}</p>
              <p className="text-[12px] mt-1" style={{ color: '#a3a3a3' }}>
                {formatSubscribers(me.subscribers)} 구독 · 평균 {formatViews(me.avgViews)} views · 완료 캠페인 {me.completedCampaigns}건
              </p>
              <p className="text-[11px] mt-1 line-clamp-2" style={{ color: '#737373' }}>{me.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <PlatformIcons platforms={me.platforms} />
              <div className="text-[10px] uppercase tracking-wider mt-3" style={{ color: '#a3a3a3' }}>누적 수익</div>
              <div className="text-3xl font-semibold tabular-nums mt-1" style={{ color: 'var(--ube-bright)' }}>{formatKRW(totalEarned)}</div>
              {pendingAmount > 0 && (
                <div className="text-[11px] mt-0.5" style={{ color: '#a3a3a3' }}>정산 대기 {formatKRW(pendingAmount)}</div>
              )}
            </div>
          </div>
        </Card>

        {/* 캠페인 탐색 (dak.gg 스타일) */}
        <CampaignExploreSection creator={me} creatorId={myId} />

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
              {mySubmissions.map(s => (
                <CreatorActivityRow key={s.id} submission={s} creatorId={myId} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const STATUS_TABS: { id: CampaignStatusFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'live', label: '진행 중' },
  { id: 'recruiting', label: '모집 중' },
  { id: 'completed', label: '완료' },
];

const FEATURE_PILLS: { id: CampaignFeatureFilter | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'high-unit', label: '고단가' },
  { id: 'high-budget', label: '고예산' },
  { id: 'new', label: '신규' },
  { id: 'shortform', label: '숏폼 가능' },
  { id: 'live', label: '라이브 가능' },
];

function CampaignThumbnail({ thumbnail, alt = '' }: { thumbnail: CampaignThumbnail; alt?: string }) {
  if (thumbnail.type === 'url') {
    return (
      <img
        src={thumbnail.imageUrl}
        alt={alt}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${thumbnail.from}, ${thumbnail.to})`,
      }}
    >
      <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{thumbnail.emoji}</span>
    </div>
  );
}

function GamePlatformBadges({ platforms }: { platforms: Campaign['platform'] }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-[#737373]">
      {platforms.map(p => (
        <span key={p} title={p}>
          {GAME_PLATFORM_ICONS[p]}
        </span>
      ))}
    </span>
  );
}

function CreatorActivityRow({ submission, creatorId }: { submission: Submission; creatorId: string }) {
  const { campaigns, submitApplicationUrl } = useDemoState();
  const camp = campaigns.find(x => x.id === submission.campaignId)!;
  const [urlDraft, setUrlDraft] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleSubmitUrl = () => {
    if (!urlDraft.trim()) return;
    submitApplicationUrl(submission.id, urlDraft.trim());
    setShowUrlInput(false);
    setUrlDraft('');
  };

  return (
    <div className="py-2 border-b border-[#262626] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded flex items-center justify-center text-base bg-[#0a0a0a] border border-[#262626] flex-shrink-0">
          {submission.thumbnail ?? getCampaignThumbnailEmoji(camp.thumbnail)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium truncate">{submission.title ?? MISSION_LABELS[submission.mission]}</div>
          <div className="text-[11px] text-[#737373]">
            {camp.name} · {MISSION_LABELS[submission.mission]} · {submission.submittedAt}
          </div>
          {submission.views !== undefined && submission.views > 0 && (
            <div className="text-[11px] text-[#737373] tabular-nums mt-0.5">
              {formatViews(submission.views)} views · {submission.comments?.toLocaleString() ?? 0} comments
            </div>
          )}
        </div>
        <StatusBadge status={submission.status} />
        <div className="text-[13px] font-semibold tabular-nums w-20 text-right">{formatKRW(submission.amount)}</div>
      </div>
      {submission.status === 'producing' && submission.creatorId === creatorId && (
        <div className="mt-2 pl-[52px]">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-white transition hover:opacity-85"
              style={{ background: ACCENT }}
            >
              URL 제출
            </button>
          ) : (
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-3 py-1.5 border border-[#333] rounded-md text-[12px] bg-[var(--bg-base)]"
              />
              <button
                type="button"
                onClick={handleSubmitUrl}
                disabled={!urlDraft.trim()}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-white disabled:opacity-40 transition hover:opacity-85"
                style={{ background: ACCENT }}
              >
                제출
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CampaignExploreSection({ creator, creatorId }: { creator: Creator; creatorId: string }) {
  const { campaigns } = useDemoState();
  const [statusTab, setStatusTab] = useState<CampaignStatusFilter>('all');
  const [featurePill, setFeaturePill] = useState<CampaignFeatureFilter | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = campaigns.filter(c => {
    if (statusTab !== 'all' && c.status !== statusTab) return false;
    if (featurePill !== 'all' && !campaignHasFeature(c, featurePill)) return false;
    return true;
  });

  const selected = selectedId ? campaigns.find(c => c.id === selectedId) : null;

  return (
    <div className="rounded-lg border border-[#262626] overflow-hidden" style={{ background: CREATOR_BG }}>
      <div className="px-4 pt-4 pb-3 border-b border-[#262626]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold tracking-tight">캠페인 탐색</h2>
          <span className="text-[11px] text-[#737373] tabular-nums">{filtered.length}개</span>
        </div>

        <div className="flex gap-1 border-b border-[#262626] -mb-px">
          {STATUS_TABS.map(tab => {
            const active = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className="px-3 py-2 text-[12px] font-medium transition relative"
                style={{ color: active ? '#fff' : '#737373' }}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: ACCENT }} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {FEATURE_PILLS.map(pill => {
            const active = featurePill === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setFeaturePill(pill.id)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition"
                style={{
                  borderColor: active ? ACCENT : '#333',
                  background: active ? 'rgba(230,60,92,0.15)' : '#1a1a1a',
                  color: active ? ACCENT : '#a3a3a3',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#737373] text-[12px]">조건에 맞는 캠페인이 없습니다</div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
          >
            {filtered.map(c => (
              <DakggCampaignCard
                key={c.id}
                campaign={c}
                creatorId={creatorId}
                selected={selectedId === c.id}
                onSelect={() => setSelectedId(selectedId === c.id ? null : c.id)}
              />
            ))}
          </div>
        )}

        {selected && (
          <CampaignMissionPanel
            campaign={selected}
            creator={creator}
            creatorId={creatorId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

function DakggCampaignCard({
  campaign,
  creatorId,
  selected,
  onSelect,
}: {
  campaign: Campaign;
  creatorId: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const alreadyJoined = campaign.joinedCreators.includes(creatorId);
  const spentPct = getSpentPercent(campaign);
  const barColor = getBudgetBarColor(spentPct);
  const badges = getCampaignFeatureBadges(campaign);
  const statusColor = getCampaignStatusColor(campaign.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group text-left rounded-md border overflow-hidden transition w-full"
      style={{
        background: CARD_BG,
        borderColor: selected ? ACCENT : '#262626',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = ACCENT; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#262626'; }}
    >
      <div className="relative aspect-video overflow-hidden">
        <CampaignThumbnail thumbnail={campaign.thumbnail} alt={campaign.name} />
        <span
          className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: statusColor }}
        >
          {getCampaignStatusLabel(campaign.status)}
        </span>
        {alreadyJoined && (
          <span
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
            style={{ background: ACCENT }}
          >
            참여 중
          </span>
        )}
      </div>

      <div className="p-2.5 space-y-2">
        <div>
          <div className="text-[13px] font-semibold truncate leading-tight">{campaign.name}</div>
          <div className="text-[10px] text-[#737373] truncate mt-0.5">{campaign.genre}</div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map(b => {
              const meta = CAMPAIGN_FEATURE_LABELS[b];
              const text =
                b === 'shortform'
                  ? '숏폼 가능'
                  : b === 'live'
                    ? '라이브 우대'
                    : `${meta.emoji} ${meta.label}`.trim();
              return (
                <span
                  key={b}
                  className="px-1.5 py-px rounded text-[9px] font-medium border border-[#333] bg-[#1a1a1a] text-[#d4d4d4]"
                >
                  {text}
                </span>
              );
            })}
          </div>
        )}

        <div>
          <div className="flex justify-between text-[9px] text-[#737373] mb-1 tabular-nums">
            <span>예산 소진</span>
            <span style={{ color: barColor }}>{spentPct}%</span>
          </div>
          <div className="h-1 rounded-full bg-[#262626] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${spentPct}%`, background: barColor }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-[#a3a3a3] tabular-nums pt-0.5 border-t border-[#262626]">
          <span>
            {campaign.joinedCreators.length}/{campaign.targetCreators}명
            <span className="ml-1.5">
              <GamePlatformBadges platforms={campaign.platform} />
            </span>
          </span>
          <span>
            A단가 <strong className="text-[#e5e5e5] font-semibold">{formatKRW(campaign.topGrade.price)}</strong>
          </span>
        </div>
      </div>
    </button>
  );
}

function CampaignMissionPanel({
  campaign,
  creator,
  creatorId,
  onClose,
}: {
  campaign: Campaign;
  creator: Creator;
  creatorId: string;
  onClose: () => void;
}) {
  const { applyToMission, hasMissionParticipation } = useDemoState();
  const [confirmMission, setConfirmMission] = useState<MissionType | null>(null);

  const missionKeys: MissionType[] = (['short', 'long', 'live'] as MissionType[]).filter(m => {
    const campOk =
      m === 'short' ? campaign.missions.shortform : m === 'long' ? campaign.missions.longform : campaign.missions.live;
    const creatorOk =
      m === 'short' ? creator.contentTypes.shortform : m === 'long' ? creator.contentTypes.longform : creator.contentTypes.live;
    return campOk && creatorOk && getCreatorMissionReward(creator, m) > 0;
  });

  const handleConfirmApply = () => {
    if (!confirmMission) return;
    const reward = getCreatorMissionReward(creator, confirmMission);
    applyToMission({
      campaignId: campaign.id,
      creatorId,
      mission: confirmMission,
      amount: reward,
      title: `${campaign.name} · ${MISSION_LABELS[confirmMission]}`,
      thumbnail: getCampaignThumbnailEmoji(campaign.thumbnail),
    });
    setConfirmMission(null);
    onClose();
  };

  return (
    <div className="mt-4 rounded-md border border-[#333] overflow-hidden relative" style={{ background: CARD_BG, minHeight: 400 }}>
      <div className="flex items-center gap-3 p-4 border-b border-[#262626]">
        <div className="w-12 h-12 rounded overflow-hidden relative flex-shrink-0 bg-[#1a1a1a]">
          <CampaignThumbnail thumbnail={campaign.thumbnail} alt={campaign.name} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold">{campaign.name}</div>
          <div className="text-[11px] text-[#737373]">{campaign.genre} · {campaign.developer}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 rounded text-[11px] font-medium border border-[#333] text-[#a3a3a3] hover:text-white hover:opacity-85 transition"
        >
          닫기
        </button>
      </div>

      <div className="p-4">
        <div className="text-[12px] text-[#a3a3a3] mb-3">
          <strong className="text-white">{creator.name}</strong> ({creator.grade}등급) — 미션을 선택하고 지원하세요
        </div>
        <div className={`grid gap-2 ${missionKeys.length === 3 ? 'grid-cols-3' : missionKeys.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {missionKeys.map(m => {
            const reward = getCreatorMissionReward(creator, m);
            const participating = hasMissionParticipation(creatorId, campaign.id, m);
            return (
              <div
                key={m}
                className="p-3 rounded-md border flex flex-col relative"
                style={{ background: '#1a1a1a', borderColor: '#333', minHeight: 120 }}
              >
                <div className="text-[12px] font-semibold">{MISSION_LABELS[m]}</div>
                <div className="mt-2 text-xl font-semibold tabular-nums flex-1" style={{ color: ACCENT }}>
                  {formatKRW(reward)}
                </div>
                <div className="flex justify-end mt-2">
                  {participating ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-medium border border-[#333] text-[#737373]">
                      참여 중
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmMission(m)}
                      className="px-2.5 py-1 rounded text-[10px] font-semibold text-white transition hover:opacity-85"
                      style={{ background: ACCENT }}
                    >
                      지원하기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-[#737373] mt-3">
          지원 후 콘텐츠를 제작하고, 내 활동 내역에서 URL을 제출하면 검수가 시작됩니다.
        </p>
      </div>

      {confirmMission && (
        <div
          className="absolute inset-0 flex items-center justify-center p-4 rounded-md"
          style={{ background: 'rgba(0,0,0,0.75)' }}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-[#333] p-5"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="text-[14px] font-semibold mb-1">지원 확인</div>
            <div className="text-[12px] text-[#a3a3a3] mb-4">
              <strong className="text-white">{campaign.name}</strong>
              <br />
              {MISSION_LABELS[confirmMission]}
            </div>
            <div className="rounded-md p-3 mb-4 border border-[#262626]" style={{ background: 'var(--bg-base)' }}>
              <div className="text-[10px] text-[#737373] uppercase tracking-wider">예상 수익</div>
              <div className="text-2xl font-semibold tabular-nums mt-1" style={{ color: ACCENT }}>
                {formatKRW(getCreatorMissionReward(creator, confirmMission))}
              </div>
              <div className="text-[10px] text-[#737373] mt-1">{creator.grade}등급 기준 단가</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmMission(null)}
                className="flex-1 py-2 rounded-md text-[12px] font-medium border border-[#333] text-[#a3a3a3] hover:text-white hover:opacity-85 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                className="flex-1 py-2 rounded-md text-[12px] font-semibold text-white hover:opacity-85 transition"
                style={{ background: ACCENT }}
              >
                지원 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 관리자 탭
// =====================================================================

function AdminView() {
  const { campaigns, submissions, approveSubmission } = useDemoState();
  const [selectedId, setSelectedId] = useState<string>('camp-001');
  const campaign = campaigns.find(c => c.id === selectedId) ?? campaigns[0];
  const subs = submissions.filter(s => s.campaignId === campaign.id);
  const pendingReview = submissions.filter(s => s.status === 'pending');

  const totalGMV = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  const activeCampaigns = campaigns.filter(c => c.status !== 'completed').length;
  const activeCreators = new Set(campaigns.flatMap(c => c.joinedCreators)).size;
  const totalSubmissions = submissions.length;

  const joined = campaign.joinedCreators.map(cid => CREATORS.find(c => c.id === cid)!);
  const byTier: Record<Tier, typeof joined> = { A: [], B: [], C: [], D: [] };
  joined.forEach(c => byTier[c.grade].push(c));

  const paid = subs.filter(s => s.status === 'paid');
  const approved = subs.filter(s => s.status === 'approved');
  const producing = subs.filter(s => s.status === 'producing');
  const pending = subs.filter(s => s.status === 'pending');
  const paidAmount = paid.reduce((sum, s) => sum + s.amount, 0);
  const approvedAmount = approved.reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = pending.reduce((sum, s) => sum + s.amount, 0);
  const remaining = Math.max(0, campaign.totalBudget - campaign.spentBudget);

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
          <Stat label="활성 캠페인"      value={`${activeCampaigns}`} sub={`전체 ${campaigns.length}개`} />
          <Stat label="활성 크리에이터"  value={`${activeCreators}`} sub="현재 캠페인 참여 중" />
          <Stat label="제출 콘텐츠"      value={`${totalSubmissions}`} sub="전체 캠페인 합산" />
        </div>

        {/* 전체 캠페인 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">전체 캠페인</div>
            <div className="text-[11px] text-[#737373] tabular-nums">{campaigns.length}개</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {campaigns.map(c => {
              const cSubs = submissions.filter(s => s.campaignId === c.id);
              const cPaid = cSubs.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
              const progress = Math.min(100, Math.round((c.joinedCreators.length / c.targetCreators) * 100));
              const active = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="text-left p-3 rounded-md border transition bg-[#171717]"
                  style={{ borderColor: active ? 'var(--ube)' : '#262626' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <CampaignThumbnail thumbnail={c.thumbnail} alt={c.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <div className="font-semibold text-[13px] truncate">{c.name}</div>
                        <StatusPill status={c.status} />
                      </div>
                      <div className="text-[11px] text-[#737373]">{c.developer}</div>
                      <div className="mt-2 text-[11px] text-[#a3a3a3] tabular-nums">
                        예산 <strong className="font-semibold text-[#e5e5e5]">{formatKRW(c.totalBudget)}</strong> · {c.joinedCreators.length}/{c.targetCreators}명
                      </div>
                      <div className="h-1 bg-[#262626] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--ube)' }} />
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
            <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
              <CampaignThumbnail thumbnail={campaign.thumbnail} alt={campaign.name} />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>{campaign.id} · {campaign.createdAt}</div>
              <div className="text-xl font-semibold tracking-tight">{campaign.name}</div>
              <div className="text-[12px]" style={{ color: '#a3a3a3' }}>{campaign.developer}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a3a3a3' }}>Campaign Pool</div>
              <div className="text-3xl font-semibold tabular-nums" style={{ color: 'var(--ube-bright)' }}>{formatKRW(campaign.totalBudget)}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#262626]">
            <AdminKPI label="참여 크리에이터" value={`${joined.length}`} sub={`목표 ${campaign.targetCreators}명`} />
            <AdminKPI label="제출 콘텐츠"     value={`${subs.length}`} sub={`${paid.length}/${approved.length}/${pending.length}`} />
            <AdminKPI label="지급 완료액"     value={formatKRW(paidAmount)} sub={`${campaign.totalBudget > 0 ? Math.round((paidAmount / campaign.totalBudget) * 100) : 0}%`} />
            <AdminKPI label="잔여 예산"       value={formatKRW(remaining)} sub="추가 참여 가능" accent />
          </div>
        </Card>

        {/* 예산 분배 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">예산 분배 현황</div>
            <div className="text-[11px] text-[#737373] tabular-nums">총 {formatKRW(campaign.totalBudget)}</div>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex bg-[#262626]">
            <FlowSegment amount={paidAmount}     total={campaign.totalBudget} color="#10b981" />
            <FlowSegment amount={approvedAmount} total={campaign.totalBudget} color="#3b82f6" />
            <FlowSegment amount={pendingAmount}  total={campaign.totalBudget} color="#f59e0b" />
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
                      <div className="h-full rounded-full" style={{ width: `${ratio}%`, background: 'var(--ube)' }} />
                    </div>
                    {list.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {list.map(c => (
                          <span key={c.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#0a0a0a] border border-[#262626]">
                            <span>{c.profileEmoji}</span>
                            <span className="text-[#a3a3a3]">{c.name}</span>
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
                      <div className="text-lg font-semibold tabular-nums" style={{ color: 'var(--ube-bright)' }}>{stat.count}</div>
                    </div>
                    <div className="h-1 bg-[#262626] rounded-full overflow-hidden mb-1.5">
                      <div className="h-full" style={{ width: `${ratio}%`, background: 'var(--ube)' }} />
                    </div>
                    <div className="text-[11px] text-[#737373] tabular-nums">집행 {formatKRW(stat.amount)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 콘텐츠 검수 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold">콘텐츠 검수</div>
            <div className="text-[11px] text-[#737373] tabular-nums">검수 중 {pendingReview.length}건</div>
          </div>
          {pendingReview.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-[#737373]">검수 대기 중인 제출물이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {pendingReview.map(s => {
                const c = CREATORS.find(x => x.id === s.creatorId)!;
                const camp = campaigns.find(x => x.id === s.campaignId)!;
                const { display, href } = getDisplayUrl(s.url);
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 p-3 rounded-md border border-[#262626] bg-[var(--bg-base)]"
                  >
                    <CreatorAvatar creator={c} size="sm" />
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-[13px] font-semibold">{c.name}</div>
                      <div className="text-[11px] text-[#737373]">
                        {camp.name} · {MISSION_LABELS[s.mission]}
                      </div>
                      {s.url && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#60a5fa] hover:underline truncate block mt-0.5"
                        >
                          {display}
                        </a>
                      )}
                    </div>
                    <div className="text-[13px] font-semibold tabular-nums" style={{ color: ACCENT }}>
                      {formatKRW(s.amount)}
                    </div>
                    <button
                      type="button"
                      onClick={() => approveSubmission(s.id)}
                      className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold text-white transition hover:opacity-85"
                      style={{ background: '#10b981' }}
                    >
                      승인
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 활동 타임라인 */}
        <Card className="p-4">
          <div className="text-[13px] font-semibold mb-3">실시간 활동 타임라인</div>
          <div className="space-y-1">
            {[...subs].reverse().slice(0, 10).map(s => {
              const c = CREATORS.find(x => x.id === s.creatorId)!;
              return (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[#262626] last:border-0">
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--ube)' }} />
                  <div className="text-base">{s.thumbnail ?? c.profileEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] truncate">
                      <strong className="font-semibold">{c.name}</strong>
                      <span className="text-[#737373]"> · {c.grade}등급</span>
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
      <div className="text-xl font-semibold tabular-nums mt-0.5" style={{ color: accent ? 'var(--ube-bright)' : 'white' }}>{value}</div>
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
