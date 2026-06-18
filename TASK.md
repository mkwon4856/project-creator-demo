# Project Creator — rebuild Task 24
## 게임사 전용 크리에이터 둘러보기 페이지 (/studio/creators)

목표: 게임사가 플랫폼의 전체 크리에이터를 둘러보고, 등급/콘텐츠 타입으로 필터링하고,
클릭하면 프로필 상세(/creators/[id])로 가는 페이지. 게임사 로그인 전용.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black
시드 크리에이터 28명 + creator_channels 데이터 활용.

**작업 전 반드시:**
1. src/app/studio/page.tsx — 쇼케이스에서 크리에이터 카드/조회를 어떻게 하는지 (fetchShowcaseCreators 등)
2. src/app/creators/[id]/page.tsx + src/lib/api/creators.server.ts — 크리에이터/채널 조회 방식
3. src/components/icons/PlatformIcon.tsx
4. src/components/layout/TopNav.tsx — 게임사 네비에 메뉴 추가해야 하므로
5. /mnt/skills/public/frontend-design/SKILL.md (없으면 skip, 기존 패턴 따름)

---

## Phase 1: 크리에이터 목록 조회 함수

src/lib/api/creators.server.ts (또는 적절한 위치)에 함수 추가:
- fetchAllCreators(): 모든 creators + 각자의 creator_channels 조인
- 각 크리에이터마다: id, name, avatar_url, 채널 목록(platform, subscribers, grade, content_type)
- 대표 등급(최다 구독 채널의 grade), 대표 채널, 총 구독자 등 카드 표시용 가공
- 정렬: 대표 구독자수 내림차순 (큰 크리에이터 먼저)

RLS: creators/creator_channels는 게임사(authenticated)가 읽을 수 있으니 로그인 상태에서 동작.

---

## Phase 2: 크리에이터 둘러보기 페이지 — src/app/studio/creators/page.tsx

게임사 로그인 보호 라우트 (studio 레이아웃 아래 또는 동일 보호 패턴).

### 레이아웃
1. **헤더**: "크리에이터 찾기" + 서브카피 "Project Creator와 함께하는 크리에이터를 둘러보세요" + 총 N명
2. **필터 바** (2종, 각각 pill 버튼):
   - 등급: 전체 / S / A / B / C / D / E
   - 콘텐츠 타입: 전체 / 라이브 / 롱폼 / 숏폼
   - 두 필터 AND로 적용 (예: "라이브" + "A등급" = 라이브 채널 중 A등급인 채널을 가진 크리에이터)
   - 필터 매칭은 **채널 단위**: 크리에이터의 채널 중 하나라도 조건 충족하면 노출
     (예: 침착맨이 유튜브 롱폼S + 치지직 라이브A 보유 → "라이브" 필터에 잡힘)
3. **크리에이터 카드 그리드**: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
   - 각 카드:
     - 아바타 (avatar_url, 없으면 이름 첫 글자 원형 + 이름 해시 색)
     - 이름 (font-bold)
     - 플랫폼 로고들 (PlatformIcon, 보유 채널 플랫폼 전부)
     - 대표 등급 뱃지 (S~E)
     - 대표 채널 구독자 또는 "유튜브 250만 · 치지직 90만" 식 멀티 표기
     - 가능한 콘텐츠 타입 태그 (라이브/롱폼/숏폼)
   - 카드 클릭 → /creators/[id]
   - hover: -translate-y-1, border-[#9B7EC8]/40
4. **빈 상태**: 필터 결과 0명이면 "조건에 맞는 크리에이터가 없습니다" + 필터 초기화 버튼

### 필터 동작
- 클라이언트 상태로 필터링 (useState). 전체 목록을 받아서 클라에서 거름 (28명이라 양 적음)
- 또는 서버에서 전체 받고 useMemo로 필터

---

## Phase 3: 네비게이션 연결
- TopNav의 게임사(studio) 메뉴에 "크리에이터 찾기" 항목 추가 → /studio/creators
- 게임사 대시보드 쇼케이스 섹션 "더 보기" 또는 "전체 보기"가 있으면 → /studio/creators로 연결
  (없으면 쇼케이스 헤더 우측에 "크리에이터 전체 보기 →" 추가)

---

## Phase 4: 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: studio creator browsing page with grade/type filters" && git push origin rebuild

최종 보고:
- 페이지 경로 + 보호 방식
- 필터 동작 (등급/타입, 채널 단위 매칭)
- 카드 구성
- 네비/쇼케이스 연결 위치
- 시드 데이터로 몇 명 노출되는지
