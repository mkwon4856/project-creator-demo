# Project Creator — rebuild Task 25
## 게임사용 전체 캠페인 둘러보기 (/studio/campaigns 또는 /studio/explore)

목표: 게임사가 플랫폼의 모든 활성 캠페인을 둘러보는 페이지. "다른 게임사들이 이렇게
활발하게 캠페인을 운영 중"임을 보여줘 경쟁 동기를 자극. 게임사 로그인 전용.

표시 정보: 게임명/장르/썸네일, 총 예산, 선택한 미션들, 참여 크리에이터 "수"(명단 비공개), 마감.
**누가 참여했는지(크리에이터 명단/이름)는 절대 표시하지 않음. 인원 수만.**

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

**작업 전 반드시:**
1. src/components/campaign/CampaignPreviewCard.tsx (Task 23에서 만든 카드) — 재사용/변형 가능한지
2. src/app/creator/page.tsx 또는 캠페인 조회 함수 (fetchActiveCampaigns 등)
3. src/app/studio/creators/page.tsx (Task 24) — 게임사 보호 라우트/필터 패턴 참고
4. src/components/layout/TopNav.tsx — 게임사 네비에 메뉴 추가
5. /mnt/skills/public/frontend-design/SKILL.md (없으면 skip)

---

## Phase 1: 전체 캠페인 조회 함수

캠페인 조회 함수 추가 (creators.server.ts 유사한 위치, 예: campaigns.server.ts):
- fetchAllActiveCampaigns(): status='active'인 모든 캠페인
- 각 캠페인: id, game_name, genre, thumbnail_url, total_budget, deadline, studio(회사명은 표시할지 선택 — 아래 참고), missions(타입 목록), applications count(참여 인원 수)
- 정렬: 참여 인원 많은 순 또는 최신순 (경쟁심 자극엔 "참여 많은 순"이 좋음)

### 게임사(회사명) 표시 여부
- 다른 게임사 회사명을 보여줄지: 일단 회사명은 표시하되, 민감하면 "OO게임즈" 식으로. 기본은 studio company_name 표시.
- ⚠️ 참여 크리에이터 명단/이름은 조회하지도, 표시하지도 않음. applications는 COUNT만.

---

## Phase 2: 둘러보기 페이지 — src/app/studio/campaigns/page.tsx (경로명은 적절히)

게임사 로그인 보호 라우트.

### 레이아웃
1. 헤더: "캠페인 둘러보기" + 서브카피 "지금 다른 게임사들은 이렇게 크리에이터 마케팅을 진행하고 있어요" + 총 N개 진행 중
2. (선택) 정렬 토글: 참여 많은 순 / 최신순 / 마감 임박순
3. 캠페인 카드 그리드: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5

### 캠페인 카드 (이 페이지 전용 표시)
CampaignPreviewCard를 변형하거나 새 표시 모드 추가. 표시 항목:
- 썸네일 + 장르 + 마감 D-day
- 게임명 (+ 선택적으로 게임사명 작게)
- 모집 미션: 미션 타입 뱃지들 (라이브/롱폼/숏폼)
- **총 예산** (골드 강조) — "총 예산 ₩N" 또는 "N만원"
- **참여 크리에이터 N명** (인원 수만, 명단 없음)
- 마감일
- ⚠️ "지원하기" 버튼 없음 (게임사는 지원 대상 아님). 대신 정보 표시만, 또는 카드 클릭 시 캠페인 상세(있으면)로 — 단 상세에서도 참여자 명단 노출 안 되게 주의. 명단 노출 우려되면 클릭 비활성으로.

권장: 이 페이지 카드는 "정보 표시 전용"(클릭/지원 없음)으로 깔끔하게. 경쟁 현황을 보는 용도.

### 표시 강조 (경쟁심 자극)
- 참여 인원이 많은 캠페인은 "🔥 인기" 같은 뱃지 (예: 참여 5명 이상)
- 예산 큰 캠페인 강조 가능

---

## Phase 3: 네비게이션 연결
- TopNav 게임사 메뉴에 "캠페인 둘러보기" 추가 → 해당 경로
- (Task 24의 "크리에이터 찾기"와 나란히)

---

## Phase 4: 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: studio campaign explore page (budget/missions/participant count)" && git push origin rebuild

최종 보고:
- 페이지 경로
- 표시 정보 (총예산/미션/참여수) + 참여자 명단 비노출 확인 ★
- 정렬/강조 방식
- 카드 클릭 동작 (비활성 또는 상세)
- 네비 연결
