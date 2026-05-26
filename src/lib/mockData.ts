// Project Creator 데모 가짜 데이터 — v3
// 게임 6개, 크리에이터 20명(실명 기반), 캠페인 6개, 제출 시드 6건+

export type Tier = 'A' | 'B' | 'C' | 'D';
export type CreatorGrade = Tier;
export type CreatorPlatform = 'youtube' | 'soop' | 'chzzk' | 'multi';
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
  { id: 'lost-sword',  name: '로스트 소드',  genre: '서브컬처 · 2D 액션 RPG', publisher: '위메이드커넥트',  publisherType: '중견', thumbnail: '⚔️', description: '서브컬처 감성의 2D 액션 RPG',       tags: ['서브컬처', 'RPG'],       platforms: ['Mobile'] },
  { id: 'god-demon',   name: '갓앤데몬',     genre: '방치형 수집 RPG',       publisher: '컴투스',          publisherType: '중견', thumbnail: '⚡', description: '방치형 수집형 RPG',                 tags: ['방치형', 'RPG'],         platforms: ['Mobile'] },
  { id: 'luck-game',   name: '운빨존많겜',   genre: '2인 랜덤 타워디펜스',   publisher: '111퍼센트',       publisherType: '중소', thumbnail: '🎲', description: '2인 협동 타워 디펜스',              tags: ['캐주얼', '전략'],         platforms: ['Mobile', 'PC'] },
  { id: 'ddalgak',     name: '딸깍삼국',     genre: '캐주얼 전략',           publisher: '반지하게임즈',    publisherType: '중소', thumbnail: '⚔️', description: '캐주얼 삼국지 전략',                tags: ['전략', '캐주얼'],         platforms: ['Mobile'] },
  { id: 'road-nine',   name: '로드나인',     genre: 'MMORPG',               publisher: '스마일게이트RPG', publisherType: '중견', thumbnail: '⚡', description: '차세대 모바일 MMORPG',              tags: ['MMORPG'],                platforms: ['Mobile', 'PC'] },
  { id: 'abyssrium',   name: '어비스리움',   genre: '힐링 방치 아쿠아리움',   publisher: '위메이드커넥트',  publisherType: '중견', thumbnail: '🐟', description: '힐링 방치형 아쿠아리움 게임',       tags: ['방치형', '캐주얼'],       platforms: ['Mobile'] },
];

export type CreatorContentTypes = {
  shortform: boolean;
  longform: boolean;
  live: boolean;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  platform: CreatorPlatform;
  profileEmoji: string;
  profileColor: string;
  grade: CreatorGrade;
  subscribers: number;
  avgViews: number;
  genres: string[];
  platforms: string[];
  contentTypes: CreatorContentTypes;
  rating: number;
  completedCampaigns: number;
  pricePerShortform: number;
  pricePerLongform: number;
  pricePerLive: number;
  description: string;
  isVerified: boolean;
};

export const CREATORS: Creator[] = [
  {
    id: 'cr-001', name: '겜브링', handle: '@GGAMBRING', grade: 'A',
    subscribers: 2960000, avgViews: 160000, genres: ['종합게임', '패밀리', '캐주얼'],
    platforms: ['youtube'], profileEmoji: '🎮', profileColor: '#1a3a5e',
    platform: 'youtube',
    contentTypes: { shortform: true, longform: true, live: false },
    rating: 4.8, completedCampaigns: 23,
    pricePerShortform: 3000000, pricePerLongform: 15000000, pricePerLive: 0,
    description: '296만 구독자. 국내 최대 게임 유튜버. 패밀리·캐주얼 게임 특화.',
    isVerified: true,
  },
  {
    id: 'cr-002', name: '풍월량', handle: '@pungwollyang', grade: 'A',
    subscribers: 1850000, avgViews: 350000, genres: ['MMORPG', 'RPG', '리니지'],
    platforms: ['youtube', 'soop'], profileEmoji: '⚔️', profileColor: '#3a1a1a',
    platform: 'multi',
    contentTypes: { shortform: false, longform: true, live: true },
    rating: 4.9, completedCampaigns: 31,
    pricePerShortform: 0, pricePerLongform: 20000000, pricePerLive: 8000000,
    description: '185만 구독자. MMORPG 업계 1티어. 리니지라이크 광고 전환율 최상위.',
    isVerified: true,
  },
  {
    id: 'cr-003', name: '김성회의 G식백과', handle: '@gsikbaekgwa', grade: 'A',
    subscribers: 950000, avgViews: 420000, genres: ['게임분석', '업계정보', '종합'],
    platforms: ['youtube'], profileEmoji: '📚', profileColor: '#1a2a3a',
    platform: 'youtube',
    contentTypes: { shortform: false, longform: true, live: false },
    rating: 4.9, completedCampaigns: 12,
    pricePerShortform: 0, pricePerLongform: 18000000, pricePerLive: 0,
    description: '95만 구독자. 게임 개발자 출신. 신작 리뷰·분석 신뢰도 압도적.',
    isVerified: true,
  },
  {
    id: 'cr-004', name: '한동숙', handle: '@handongsuktv', grade: 'A',
    subscribers: 780000, avgViews: 280000, genres: ['배틀로얄', 'FPS', '배그'],
    platforms: ['youtube', 'soop'], profileEmoji: '🔫', profileColor: '#1a2a1a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.7, completedCampaigns: 19,
    pricePerShortform: 2500000, pricePerLongform: 12000000, pricePerLive: 6000000,
    description: '78만 구독자. 배틀로얄·FPS 전문. 20~30대 남성 코어 게이머 타깃.',
    isVerified: true,
  },
  {
    id: 'cr-005', name: '발젭', handle: '@baljep', grade: 'B',
    subscribers: 420000, avgViews: 95000, genres: ['전략', 'RTS', '종합'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '🗺️', profileColor: '#2a1a3a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.7, completedCampaigns: 15,
    pricePerShortform: 700000, pricePerLongform: 4000000, pricePerLive: 2500000,
    description: '42만 구독자. 전략·시뮬레이션 전문. 마이크로 시딩 CPV 효율 최상.',
    isVerified: true,
  },
  {
    id: 'cr-006', name: '몽키매직', handle: '@monkeymagic_game', grade: 'B',
    subscribers: 310000, avgViews: 72000, genres: ['인디게임', '캐주얼', '리뷰'],
    platforms: ['youtube'], profileEmoji: '🐒', profileColor: '#3a2a0a',
    platform: 'youtube',
    contentTypes: { shortform: true, longform: true, live: false },
    rating: 4.6, completedCampaigns: 28,
    pricePerShortform: 500000, pricePerLongform: 3000000, pricePerLive: 0,
    description: '31만 구독자. 인디·캐주얼 게임 특화. 중소 게임사 협업 경험 풍부.',
    isVerified: true,
  },
  {
    id: 'cr-007', name: '침착맨게임', handle: '@chimgame', grade: 'B',
    subscribers: 270000, avgViews: 180000, genres: ['서브컬처', '소울라이크', '종합'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '😎', profileColor: '#2a0a2a',
    platform: 'multi',
    contentTypes: { shortform: false, longform: true, live: true },
    rating: 4.5, completedCampaigns: 8,
    pricePerShortform: 0, pricePerLongform: 5000000, pricePerLive: 3000000,
    description: '27만 구독자. 서브컬처·소울라이크 코어 팬덤. 라이브 동시시청 최고.',
    isVerified: false,
  },
  {
    id: 'cr-008', name: '클템', handle: '@cltem_lol', grade: 'B',
    subscribers: 240000, avgViews: 130000, genres: ['리그오브레전드', 'MOBA', 'e스포츠'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '🏆', profileColor: '#0a1a3a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.8, completedCampaigns: 22,
    pricePerShortform: 600000, pricePerLongform: 4500000, pricePerLive: 2500000,
    description: '24만 구독자. 전 LCK 해설위원. LoL·e스포츠 업계 신뢰도 1위.',
    isVerified: true,
  },
  {
    id: 'cr-009', name: '강퀴', handle: '@gangqui', grade: 'B',
    subscribers: 195000, avgViews: 88000, genres: ['리그오브레전드', '미드코어', 'FPS'],
    platforms: ['youtube', 'soop'], profileEmoji: '⚡', profileColor: '#1a3a2a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.6, completedCampaigns: 17,
    pricePerShortform: 500000, pricePerLongform: 3500000, pricePerLive: 2000000,
    description: '19만 구독자. LoL·미드코어 전문. 숏폼 전환율 플랫폼 내 최상위.',
    isVerified: true,
  },
  {
    id: 'cr-010', name: '쫀쫀', handle: '@jjonjjon_game', grade: 'B',
    subscribers: 130000, avgViews: 52000, genres: ['서브컬처', '수집형RPG', '가챠'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '✨', profileColor: '#2a0a3a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.7, completedCampaigns: 34,
    pricePerShortform: 400000, pricePerLongform: 2500000, pricePerLive: 1500000,
    description: '13만 구독자. 서브컬처·수집형RPG 특화. 가챠게임 전환율 독보적.',
    isVerified: false,
  },
  {
    id: 'cr-011', name: '게임어때', handle: '@gameottae', grade: 'C',
    subscribers: 87000, avgViews: 28000, genres: ['인디게임', '리뷰', '추천'],
    platforms: ['youtube'], profileEmoji: '🎯', profileColor: '#1a3a1a',
    platform: 'youtube',
    contentTypes: { shortform: true, longform: true, live: false },
    rating: 4.5, completedCampaigns: 41,
    pricePerShortform: 200000, pricePerLongform: 1000000, pricePerLive: 0,
    description: '8.7만 구독자. 인디게임 전문 리뷰어. 소규모 게임사 협업 최다.',
    isVerified: false,
  },
  {
    id: 'cr-012', name: '랄로', handle: '@ralo_game', grade: 'C',
    subscribers: 72000, avgViews: 31000, genres: ['방치형', '모바일RPG', '육성'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '🌱', profileColor: '#0a2a1a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.4, completedCampaigns: 29,
    pricePerShortform: 150000, pricePerLongform: 800000, pricePerLive: 500000,
    description: '7.2만 구독자. 방치형·모바일RPG 특화. 라이브 스트리밍 동시청취 높음.',
    isVerified: false,
  },
  {
    id: 'cr-013', name: 'KRLOL', handle: '@krlol_highlights', grade: 'C',
    subscribers: 65000, avgViews: 45000, genres: ['e스포츠', 'LoL', '하이라이트'],
    platforms: ['youtube'], profileEmoji: '🏅', profileColor: '#0a1a2a',
    platform: 'youtube',
    contentTypes: { shortform: true, longform: false, live: false },
    rating: 4.3, completedCampaigns: 18,
    pricePerShortform: 250000, pricePerLongform: 0, pricePerLive: 0,
    description: '6.5만 구독자. LoL e스포츠 하이라이트 전문. 숏폼 조회수 평균 45만.',
    isVerified: false,
  },
  {
    id: 'cr-014', name: '소닉붐TV', handle: '@sonicboomtv', grade: 'C',
    subscribers: 54000, avgViews: 22000, genres: ['FPS', '슈팅', '배틀로얄'],
    platforms: ['chzzk', 'youtube'], profileEmoji: '💥', profileColor: '#2a1a0a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.4, completedCampaigns: 13,
    pricePerShortform: 150000, pricePerLongform: 700000, pricePerLive: 450000,
    description: '5.4만 구독자. FPS·슈팅 특화. 치지직 라이브 동시시청자 5천 이상.',
    isVerified: false,
  },
  {
    id: 'cr-015', name: '판교의아침', handle: '@pangyo_morning', grade: 'C',
    subscribers: 43000, avgViews: 19000, genres: ['게임업계', '개발자', '취업'],
    platforms: ['youtube'], profileEmoji: '🏢', profileColor: '#1a1a2a',
    platform: 'youtube',
    contentTypes: { shortform: false, longform: true, live: false },
    rating: 4.6, completedCampaigns: 7,
    pricePerShortform: 0, pricePerLongform: 800000, pricePerLive: 0,
    description: '4.3만 구독자. 게임업계·개발자 인사이트 전문. B2B 타깃 채널.',
    isVerified: false,
  },
  {
    id: 'cr-016', name: '주르륵', handle: '@jureureuk', grade: 'C',
    subscribers: 38000, avgViews: 16000, genres: ['수집형RPG', '서브컬처', '공략'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '💎', profileColor: '#2a0a2a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.5, completedCampaigns: 21,
    pricePerShortform: 100000, pricePerLongform: 600000, pricePerLive: 400000,
    description: '3.8만 구독자. 서브컬처·공략 특화. 팬덤 충성도 플랫폼 내 최고.',
    isVerified: false,
  },
  {
    id: 'cr-017', name: '겜린이탈출', handle: '@gaemrinitaleul', grade: 'D',
    subscribers: 28000, avgViews: 9000, genres: ['입문자', '캐주얼', '종합'],
    platforms: ['youtube'], profileEmoji: '🌟', profileColor: '#2a2a0a',
    platform: 'youtube',
    contentTypes: { shortform: true, longform: true, live: false },
    rating: 4.2, completedCampaigns: 9,
    pricePerShortform: 50000, pricePerLongform: 250000, pricePerLive: 0,
    description: '2.8만 구독자. 게임 입문자·라이트 게이머 타깃. 20~30대 여성 비중 높음.',
    isVerified: false,
  },
  {
    id: 'cr-018', name: '야간작전', handle: '@nightops_game', grade: 'D',
    subscribers: 22000, avgViews: 7500, genres: ['전략', 'SLG', '삼국지'],
    platforms: ['youtube', 'soop'], profileEmoji: '🌙', profileColor: '#0a0a2a',
    platform: 'multi',
    contentTypes: { shortform: false, longform: true, live: true },
    rating: 4.3, completedCampaigns: 6,
    pricePerShortform: 0, pricePerLongform: 200000, pricePerLive: 150000,
    description: '2.2만 구독자. SLG·전략 특화. 코어 전략 게이머 집중 타깃.',
    isVerified: false,
  },
  {
    id: 'cr-019', name: '뚝딱공방', handle: '@ddukddak_craft', grade: 'D',
    subscribers: 17000, avgViews: 6200, genres: ['샌드박스', '마인크래프트', '빌딩'],
    platforms: ['youtube', 'chzzk'], profileEmoji: '🔨', profileColor: '#2a1a0a',
    platform: 'multi',
    contentTypes: { shortform: true, longform: true, live: true },
    rating: 4.4, completedCampaigns: 4,
    pricePerShortform: 50000, pricePerLongform: 180000, pricePerLive: 120000,
    description: '1.7만 구독자. 샌드박스·크래프트 특화. 10대 타깃 캐주얼 게임 적합.',
    isVerified: false,
  },
  {
    id: 'cr-020', name: '미니게임왕', handle: '@minigame_king', grade: 'D',
    subscribers: 12000, avgViews: 4800, genres: ['캐주얼', '파티게임', '쇼츠'],
    platforms: ['youtube'], profileEmoji: '👑', profileColor: '#2a2a1a',
    platform: 'youtube',
    contentTypes: { shortform: true, longform: false, live: false },
    rating: 4.1, completedCampaigns: 3,
    pricePerShortform: 30000, pricePerLongform: 0, pricePerLive: 0,
    description: '1.2만 구독자. 쇼츠 전문 캐주얼 게임 채널. CPV 최저 효율 시딩용.',
    isVerified: false,
  },
];

export const CREATOR_GENRE_FILTERS = [
  'RPG', 'FPS', '전략', '서브컬처', '방치형', '인디', 'e스포츠', '캐주얼',
] as const;

export type CreatorGenreFilter = (typeof CREATOR_GENRE_FILTERS)[number];

export type CreatorPlatformFilter = 'youtube' | 'soop' | 'chzzk';

export type CreatorContentFilter = 'shortform' | 'longform' | 'live';

const GENRE_FILTER_KEYWORDS: Record<CreatorGenreFilter, string[]> = {
  RPG: ['RPG', 'MMORPG', '리니지', '모바일RPG', '수집형RPG', 'MOBA', 'LoL', '가챠', '육성'],
  FPS: ['FPS', '배틀로얄', '배그', '슈팅', '미드코어'],
  전략: ['전략', 'RTS', 'SLG', '삼국지', '시뮬'],
  서브컬처: ['서브컬처', '소울라이크', '공략'],
  방치형: ['방치형'],
  인디: ['인디', '리뷰', '추천', '게임분석'],
  e스포츠: ['e스포츠', '리그오브레전드', '하이라이트', 'LCK'],
  캐주얼: ['캐주얼', '패밀리', '입문자', '파티게임', '쇼츠', '종합게임', '샌드박스', '마인크래프트', '빌딩'],
};

export function creatorMatchesGenreFilter(c: Creator, filter: CreatorGenreFilter): boolean {
  return c.genres.some(g => GENRE_FILTER_KEYWORDS[filter].some(kw => g.includes(kw)));
}

export function creatorHasPlatform(c: Creator, platform: CreatorPlatformFilter): boolean {
  return c.platforms.includes(platform);
}

export function creatorHasContentType(c: Creator, type: CreatorContentFilter): boolean {
  return c.contentTypes[type];
}

export function getCreatorMissionReward(c: Creator, mission: MissionType): number {
  switch (mission) {
    case 'short': return c.pricePerShortform;
    case 'long': return c.pricePerLongform;
    case 'live': return c.pricePerLive;
  }
}

export const GRADE_COLORS: Record<Tier, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: 'rgba(212,160,23,0.2)', text: '#f5d76e', border: '#b8860b', label: '골드' },
  B: { bg: 'rgba(192,192,192,0.15)', text: '#e8e8e8', border: '#a8a8a8', label: '실버' },
  C: { bg: 'rgba(205,127,50,0.2)', text: '#e8a87c', border: '#cd7f32', label: '브론즈' },
  D: { bg: 'rgba(115,115,115,0.2)', text: '#a3a3a3', border: '#525252', label: '일반' },
};

export type CampaignMissions = {
  shortform: boolean;
  longform: boolean;
  live: boolean;
};

export type TopGrade = {
  grade: Tier;
  price: number;
};

export type CampaignThumbnail = {
  type: 'url' | 'gradient';
  imageUrl?: string;
  from?: string;
  to?: string;
  emoji?: string;
};

export function getCampaignThumbnailEmoji(thumbnail: CampaignThumbnail): string {
  if (thumbnail.type === 'gradient') return thumbnail.emoji ?? '⚔️';
  return thumbnail.emoji ?? '🎮';
}

export type GamePlatformType = 'mobile' | 'pc' | 'console';

export type CampaignStatus = 'live' | 'recruiting' | 'completed';

export type Campaign = {
  id: string;
  name: string;
  genre: string;
  developer: string;
  platform: GamePlatformType[];
  totalBudget: number;
  spentBudget: number;
  status: CampaignStatus;
  targetCreators: number;
  joinedCreators: string[];
  createdAt: string;
  endDate: string;
  isNew: boolean;
  thumbnail: CampaignThumbnail;
  missions: CampaignMissions;
  topGrade: TopGrade;
};

export const GAME_PLATFORM_ICONS: Record<GamePlatformType, string> = {
  mobile: '📱',
  pc: '🖥️',
  console: '🎮',
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001', name: '로스트 소드', genre: '서브컬처 · 2D 액션 RPG', developer: '위메이드커넥트',
    platform: ['mobile'], totalBudget: 4000000, spentBudget: 2900000, status: 'live',
    targetCreators: 20, joinedCreators: ['cr-001', 'cr-006', 'cr-010', 'cr-011'],
    createdAt: '2026-04-10', endDate: '2026-06-10', isNew: false,
    thumbnail: {
      type: 'url',
      imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&q=80',
    },
    missions: { shortform: true, longform: true, live: false },
    topGrade: { grade: 'A', price: 1400000 },
  },
  {
    id: 'camp-002', name: '갓앤데몬', genre: '방치형 수집 RPG', developer: '컴투스',
    platform: ['mobile'], totalBudget: 8000000, spentBudget: 3300000, status: 'live',
    targetCreators: 25, joinedCreators: ['cr-002', 'cr-012', 'cr-008'],
    createdAt: '2026-04-15', endDate: '2026-06-15', isNew: false,
    thumbnail: {
      type: 'url',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    },
    missions: { shortform: true, longform: true, live: true },
    topGrade: { grade: 'A', price: 2000000 },
  },
  {
    id: 'camp-003', name: '운빨존많겜', genre: '2인 랜덤 타워디펜스', developer: '111퍼센트',
    platform: ['mobile', 'pc'], totalBudget: 3000000, spentBudget: 2500000, status: 'live',
    targetCreators: 18, joinedCreators: ['cr-004', 'cr-005', 'cr-014'],
    createdAt: '2026-04-20', endDate: '2026-06-20', isNew: false,
    thumbnail: {
      type: 'url',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
    },
    missions: { shortform: true, longform: false, live: true },
    topGrade: { grade: 'A', price: 1200000 },
  },
  {
    id: 'camp-004', name: '딸깍삼국', genre: '캐주얼 전략', developer: '반지하게임즈',
    platform: ['mobile'], totalBudget: 1500000, spentBudget: 150000, status: 'recruiting',
    targetCreators: 12, joinedCreators: ['cr-011', 'cr-017'],
    createdAt: '2026-05-10', endDate: '2026-06-10', isNew: true,
    thumbnail: {
      type: 'url',
      imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1eef6?w=600&q=80',
    },
    missions: { shortform: true, longform: false, live: false },
    topGrade: { grade: 'A', price: 500000 },
  },
  {
    id: 'camp-005', name: '로드나인', genre: 'MMORPG', developer: '스마일게이트RPG',
    platform: ['mobile', 'pc'], totalBudget: 15000000, spentBudget: 15000000, status: 'completed',
    targetCreators: 30, joinedCreators: ['cr-002', 'cr-003', 'cr-008', 'cr-009'],
    createdAt: '2026-03-01', endDate: '2026-05-01', isNew: false,
    thumbnail: {
      type: 'url',
      imageUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80',
    },
    missions: { shortform: true, longform: true, live: true },
    topGrade: { grade: 'A', price: 4000000 },
  },
  {
    id: 'camp-006', name: '어비스리움', genre: '힐링 방치 아쿠아리움', developer: '위메이드커넥트',
    platform: ['mobile'], totalBudget: 2000000, spentBudget: 200000, status: 'recruiting',
    targetCreators: 15, joinedCreators: ['cr-006', 'cr-012'],
    createdAt: '2026-05-12', endDate: '2026-06-12', isNew: true,
    thumbnail: {
      type: 'url',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    },
    missions: { shortform: true, longform: true, live: false },
    topGrade: { grade: 'A', price: 800000 },
  },
];

export type CampaignFeatureFilter =
  | 'high-unit'
  | 'high-budget'
  | 'new'
  | 'shortform'
  | 'live';

export type CampaignStatusFilter = 'all' | 'live' | 'recruiting' | 'completed';

export function getSpentPercent(c: Campaign): number {
  if (c.totalBudget <= 0) return 0;
  return Math.min(100, Math.round((c.spentBudget / c.totalBudget) * 100));
}

export function getBudgetBarColor(percent: number): string {
  if (percent <= 50) return '#22c55e';
  if (percent <= 80) return '#f97316';
  return '#ef4444';
}

export function isHighUnitPrice(c: Campaign): boolean {
  return c.topGrade.grade === 'A' && c.topGrade.price >= 1000000;
}

export function isHighBudget(c: Campaign): boolean {
  return c.totalBudget >= 4000000;
}

export function isLivePreferred(c: Campaign): boolean {
  if (!c.missions.live) return false;
  const prices: number[] = [];
  if (c.missions.shortform) prices.push(MISSION_RATES.short.A);
  if (c.missions.longform) prices.push(MISSION_RATES.long.A);
  if (c.missions.live) prices.push(MISSION_RATES.live.A);
  if (prices.length === 0) return false;
  return MISSION_RATES.live.A === Math.max(...prices);
}

export function campaignHasFeature(c: Campaign, feature: CampaignFeatureFilter): boolean {
  switch (feature) {
    case 'high-unit': return isHighUnitPrice(c);
    case 'high-budget': return isHighBudget(c);
    case 'new': return c.isNew;
    case 'shortform': return c.missions.shortform;
    case 'live': return c.missions.live;
  }
}

export const CAMPAIGN_FEATURE_LABELS: Record<CampaignFeatureFilter, { emoji: string; label: string }> = {
  'high-unit': { emoji: '🔥', label: '고단가' },
  'high-budget': { emoji: '💰', label: '고예산' },
  new: { emoji: '✨', label: '신규' },
  shortform: { emoji: '', label: '숏폼 가능' },
  live: { emoji: '', label: '라이브 우대' },
};

export function getCampaignFeatureBadges(c: Campaign): CampaignFeatureFilter[] {
  const badges: CampaignFeatureFilter[] = [];
  if (isHighUnitPrice(c)) badges.push('high-unit');
  if (isHighBudget(c)) badges.push('high-budget');
  if (c.isNew) badges.push('new');
  if (isLivePreferred(c)) badges.push('live');
  if (c.missions.shortform) badges.push('shortform');
  return badges;
}

export function getCampaignStatusLabel(status: Campaign['status']): string {
  switch (status) {
    case 'live': return 'LIVE';
    case 'recruiting': return '모집 중';
    case 'completed': return '완료';
  }
}

export function getCampaignStatusColor(status: Campaign['status']): string {
  switch (status) {
    case 'live': return '#ef4444';
    case 'recruiting': return '#3b82f6';
    case 'completed': return '#737373';
  }
}

// 호환용 (기존 page.tsx 가 import 중)
export const SAMPLE_CAMPAIGN: Campaign = CAMPAIGNS[0];

export type SubmissionStatus = 'producing' | 'pending' | 'approved' | 'paid';

export type Submission = {
  id: string;
  campaignId: string;
  creatorId: string;
  mission: MissionType;
  status: SubmissionStatus;
  url?: string;
  amount: number;
  submittedAt: string;
  views?: number;
  comments?: number;
  thumbnail?: string;
  title?: string;
};

export const SUBMISSIONS: Submission[] = [
  { id: 's01', campaignId: 'camp-001', creatorId: 'cr-001', mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo1',  amount: 15000000, submittedAt: '2026-05-10', views: 287000, comments: 1240, thumbnail: '⚔️', title: '로스트 소드 신규 클래스 가이드' },
  { id: 's02', campaignId: 'camp-001', creatorId: 'cr-006', mission: 'short', status: 'paid',     url: 'https://youtube.com/watch?v=demo2',  amount: 500000,   submittedAt: '2026-05-11', views: 38000,  comments: 210,  thumbnail: '⚔️', title: '로스트 소드 첫인상 쇼츠' },
  { id: 's03', campaignId: 'camp-002', creatorId: 'cr-002', mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo3',  amount: 20000000, submittedAt: '2026-05-08', views: 520000, comments: 2100, thumbnail: '⚡', title: '갓앤데몬 롱폼 리뷰' },
  { id: 's04', campaignId: 'camp-002', creatorId: 'cr-012', mission: 'live',  status: 'pending',  url: 'https://chzzk.naver.com/demo4',      amount: 500000,   submittedAt: '2026-05-14', views: 18000,  comments: 420,  thumbnail: '⚡', title: '갓앤데몬 5시간 육성 라이브' },
  { id: 's05', campaignId: 'camp-003', creatorId: 'cr-004', mission: 'live',  status: 'paid',     url: 'https://sooplive.co.kr/demo5',       amount: 6000000,  submittedAt: '2026-05-09', views: 42000,  comments: 980,  thumbnail: '🎲', title: '운빨존많겜 듀오 랭크' },
  { id: 's06', campaignId: 'camp-005', creatorId: 'cr-003', mission: 'long',  status: 'paid',     url: 'https://youtube.com/watch?v=demo6',  amount: 18000000, submittedAt: '2026-04-15', views: 412000, comments: 2100, thumbnail: '⚡', title: '로드나인 종합 리뷰' },
];

export function formatKRW(amount: number): string {
  if (amount >= 100000000) return `₩${(amount / 100000000).toFixed(1)}억`;
  if (amount >= 10000)     return `₩${(amount / 10000).toFixed(0)}만`;
  return `₩${amount.toLocaleString()}`;
}

/** 구독자 수 — 296만 / 8.7만 / 1.2만 */
export function formatSubscribers(n: number): string {
  if (n >= 10000) {
    const man = n / 10000;
    if (man >= 100 || man === Math.floor(man)) {
      return `${Math.round(man)}만`;
    }
    const oneDecimal = Math.round(man * 10) / 10;
    return `${oneDecimal}만`;
  }
  return n.toLocaleString();
}

/** @deprecated formatSubscribers 사용 권장 */
export function formatSubs(count: number): string {
  return formatSubscribers(count);
}

export function formatViews(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
  return count.toLocaleString();
}

export function formatNumber(count: number): string {
  return count.toLocaleString();
}
