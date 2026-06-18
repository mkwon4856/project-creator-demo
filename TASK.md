# Project Creator — rebuild Task 19
## 크리에이터 프로필 상세 페이지 (/creators/[id])

목표: 쇼케이스/탐색에서 크리에이터 카드를 클릭하면 그 크리에이터의 상세 정보를 보는 공개 페이지.
로그인이랑 별개 — 보이기 전용 시드 크리에이터도 열람 가능해야 함.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

**제약: 작업 전 아래 먼저 읽기**
1. src/app/studio/page.tsx (쇼케이스 크리에이터 카드가 어떻게 렌더되는지, creators/creator_channels 조회 방식)
2. src/app/creator/page.tsx (탐색 페이지 구조)
3. src/components/icons/PlatformIcon.tsx (플랫폼 로고)
4. db.types.ts 의 creators / creator_channels 타입
5. /mnt/skills/public/frontend-design/SKILL.md

---

## Phase 1: 크리에이터 프로필 상세 페이지

### 라우트
src/app/creators/[id]/page.tsx 생성 (공개 라우트, 로그인 무관)

### 데이터 조회
- params.id = creator_id
- creators 단건 조회 (id, name, avatar_url, bio) — .maybeSingle()
- creator_channels 조회 (해당 creator_id의 모든 채널: platform, channel_name, subscribers, grade, content_type, thumbnail_url)
- 없는 id면 notFound() 또는 "크리에이터를 찾을 수 없습니다" 안내

### 레이아웃
1. **상단 헤더 영역**
   - 뒤로가기 (또는 TopNav 유지)
   - 큰 아바타 (avatar_url, 없으면 이름 첫 글자 원형, 이름 해시 색)
   - 이름 (큰 타이틀, Arial Black)
   - 대표 등급 뱃지 (최다 구독 채널의 grade, S~E 골드/보라)
   - 총 구독자 합산 또는 대표 채널 구독자
   - bio (있으면)

2. **채널 목록 섹션** "보유 채널"
   - 각 채널을 카드/행으로:
     - PlatformIcon (플랫폼 로고)
     - 채널명 + 플랫폼
     - 구독자 수
     - 등급 뱃지
     - 콘텐츠 타입 (라이브/롱폼/숏폼)
   - 멀티 채널이면 여러 개 나열 (예: 유튜브 롱폼 S + 치지직 라이브 A)

3. **활동 정보 섹션** (있는 데이터로만)
   - 콘텐츠 타입 요약 (이 크리에이터가 가능한 타입들: 채널 기반 집계)
   - 등급 분포 (채널별 등급)
   - 참여 캠페인 수 (이 creator_id의 applications 카운트 — 있으면)

4. **빈 데이터 처리**: bio 없으면 섹션 생략, 채널 없으면 "등록된 채널 없음"

### 디자인 톤
- 게임 서비스 느낌 유지, 카드 hover 등 일관성
- 모바일 반응형

---

## Phase 2: 카드 클릭 → 프로필로 연결

### 2-1. 게임사 쇼케이스 (src/app/studio/page.tsx)
- 크리에이터 쇼케이스 카드를 클릭하면 /creators/[id]로 이동 (Link 또는 router.push)
- 카드에 cursor-pointer + hover 효과

### 2-2. 크리에이터 탐색 (src/app/creator/page.tsx)
- 만약 탐색 화면에 크리에이터가 보이는 부분이 있으면 동일하게 연결
- (탐색은 캠페인 위주라 크리에이터 노출이 없으면 skip)

주의: 클릭 영역이 "지원하기" 같은 기존 버튼과 안 겹치게. 카드 본문 클릭 → 프로필, 버튼 클릭 → 기존 동작 (stopPropagation).

---

## Phase 3: 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: creator profile detail page" && git push origin rebuild

최종 보고:
- /creators/[id] 페이지 구성
- 클릭 연결 위치 (쇼케이스 등)
- 빈 데이터 처리 방식
- 보이기 전용 크리에이터도 열람되는지 (RLS: creators/creator_channels는 public read라 OK)
