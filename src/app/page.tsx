'use client';

import { useState } from 'react';

import {
  GAMES,
  CREATORS,
  SAMPLE_CAMPAIGN,
  SUBMISSIONS,
  MISSION_RATES,
  MISSION_LABELS,
  TIER_INFO,
  formatKRW,
  formatSubs,
  type MissionType,
  type Tier,
} from '@/lib/mockData';

type Tab = 'publisher' | 'creator' | 'admin';

export default function Home() {
  const [tab, setTab] = useState<Tab>('publisher');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 샘플 데이터 배너 */}
      <div className="bg-yellow-100 text-yellow-900 text-center text-sm py-2 font-medium">
        ⚠️ 이 페이지는 데모용 샘플 데이터입니다. 실제 운영 화면이 아닙니다.
      </div>

      {/* 상단 헤더 + 탭 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black">
              Project <span style={{ color: '#FF3366' }}>Creator</span>
            </span>
            <span className="text-xs text-gray-400 font-medium ml-2">DEMO</span>
          </div>

          <nav className="flex gap-1 bg-gray-100 rounded-full p-1">
            <TabButton active={tab === 'publisher'} onClick={() => setTab('publisher')}>
              🎮 게임사
            </TabButton>
            <TabButton active={tab === 'creator'} onClick={() => setTab('creator')}>
              🎯 크리에이터
            </TabButton>
            <TabButton active={tab === 'admin'} onClick={() => setTab('admin')}>
              ⚡ 관리자
            </TabButton>
          </nav>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'publisher' && <PublisherView />}
        {tab === 'creator' && <CreatorView />}
        {tab === 'admin' && <AdminView />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
        active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800'
      }`}
      style={active ? { color: '#FF3366' } : {}}
    >
      {children}
    </button>
  );
}

function PublisherView() {
  const [mode, setMode] = useState<'dashboard' | 'create'>('dashboard');

  return (
    <div className="space-y-6">
      {/* 모드 토글 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">게임사 워크스페이스</h1>
          <p className="text-gray-500 mt-1">캠페인을 만들고 진행 상황을 확인하세요</p>
        </div>
        <button
          onClick={() => setMode(mode === 'dashboard' ? 'create' : 'dashboard')}
          className="px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-md hover:shadow-lg transition"
          style={{ background: '#FF3366' }}
        >
          {mode === 'dashboard' ? '+ 새 캠페인 만들기' : '← 대시보드로 돌아가기'}
        </button>
      </div>

      {mode === 'dashboard' ? <PublisherDashboard /> : <PublisherCreate />}
    </div>
  );
}

// === 게임사: 대시보드 (기본 화면) ===
function PublisherDashboard() {
  const campaign = SAMPLE_CAMPAIGN;
  const game = GAMES.find((g) => g.id === campaign.gameId)!;
  const joinedCount = campaign.joinedCreators.length;
  const progress = Math.round((joinedCount / campaign.targetCreators) * 100);

  // 정산 현황 집계
  const paid = SUBMISSIONS.filter((s) => s.status === 'paid');
  const approved = SUBMISSIONS.filter((s) => s.status === 'approved');
  const pending = SUBMISSIONS.filter((s) => s.status === 'pending');
  const totalSpent = paid.reduce((sum, s) => sum + s.amount, 0);
  const remaining = campaign.budget - totalSpent - approved.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* 캠페인 카드 헤더 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="text-6xl">{game.thumbnail}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-400 tracking-wider">진행 중인 캠페인 · #{campaign.id}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                ● LIVE
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{game.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {game.publisher} · {game.publisherType} · {game.genre}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-bold tracking-wider">총 예산</div>
            <div className="text-3xl font-black" style={{ color: '#FF3366' }}>
              {formatKRW(campaign.budget)}
            </div>
          </div>
        </div>
      </div>

      {/* 핵심 지표 4개 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="모집 진행률" value={`${progress}%`} sub={`${joinedCount} / ${campaign.targetCreators} 명`} />
        <StatCard
          label="제출된 콘텐츠"
          value={`${SUBMISSIONS.length} 건`}
          sub={`${paid.length} 지급 · ${approved.length} 승인 · ${pending.length} 검수중`}
        />
        <StatCard label="지급 완료" value={formatKRW(totalSpent)} sub={`예산의 ${Math.round((totalSpent / campaign.budget) * 100)}%`} />
        <StatCard label="잔여 예산" value={formatKRW(remaining)} sub="추가 참여 가능" highlight />
      </div>

      {/* 모집 진행률 바 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-gray-900">크리에이터 모집 진행률</div>
          <div className="text-sm text-gray-500">
            목표 {campaign.targetCreators}명 중 {joinedCount}명 참여 중
          </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF3366, #ff5588)' }}
          />
        </div>
      </div>

      {/* 참여 크리에이터 목록 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-black text-gray-900 mb-4">참여 중인 크리에이터 ({joinedCount}명)</div>
        <div className="grid grid-cols-2 gap-3">
          {campaign.joinedCreators.map((cid) => {
            const c = CREATORS.find((x) => x.id === cid)!;
            const mySubs = SUBMISSIONS.filter((s) => s.creatorId === cid);
            return (
              <div key={cid} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, #FFB3C5, #FF3366)' }}
                >
                  {c.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">
                    {c.nickname}
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded font-black"
                      style={{ background: '#FFE4EC', color: '#FF3366' }}
                    >
                      {c.tier}등급
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.platform} · {formatSubs(c.subscribers)} 구독자 · {c.specialty}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">제출</div>
                  <div className="text-sm font-black text-gray-900">{mySubs.length}건</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 제출된 콘텐츠 리스트 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-black text-gray-900 mb-4">최근 제출된 콘텐츠</div>
        <div className="space-y-2">
          {SUBMISSIONS.map((s) => {
            const c = CREATORS.find((x) => x.id === s.creatorId)!;
            return (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="text-2xl">{c.avatar}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">
                    {c.nickname} <span className="text-xs text-gray-400 font-normal">({c.tier}등급)</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {MISSION_LABELS[s.mission]} · {s.submittedAt}
                  </div>
                </div>
                <StatusBadge status={s.status} />
                <div className="font-black text-gray-900 w-20 text-right">{formatKRW(s.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === 게임사: 캠페인 생성 화면 ===
function PublisherCreate() {
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0].id);
  const [budget, setBudget] = useState(3000000);
  const [selectedMissions, setSelectedMissions] = useState<MissionType[]>(['short', 'long', 'live']);
  const [submitted, setSubmitted] = useState(false);

  const selectedGame = GAMES.find((g) => g.id === selectedGameId)!;
  const toggleMission = (m: MissionType) => {
    setSelectedMissions((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <div className="text-2xl font-black text-gray-900 mb-2">캠페인이 생성되었습니다!</div>
        <p className="text-gray-500 mb-6">
          크리에이터들이 자율적으로 응모하기 시작합니다. 대시보드에서 진행 상황을 확인하세요.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-3 rounded-full text-white font-bold"
          style={{ background: '#FF3366' }}
        >
          대시보드로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* 좌측 폼 */}
      <div className="col-span-2 space-y-6">
        {/* 게임 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="font-black text-gray-900 mb-3">1. 게임 선택</div>
          <div className="grid grid-cols-3 gap-3">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGameId(g.id)}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  selectedGameId === g.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedGameId === g.id ? { borderColor: '#FF3366', background: '#FFF4F7' } : {}}
              >
                <div className="text-3xl mb-2">{g.thumbnail}</div>
                <div className="font-black text-gray-900">{g.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {g.publisherType} · {g.genre}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 예산 입력 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="font-black text-gray-900 mb-3">2. 예산 거치</div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              step={500000}
              min={500000}
              className="flex-1 px-4 py-3 text-2xl font-black border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              style={{ borderColor: '#e5e7eb' }}
            />
            <span className="text-lg font-bold text-gray-600">원</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">최소 ₩50만부터 시작 가능 · 캠페인 풀에 거치되며 활동 완료 시 자동 분배</div>
        </div>

        {/* 미션 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="font-black text-gray-900 mb-1">3. 원하는 미션 선택</div>
          <p className="text-xs text-gray-500 mb-4">단가는 크리에이터 등급에 따라 자동 적용됩니다</p>
          <div className="space-y-3">
            {(Object.keys(MISSION_LABELS) as MissionType[]).map((m) => {
              const active = selectedMissions.includes(m);
              const rates = MISSION_RATES[m];
              return (
                <button
                  key={m}
                  onClick={() => toggleMission(m)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    active ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                  }`}
                  style={active ? { borderColor: '#FF3366', background: '#FFF4F7' } : {}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-black text-gray-900">
                      {active && '✓ '}
                      {MISSION_LABELS[m]}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {(['D', 'C', 'B', 'A'] as Tier[]).map((tier) => (
                      <div key={tier} className="text-center p-2 rounded bg-white border border-gray-100">
                        <div className="text-gray-400 font-bold">{tier}등급</div>
                        <div className="font-black text-gray-900 mt-0.5">{formatKRW(rates[tier])}</div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 우측 요약 */}
      <div className="space-y-4">
        <div className="rounded-2xl p-6 text-white sticky top-24" style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d3f)' }}>
          <div className="text-xs font-bold tracking-wider mb-1" style={{ color: '#FF9BB3' }}>
            CAMPAIGN SUMMARY
          </div>
          <div className="text-3xl mb-1">{selectedGame.thumbnail}</div>
          <div className="font-black text-lg">{selectedGame.name}</div>
          <div className="text-xs text-gray-300 mb-5">{selectedGame.publisher}</div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">예산</span>
              <span className="font-black">{formatKRW(budget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">선택한 미션</span>
              <span className="font-black">{selectedMissions.length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">예상 참여</span>
              <span className="font-black">10~25명</span>
            </div>
          </div>

          <button
            onClick={() => setSubmitted(true)}
            disabled={selectedMissions.length === 0 || budget < 500000}
            className="w-full mt-6 py-3 rounded-full font-black disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#FF3366' }}
          >
            예산 거치 & 캠페인 오픈
          </button>
        </div>
      </div>
    </div>
  );
}

// === 공용: 통계 카드 ===
function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-5 border ${highlight ? 'border-pink-300 bg-pink-50' : 'border-gray-200 bg-white'}`}
      style={highlight ? { borderColor: '#FF3366', background: '#FFF4F7' } : {}}
    >
      <div className="text-xs font-bold text-gray-400 tracking-wider">{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color: highlight ? '#FF3366' : '#1a1a1a' }}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

// === 공용: 상태 배지 ===
function StatusBadge({ status }: { status: 'pending' | 'approved' | 'paid' }) {
  const map = {
    pending: { label: '검수 중', bg: '#FEF3C7', fg: '#92400E' },
    approved: { label: '승인 완료', bg: '#DBEAFE', fg: '#1E40AF' },
    paid: { label: '지급 완료', bg: '#D1FAE5', fg: '#065F46' },
  };
  const s = map[status];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

function CreatorView() {
  // "지금 어떤 크리에이터로 보고 있나" 토글 — 기자분이 등급별 화면 비교용
  const [myId, setMyId] = useState<string>('c4'); // 기본: 빵수르 (B등급)
  const me = CREATORS.find((c) => c.id === myId)!;

  // 내 활동 내역 (SUBMISSIONS 중 내 것만)
  const mySubmissions = SUBMISSIONS.filter((s) => s.creatorId === myId);
  const totalEarned = mySubmissions.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = mySubmissions.filter((s) => s.status !== 'paid').reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* 상단 헤더 + 크리에이터 전환기 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">크리에이터 워크스페이스</h1>
          <p className="text-gray-500 mt-1">참여 가능한 캠페인을 둘러보고 활동으로 수익을 만드세요</p>
        </div>
        <div className="text-xs text-gray-400 italic">데모: 다른 크리에이터로 전환하여 등급별 화면 차이를 확인하세요 ↓</div>
      </div>

      {/* 크리에이터 선택 바 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="text-xs font-bold text-gray-400 tracking-wider mb-2">지금 로그인 중인 크리에이터</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CREATORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setMyId(c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 whitespace-nowrap transition ${
                myId === c.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={myId === c.id ? { borderColor: '#FF3366', background: '#FFF4F7' } : {}}
            >
              <span className="text-xl">{c.avatar}</span>
              <span className="text-sm font-bold text-gray-900">{c.nickname}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-black"
                style={{ background: '#FFE4EC', color: '#FF3366' }}
              >
                {c.tier}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 내 프로필 카드 */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d3f)' }}>
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg, #FFB3C5, #FF3366)' }}
          >
            {me.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{me.nickname}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-black" style={{ background: '#FF3366' }}>
                {me.tier}등급 · {TIER_INFO[me.tier].label}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: '#FF9BB3' }}>
              {me.platform} · {formatSubs(me.subscribers)} 구독자 · {me.specialty}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs tracking-wider mb-1" style={{ color: '#FF9BB3' }}>
              누적 수익 (이 캠페인)
            </div>
            <div className="text-4xl font-black" style={{ color: '#FF3366' }}>
              {formatKRW(totalEarned)}
            </div>
            {pendingAmount > 0 && (
              <div className="text-xs text-gray-300 mt-1">정산 대기 {formatKRW(pendingAmount)}</div>
            )}
          </div>
        </div>
      </div>

      {/* 참여 가능한 캠페인 목록 (지금은 1건) */}
      <div>
        <div className="font-black text-gray-900 mb-3">참여 가능한 캠페인</div>
        <CampaignCardForCreator creatorTier={me.tier} creatorId={myId} />
      </div>

      {/* 내 활동 내역 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-black text-gray-900 mb-4">내 활동 내역</div>
        {mySubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            아직 제출한 활동이 없습니다. 위 캠페인에서 미션에 참여해보세요!
          </div>
        ) : (
          <div className="space-y-2">
            {mySubmissions.map((s) => {
              const game = GAMES.find((g) => g.id === SAMPLE_CAMPAIGN.gameId)!;
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="text-2xl">{game.thumbnail}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900">{MISSION_LABELS[s.mission]}</div>
                    <div className="text-xs text-gray-500">
                      {game.name} · 제출일 {s.submittedAt}
                      {s.url && (
                        <>
                          {' '}
                          ·{' '}
                          <a href={s.url} className="underline" target="_blank" rel="noopener noreferrer">
                            콘텐츠 보기
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                  <div className="font-black text-gray-900 w-20 text-right">{formatKRW(s.amount)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// === 크리에이터: 캠페인 카드 (참여 가능 + 미션 선택 + 제출) ===
function CampaignCardForCreator({ creatorTier, creatorId }: { creatorTier: Tier; creatorId: string }) {
  const campaign = SAMPLE_CAMPAIGN;
  const game = GAMES.find((g) => g.id === campaign.gameId)!;
  const alreadyJoined = campaign.joinedCreators.includes(creatorId);
  const [expanded, setExpanded] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionType | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [step, setStep] = useState<'browse' | 'submitted'>('browse');

  return (
    <div
      className="bg-white border-2 rounded-2xl overflow-hidden transition"
      style={{ borderColor: expanded ? '#FF3366' : '#e5e7eb' }}
    >
      {/* 캠페인 헤더 */}
      <div className="p-5 flex items-center gap-4">
        <div className="text-5xl">{game.thumbnail}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-gray-900">{game.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">● 모집 중</span>
            {alreadyJoined && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FFE4EC', color: '#FF3366' }}>
                참여 중
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{game.description}</p>
          <div className="text-xs text-gray-400 mt-1">
            {game.publisher} · 총 예산 {formatKRW(campaign.budget)} · 목표 {campaign.targetCreators}명
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-5 py-2.5 rounded-full font-bold text-sm text-white"
          style={{ background: '#FF3366' }}
        >
          {expanded ? '닫기' : '미션 보기 →'}
        </button>
      </div>

      {/* 펼쳐진 미션 영역 */}
      {expanded && (
        <div className="border-t-2 p-5" style={{ borderColor: '#FFE4EC', background: '#FFF8FA' }}>
          {step === 'browse' ? (
            <>
              <div className="text-sm text-gray-700 mb-3">
                <strong>{creatorTier}등급</strong>인 당신이 받을 수 있는 리워드:
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {(Object.keys(MISSION_LABELS) as MissionType[]).map((m) => {
                  const reward = MISSION_RATES[m][creatorTier];
                  const isSelected = selectedMission === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMission(m)}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        isSelected ? 'border-pink-500' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      style={isSelected ? { borderColor: '#FF3366', background: 'white' } : {}}
                    >
                      <div className="text-xs font-bold text-gray-400">{isSelected ? '✓ 선택됨' : ''}</div>
                      <div className="font-black text-gray-900 text-sm mt-1">{MISSION_LABELS[m]}</div>
                      <div className="mt-3 text-2xl font-black" style={{ color: '#FF3366' }}>
                        {formatKRW(reward)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedMission && (
                <div className="bg-white border-2 rounded-xl p-4" style={{ borderColor: '#FF3366' }}>
                  <div className="font-black text-gray-900 mb-2">완성한 콘텐츠 URL을 제출하세요</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={submittedUrl}
                      onChange={(e) => setSubmittedUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => setStep('submitted')}
                      disabled={!submittedUrl}
                      className="px-5 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                      style={{ background: '#FF3366' }}
                    >
                      제출하기
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    제출 후 검수(보통 24시간) → 승인 → 자동 정산 (3.3% 원천징수 처리 포함)
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-xl font-black text-gray-900 mb-1">제출 완료!</div>
              <div className="text-sm text-gray-500 mb-4">
                {MISSION_LABELS[selectedMission!]} · 예상 리워드{' '}
                <strong style={{ color: '#FF3366' }}>{formatKRW(MISSION_RATES[selectedMission!][creatorTier])}</strong>
              </div>
              <div className="text-xs text-gray-400">
                검수가 완료되면 자동 정산됩니다. 내 활동 내역에서 진행 상황을 확인하세요.
              </div>
              <button
                onClick={() => {
                  setStep('browse');
                  setSelectedMission(null);
                  setSubmittedUrl('');
                  setExpanded(false);
                }}
                className="mt-4 px-5 py-2 rounded-full font-bold text-sm border-2"
                style={{ borderColor: '#FF3366', color: '#FF3366' }}
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

function AdminView() {
  const campaign = SAMPLE_CAMPAIGN;
  const game = GAMES.find((g) => g.id === campaign.gameId)!;

  // 등급별 참여 크리에이터 집계
  const joinedCreators = campaign.joinedCreators.map((cid) => CREATORS.find((c) => c.id === cid)!);
  const byTier: Record<Tier, typeof joinedCreators> = { A: [], B: [], C: [], D: [] };
  joinedCreators.forEach((c) => byTier[c.tier].push(c));

  // 정산 집계
  const paid = SUBMISSIONS.filter((s) => s.status === 'paid');
  const approved = SUBMISSIONS.filter((s) => s.status === 'approved');
  const pending = SUBMISSIONS.filter((s) => s.status === 'pending');
  const paidAmount = paid.reduce((sum, s) => sum + s.amount, 0);
  const approvedAmount = approved.reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = pending.reduce((sum, s) => sum + s.amount, 0);
  const allocated = paidAmount + approvedAmount + pendingAmount;
  const remaining = campaign.budget - allocated;

  // 미션별 집계
  const byMission: Record<MissionType, { count: number; amount: number }> = {
    short: { count: 0, amount: 0 },
    long: { count: 0, amount: 0 },
    live: { count: 0, amount: 0 },
  };
  SUBMISSIONS.forEach((s) => {
    byMission[s.mission].count += 1;
    byMission[s.mission].amount += s.amount;
  });

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-500 mt-1">캠페인 전체 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 캠페인 요약 + 4대 KPI */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d3f)' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="text-5xl">{game.thumbnail}</div>
          <div className="flex-1">
            <div className="text-xs font-bold tracking-wider" style={{ color: '#FF9BB3' }}>
              운영 중인 캠페인 · #{campaign.id}
            </div>
            <div className="text-2xl font-black">{game.name}</div>
            <div className="text-sm text-gray-300">
              {game.publisher} · 시작일 {campaign.createdAt}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs tracking-wider" style={{ color: '#FF9BB3' }}>
              CAMPAIGN POOL
            </div>
            <div className="text-4xl font-black" style={{ color: '#FF3366' }}>
              {formatKRW(campaign.budget)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 pt-5 border-t border-white/10">
          <AdminKPI label="참여 크리에이터" value={`${joinedCreators.length}명`} sub={`목표 ${campaign.targetCreators}명`} />
          <AdminKPI
            label="제출 콘텐츠"
            value={`${SUBMISSIONS.length}건`}
            sub={`${paid.length} 지급 · ${approved.length} 승인 · ${pending.length} 검수`}
          />
          <AdminKPI
            label="지급 완료액"
            value={formatKRW(paidAmount)}
            sub={`예산의 ${Math.round((paidAmount / campaign.budget) * 100)}%`}
          />
          <AdminKPI label="잔여 예산" value={formatKRW(remaining)} sub="추가 참여 가능" highlight />
        </div>
      </div>

      {/* 예산 분배 바 (시각화 핵심) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-gray-900">예산 분배 현황</div>
          <div className="text-sm text-gray-500">총 {formatKRW(campaign.budget)}</div>
        </div>
        <div className="h-10 rounded-full overflow-hidden flex bg-gray-100">
          <FlowSegment amount={paidAmount} total={campaign.budget} color="#10b981" label="지급" />
          <FlowSegment amount={approvedAmount} total={campaign.budget} color="#3b82f6" label="승인" />
          <FlowSegment amount={pendingAmount} total={campaign.budget} color="#f59e0b" label="검수" />
          <FlowSegment amount={remaining} total={campaign.budget} color="#e5e7eb" label="잔여" dark />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <Legend color="#10b981" label={`지급 완료 ${formatKRW(paidAmount)}`} />
          <Legend color="#3b82f6" label={`승인 (지급 대기) ${formatKRW(approvedAmount)}`} />
          <Legend color="#f59e0b" label={`검수 중 ${formatKRW(pendingAmount)}`} />
          <Legend color="#e5e7eb" label={`잔여 예산 ${formatKRW(remaining)}`} />
        </div>
      </div>

      {/* 2단 그리드: 좌측 등급별 참여 / 우측 미션별 집계 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 등급별 참여 분포 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="font-black text-gray-900 mb-4">등급별 참여 크리에이터</div>
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as Tier[]).map((tier) => {
              const list = byTier[tier];
              const ratio = joinedCreators.length > 0 ? (list.length / joinedCreators.length) * 100 : 0;
              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 w-12">{tier}등급</span>
                      <span className="text-xs text-gray-500">{TIER_INFO[tier].label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{list.length}명</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${ratio}%`, background: '#FF3366' }} />
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {list.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-50 border border-gray-200"
                      >
                        <span>{c.avatar}</span>
                        <span className="font-bold text-gray-700">{c.nickname}</span>
                      </span>
                    ))}
                    {list.length === 0 && <span className="text-xs text-gray-400 italic">참여자 없음</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 미션별 집계 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="font-black text-gray-900 mb-4">미션별 활동 집계</div>
          <div className="space-y-4">
            {(Object.keys(MISSION_LABELS) as MissionType[]).map((m) => {
              const stat = byMission[m];
              const ratio = SUBMISSIONS.length > 0 ? (stat.count / SUBMISSIONS.length) * 100 : 0;
              return (
                <div key={m} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-gray-900">{MISSION_LABELS[m]}</div>
                    <div className="text-2xl font-black" style={{ color: '#FF3366' }}>
                      {stat.count}건
                    </div>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                    <div className="h-full" style={{ width: `${ratio}%`, background: 'linear-gradient(90deg, #FFB3C5, #FF3366)' }} />
                  </div>
                  <div className="text-xs text-gray-500">
                    집행 금액 <strong className="text-gray-900">{formatKRW(stat.amount)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 활동 타임라인 (최근 → 과거) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-black text-gray-900 mb-4">실시간 활동 타임라인</div>
        <div className="space-y-3">
          {[...SUBMISSIONS].reverse().map((s) => {
            const c = CREATORS.find((x) => x.id === s.creatorId)!;
            return (
              <div key={s.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#FF3366' }} />
                <div className="text-2xl">{c.avatar}</div>
                <div className="flex-1">
                  <div className="text-sm">
                    <strong className="text-gray-900">{c.nickname}</strong>
                    <span className="text-gray-400"> ({c.tier}등급)</span>
                    <span className="text-gray-600">님이 </span>
                    <strong className="text-gray-900">{MISSION_LABELS[s.mission]}</strong>
                    <span className="text-gray-600"> 활동을 제출했습니다</span>
                  </div>
                  <div className="text-xs text-gray-400">{s.submittedAt}</div>
                </div>
                <StatusBadge status={s.status} />
                <div className="font-black text-gray-900 w-20 text-right">{formatKRW(s.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === 관리자: KPI 카드 (다크 테마) ===
function AdminKPI({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: highlight ? 'rgba(255,51,102,0.15)' : 'rgba(255,255,255,0.05)' }}
    >
      <div className="text-xs font-bold tracking-wider" style={{ color: highlight ? '#FF3366' : '#FF9BB3' }}>
        {label}
      </div>
      <div className="text-2xl font-black mt-1" style={{ color: highlight ? '#FF3366' : 'white' }}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}

// === 관리자: 예산 분배 바 세그먼트 ===
function FlowSegment({
  amount,
  total,
  color,
  label,
  dark,
}: {
  amount: number;
  total: number;
  color: string;
  label: string;
  dark?: boolean;
}) {
  const ratio = total > 0 ? (amount / total) * 100 : 0;
  if (ratio <= 0) return null;
  return (
    <div
      className="h-full flex items-center justify-center text-xs font-black"
      style={{ width: `${ratio}%`, background: color, color: dark ? '#9ca3af' : 'white' }}
    >
      {ratio >= 8 && label}
    </div>
  );
}

// === 관리자: 범례 ===
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-3 rounded" style={{ background: color }} />
      <span className="text-gray-600">{label}</span>
    </span>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
      <div className="text-2xl font-black text-gray-900 mb-2">{title}</div>
      <div className="text-gray-500">{desc}</div>
    </div>
  );
}
