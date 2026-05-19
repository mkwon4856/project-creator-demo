// Project Creator 데모 가짜 데이터 — 풍성판 v2
// 게임 5개, 크리에이터 18명, 캠페인 4개(다양한 상태), 제출 25건

export type Tier = 'A' | 'B' | 'C' | 'D';
export type MissionType = 'short' | 'long' | 'live';

export const TIER_INFO: Record<Tier, { min: number; label: string }> = {
  A: { min: 300000, label: '30만+ 구독자' },
  B: { min: 100000, label: '10만+ 구독자' },
  C: { min: 50000,  label: '5만+ 구독자' },
  D: { min: 10000,  label: '1만+ 구독자' },
};

export const MISSION_RATES: Record<MissionType, Record<Tier, number>> = {
  short: { D: 50000,  C: 100000, B: 150000, A: 300000 },
  long:  { D: 250000, C: 450000, B: 700000, A: 1400000 },
  live:  { D: 200000, C: 350000, B: 500000, A: 1000000 },
};

export const MISSION_LABELS: Record<MissionType, string> = {
  short: '숏폼 영상 1편',
  long:  '롱폼 영상 1편 (8분+)',
  live:  '라이브 방송 5시간+',
};

export type Game = {
  id: string;
  name: string;
  genre: string;
  publisher: string;
  publisherType: '인디' | '중소' | '중견';
  thumbnail: string;
  description: string;
  tags: string[];
  platforms: ('PC' | 'Mobile' | 'Console')[];
};

export const GAMES: Game[] = [
  { id: 'neon-riders',    name: '네온 라이더즈',  genre: '사이버펑크 레이싱',   publisher: 'Pulse Games',        publisherType: '인디', thumbnail: '🏎️', description: '2099년 네온 도시를 질주하는 하이스피드 레이싱',         tags: ['레이싱', '사이버펑크', '멀티플레이'], platforms: ['PC', 'Console'] },
  { id: 'dungeon-bakery', name: '던전 베이커리',  genre: '경영 + 로그라이크',   publisher: 'Crumb Studio',       publisherType: '중소', thumbnail: '🥖', description: '낮에는 빵을 굽고, 밤에는 던전을 정복하는 경영 RPG',     tags: ['경영', '로그라이크', '귀여움'],       platforms: ['PC', 'Mobile'] },
  { id: 'overclock',      name: '오버클럭',       genre: '5v5 택티컬 슈터',     publisher: 'Vortex Interactive', publisherType: '중견', thumbnail: '🎯', description: '극한의 반응속도가 승부를 가르는 차세대 택티컬 FPS',     tags: ['FPS', '경쟁', 'e스포츠'],              platforms: ['PC'] },
  { id: 'stellar-court',  name: '스텔라 코트',    genre: '판타지 법정 어드벤처', publisher: 'Inkwell Games',      publisherType: '인디', thumbnail: '⚖️', description: '용과 마법사의 시대, 마법 법정에서 진실을 밝혀라',         tags: ['어드벤처', '추리', '스토리'],          platforms: ['PC', 'Console'] },
  { id: 'tide-tactics',   name: '타이드 택틱스',  genre: '해상 턴제 전략',      publisher: 'Anchor Software',    publisherType: '중소', thumbnail: '⚓', description: '대항해시대를 무대로 한 깊이 있는 함대 전략 시뮬레이션', tags: ['전략', '턴제', '역사'],                 platforms: ['PC'] },
];

export type Creator = {
  id: string;
  nickname: string;
  tier: Tier;
  subscribers: number;
  platform: 'YouTube' | '치지직' | 'SOOP';
  avatar: string;
  specialty: string;
  joinedDate: string;
  completedCampaigns: number;
};

export const CREATORS: Creator[] = [
  // A등급 (3명)
  { id: 'c1',  nickname: '레이싱종결', tier: 'A', subscribers: 520000, platform: 'YouTube', avatar: '🏁', specialty: '레이싱 · 액션',     joinedDate: '2025-08-12', completedCampaigns: 14 },
  { id: 'c2',  nickname: '겜잘알찬호', tier: 'A', subscribers: 380000, platform: 'YouTube', avatar: '🎮', specialty: '신작 리뷰',         joinedDate: '2025-07-03', completedCampaigns: 22 },
  { id: 'c3',  nickname: '클래스원탑', tier: 'A', subscribers: 310000, platform: 'YouTube', avatar: '👑', specialty: 'AAA 타이틀 공략',  joinedDate: '2025-09-21', completedCampaigns: 9  },
  // B등급 (5명)
  { id: 'c4',  nickname: '택틱마스터', tier: 'B', subscribers: 180000, platform: 'SOOP',    avatar: '🎯', specialty: 'FPS · 전략',        joinedDate: '2025-10-05', completedCampaigns: 11 },
  { id: 'c5',  nickname: '빵수르',     tier: 'B', subscribers: 120000, platform: '치지직',  avatar: '🥐', specialty: '경영 시뮬',         joinedDate: '2025-11-18', completedCampaigns: 7  },
  { id: 'c6',  nickname: '심야플레이', tier: 'B', subscribers: 110000, platform: '치지직',  avatar: '🌙', specialty: '라이브 플레이',     joinedDate: '2025-09-30', completedCampaigns: 18 },
  { id: 'c7',  nickname: '아케이드준', tier: 'B', subscribers: 145000, platform: 'YouTube', avatar: '🕹️', specialty: '레트로 · 아케이드', joinedDate: '2026-01-12', completedCampaigns: 5  },
  { id: 'c8',  nickname: '리뷰어Q',    tier: 'B', subscribers: 100000, platform: 'YouTube', avatar: '🔍', specialty: '심층 리뷰',         joinedDate: '2025-12-08', completedCampaigns: 8  },
  // C등급 (6명)
  { id: 'c9',  nickname: '도파민러너', tier: 'C', subscribers: 78000,  platform: 'YouTube', avatar: '⚡', specialty: '인디 게임',         joinedDate: '2026-02-14', completedCampaigns: 4  },
  { id: 'c10', nickname: '판타지킹',   tier: 'C', subscribers: 65000,  platform: 'YouTube', avatar: '🐉', specialty: 'RPG · 판타지',     joinedDate: '2025-12-22', completedCampaigns: 6  },
  { id: 'c11', nickname: '클립콜렉터', tier: 'C', subscribers: 58000,  platform: 'SOOP',    avatar: '✂️', specialty: '하이라이트 클립',   joinedDate: '2026-01-08', completedCampaigns: 9  },
  { id: 'c12', nickname: '평화의항해', tier: 'C', subscribers: 72000,  platform: 'YouTube', avatar: '⛵', specialty: '전략 · 시뮬',       joinedDate: '2026-02-01', completedCampaigns: 3  },
  { id: 'c13', nickname: '뽀끼매니아', tier: 'C', subscribers: 51000,  platform: '치지직',  avatar: '🦊', specialty: '귀여운 게임',       joinedDate: '2025-11-25', completedCampaigns: 7  },
  { id: 'c14', nickname: '코어겜',     tier: 'C', subscribers: 67000,  platform: 'YouTube', avatar: '🎲', specialty: '하드코어 게임',     joinedDate: '2026-03-10', completedCampaigns: 2  },
  // D등급 (4명)
  { id: 'c15', nickname: '픽셀러버',   tier: 'D', subscribers: 28000,  platform: 'YouTube', avatar: '👾', specialty: '레트로 · 인디',     joinedDate: '2026-03-22', completedCampaigns: 3  },
  { id: 'c16', nickname: '루키서치',   tier: 'D', subscribers: 19000,  platform: 'YouTube', avatar: '🔰', specialty: '신작 발굴',         joinedDate: '2026-04-02', completedCampaigns: 2  },
  { id: 'c17', nickname: '동네형',     tier: 'D', subscribers: 14000,  platform: 'SOOP',    avatar: '🍻', specialty: '캐주얼 라이브',     joinedDate: '2026-04-18', completedCampaigns: 1  },
  { id: 'c18', nickname: '말많은유저', tier: 'D', subscribers: 11000,  platform: '치지직',  avatar: '💬', specialty: '리액션 · 토크',     joinedDate: '2026-05-01', completedCampaigns: 1  },
];

export type Campaign = {
  id: string;
  gameId: string;
  budget: number;
  status: 'recruiting' | 'progress' | 'completed';
  targetCreators: number;
  joinedCreators: string[];
  createdAt: string;
  endDate: string;
};

export const CAMPAIGNS: Campaign[] = [
  { id: 'camp-001', gameId: 'neon-riders',    budget: 3000000, status: 'progress',   targetCreators: 19, joinedCreators: ['c1','c4','c5','c9','c10','c11','c13','c15','c17'], createdAt: '2026-05-08', endDate: '2026-06-08' },
  { id: 'camp-002', gameId: 'dungeon-bakery', budget: 2000000, status: 'progress',   targetCreators: 12, joinedCreators: ['c5','c8','c10','c12','c13','c16'],                  createdAt: '2026-05-12', endDate: '2026-06-12' },
  { id: 'camp-003', gameId: 'overclock',      budget: 8000000, status: 'recruiting', targetCreators: 25, joinedCreators: ['c2','c4','c8'],                                      createdAt: '2026-05-15', endDate: '2026-06-15' },
  { id: 'camp-004', gameId: 'stellar-court',  budget: 1500000, status: 'completed',  targetCreators: 10, joinedCreators: ['c3','c8','c10','c12','c13','c14','c15'],             createdAt: '2026-04-01', endDate: '2026-05-01' },
];

// 호환용 (기존 page.tsx 가 import 중)
export const SAMPLE_CAMPAIGN: Campaign = CAMPAIGNS[0];

export type Submission = {
  id: string;
  campaignId: string;
  creatorId: string;
  mission: MissionType;
  status: 'pending' | 'approved' | 'paid';
  url?: string;
  amount: number;
  submittedAt: string;
  views?: number;
  comments?: number;
  thumbnail?: string;
  title?: string;
};

export const SUBMISSIONS: Submission[] = [
  // 캠페인 1: 네온 라이더즈 (진행중) — 11건
  { id: 's01', campaignId: 'camp-001', creatorId: 'c1',  mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo1',  amount: 1400000, submittedAt: '2026-05-10', views: 287000, comments: 1240, thumbnail: '🏁', title: '네온 라이더즈 전 코스 1위 클리어 가이드' },
  { id: 's02', campaignId: 'camp-001', creatorId: 'c4',  mission: 'live',  status: 'paid',     url: 'https://sooplive.co.kr/demo2',       amount: 500000,  submittedAt: '2026-05-11', views: 42000,  comments: 980,  thumbnail: '🎯', title: '신작 네온 라이더즈 5시간 마라톤' },
  { id: 's03', campaignId: 'camp-001', creatorId: 'c5',  mission: 'short', status: 'paid',     url: 'https://chzzk.naver.com/demo3',      amount: 150000,  submittedAt: '2026-05-12', views: 38000,  comments: 210,  thumbnail: '🥐', title: '네온 라이더즈 입문자가 빠지는 함정 5가지' },
  { id: 's04', campaignId: 'camp-001', creatorId: 'c9',  mission: 'short', status: 'paid',     url: 'https://youtube.com/watch?v=demo4',  amount: 100000,  submittedAt: '2026-05-12', views: 24000,  comments: 156,  thumbnail: '⚡', title: '인디인데 이 정도? 네온 라이더즈 첫인상' },
  { id: 's05', campaignId: 'camp-001', creatorId: 'c10', mission: 'long',  status: 'approved', url: 'https://youtube.com/watch?v=demo5',  amount: 450000,  submittedAt: '2026-05-13', views: 19000,  comments: 88,   thumbnail: '🐉', title: '판타지 팬이 본 네온 라이더즈' },
  { id: 's06', campaignId: 'camp-001', creatorId: 'c11', mission: 'short', status: 'approved', url: 'https://youtube.com/watch?v=demo6',  amount: 100000,  submittedAt: '2026-05-13', views: 31000,  comments: 245,  thumbnail: '✂️', title: '네온 라이더즈 베스트 클립 모음' },
  { id: 's07', campaignId: 'camp-001', creatorId: 'c13', mission: 'short', status: 'approved', url: 'https://chzzk.naver.com/demo7',      amount: 100000,  submittedAt: '2026-05-13', views: 17000,  comments: 92,   thumbnail: '🦊', title: '귀여운 차로 우승하기' },
  { id: 's08', campaignId: 'camp-001', creatorId: 'c15', mission: 'short', status: 'approved', url: 'https://youtube.com/watch?v=demo8',  amount: 50000,   submittedAt: '2026-05-14', views: 8500,   comments: 34,   thumbnail: '👾', title: '레트로 감성으로 보는 네온 라이더즈' },
  { id: 's09', campaignId: 'camp-001', creatorId: 'c17', mission: 'live',  status: 'pending',  url: 'https://sooplive.co.kr/demo9',       amount: 200000,  submittedAt: '2026-05-15', views: 6200,   comments: 178,  thumbnail: '🍻', title: '동네형이 도전하는 네온 라이더즈' },
  { id: 's10', campaignId: 'camp-001', creatorId: 'c5',  mission: 'long',  status: 'pending',  url: 'https://chzzk.naver.com/demo10',     amount: 700000,  submittedAt: '2026-05-15', views: 12000,  comments: 67,   thumbnail: '🥐', title: '경영 게임 유튜버가 레이싱에 빠진 이유' },
  { id: 's11', campaignId: 'camp-001', creatorId: 'c1',  mission: 'short', status: 'pending',  url: 'https://youtube.com/watch?v=demo11', amount: 300000,  submittedAt: '2026-05-15', views: 0,      comments: 0,    thumbnail: '🏁', title: '네온 라이더즈 신규 패치 분석' },

  // 캠페인 2: 던전 베이커리 (진행중) — 6건
  { id: 's12', campaignId: 'camp-002', creatorId: 'c5',  mission: 'long',  status: 'paid',     url: 'https://chzzk.naver.com/demo12',     amount: 700000,  submittedAt: '2026-05-13', views: 92000,  comments: 540,  thumbnail: '🥐', title: '던전 베이커리 풀 가이드 — 최고 매출 빵집 만들기' },
  { id: 's13', campaignId: 'camp-002', creatorId: 'c8',  mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo13', amount: 700000,  submittedAt: '2026-05-14', views: 68000,  comments: 320,  thumbnail: '🔍', title: '심층 리뷰: 던전 베이커리는 진짜 명작인가?' },
  { id: 's14', campaignId: 'camp-002', creatorId: 'c10', mission: 'short', status: 'paid',     url: 'https://youtube.com/watch?v=demo14', amount: 100000,  submittedAt: '2026-05-14', views: 45000,  comments: 280,  thumbnail: '🐉', title: '판타지킹이 빵을 굽는다고?' },
  { id: 's15', campaignId: 'camp-002', creatorId: 'c12', mission: 'short', status: 'approved', url: 'https://youtube.com/watch?v=demo15', amount: 100000,  submittedAt: '2026-05-14', views: 22000,  comments: 110,  thumbnail: '⛵', title: '시뮬 유저가 추천하는 던전 베이커리' },
  { id: 's16', campaignId: 'camp-002', creatorId: 'c13', mission: 'live',  status: 'approved', url: 'https://chzzk.naver.com/demo16',     amount: 350000,  submittedAt: '2026-05-15', views: 18000,  comments: 420,  thumbnail: '🦊', title: '귀여운 던전 베이커리 5시간 라이브' },
  { id: 's17', campaignId: 'camp-002', creatorId: 'c16', mission: 'short', status: 'pending',  url: 'https://youtube.com/watch?v=demo17', amount: 50000,   submittedAt: '2026-05-15', views: 0,      comments: 0,    thumbnail: '🔰', title: '루키가 만난 던전 베이커리' },

  // 캠페인 3: 오버클럭 (모집중) — 3건
  { id: 's18', campaignId: 'camp-003', creatorId: 'c4',  mission: 'live',  status: 'approved', url: 'https://sooplive.co.kr/demo18',      amount: 500000,  submittedAt: '2026-05-15', views: 38000,  comments: 1100, thumbnail: '🎯', title: '오버클럭 프로 5v5 스크림' },
  { id: 's19', campaignId: 'camp-003', creatorId: 'c8',  mission: 'long',  status: 'pending',  url: 'https://youtube.com/watch?v=demo19', amount: 700000,  submittedAt: '2026-05-15', views: 0,      comments: 0,    thumbnail: '🔍', title: '오버클럭 첫인상 — 발로란트의 대항마?' },
  { id: 's20', campaignId: 'camp-003', creatorId: 'c2',  mission: 'short', status: 'pending',  url: 'https://youtube.com/watch?v=demo20', amount: 300000,  submittedAt: '2026-05-15', views: 0,      comments: 0,    thumbnail: '🎮', title: '오버클럭 핵심 메커닉 30초 정리' },

  // 캠페인 4: 스텔라 코트 (완료) — 5건
  { id: 's21', campaignId: 'camp-004', creatorId: 'c3',  mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo21', amount: 1400000, submittedAt: '2026-04-15', views: 412000, comments: 2100, thumbnail: '👑', title: '스텔라 코트 — 인디 어드벤처의 새 기준' },
  { id: 's22', campaignId: 'camp-004', creatorId: 'c8',  mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo22', amount: 700000,  submittedAt: '2026-04-20', views: 89000,  comments: 450,  thumbnail: '🔍', title: '스텔라 코트 리뷰: 스토리는 명작' },
  { id: 's23', campaignId: 'camp-004', creatorId: 'c10', mission: 'short', status: 'paid',     url: 'https://youtube.com/watch?v=demo23', amount: 100000,  submittedAt: '2026-04-22', views: 56000,  comments: 320,  thumbnail: '🐉', title: '스텔라 코트 명장면 TOP 5' },
  { id: 's24', campaignId: 'camp-004', creatorId: 'c12', mission: 'short', status: 'paid',     url: 'https://youtube.com/watch?v=demo24', amount: 100000,  submittedAt: '2026-04-25', views: 31000,  comments: 180,  thumbnail: '⛵', title: '추리 게임 팬이 본 스텔라 코트' },
  { id: 's25', campaignId: 'camp-004', creatorId: 'c14', mission: 'short', status: 'paid',     url: 'https://youtube.com/watch?v=demo25', amount: 100000,  submittedAt: '2026-04-28', views: 24000,  comments: 95,   thumbnail: '🎲', title: '하드코어 추리러가 본 스텔라 코트' },
];

export function formatKRW(amount: number): string {
  if (amount >= 100000000) return `₩${(amount / 100000000).toFixed(1)}억`;
  if (amount >= 10000)     return `₩${(amount / 10000).toFixed(0)}만`;
  return `₩${amount.toLocaleString()}`;
}

export function formatSubs(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(0)}만`;
  return count.toLocaleString();
}

export function formatViews(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
  return count.toLocaleString();
}

export function formatNumber(count: number): string {
  return count.toLocaleString();
}
