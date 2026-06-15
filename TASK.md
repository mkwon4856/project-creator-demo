# Project Creator — rebuild Task 13
## 예상 참여 크리에이터 수 = 범위 계산 + 기존 피드백 반영 검증

배경: 캠페인 3단계에서 D/E 롱폼 + 500만원인데 "예상 참여 약 1명"으로 뜸.
미션 1개를 슬롯 1개로 보는 게 원인. 실제로는 오픈마켓이라 예산÷단가 만큼 여러 명 참여 가능.

---

## Phase 1: 현재 상태 진단 (코드 수정 없이 보고만)

다음을 확인해서 먼저 보고:
1. src/app/studio/new/_components/StepReview.tsx — "예상 참여 크리에이터" 계산이 지금 어떻게 되어 있는지 (미션 개수 기반인지, 예산 기반인지)
2. src/app/studio/new/_components/StepMissions.tsx — 등급 선택 레이블이 "참여 가능한 크리에이터 등급"인지 "허용 등급"인지 (Task 4에서 바꿨다고 했으나 확인 필요)
3. 미션 가이드라인 입력이 한 줄씩 추가/삭제되는 리스트 UI인지, 단일 textarea인지
4. 3단계에서 미션별 금액(₩)이 노출되는지 숨겨졌는지
5. 자동배분 미션이 화면에 개별로 몇 개씩 나열되는지

각 항목 현재 상태를 보고한 뒤, 아래 Phase 2~3 수정 진행.

---

## Phase 2: 예상 참여 크리에이터 = 범위 계산

### 계산 로직
미션별로, 그 미션에 배정된 예산을 기준으로 참여 가능 인원을 범위로 계산한다.

- 미션의 허용 등급들 중 **최고 등급 단가** = 1인당 최대 비용 → 최소 인원
- 미션의 허용 등급들 중 **최저 등급 단가** = 1인당 최소 비용 → 최대 인원
- 미션 예산 = 그 미션에 할당된 금액. (현재 구조상 미션별 예산 분리가 없으면, 총예산을 미션 개수로 나누거나, 더 단순하게: 총예산 기준으로 전체 범위를 계산)

구현 방식 (현재 코드 구조에 맞게):
- 각 미션 슬롯에 대해, 해당 미션이 쓸 예산을 추정한다.
  - 게임사 미션들 + 자동배분 미션들의 studio_amount 합이 총예산에 맞춰져 있으므로,
  - 미션별 "예상 인원 범위"는 다음으로 계산:
    - maxCostPerPerson = 허용등급 중 최고등급의 studio_amount(=creator_amount/0.7 반올림)
    - minCostPerPerson = 허용등급 중 최저등급의 studio_amount
    - 해당 미션에 할당 가능한 예산(budgetForMission)을 추정
    - minPeople = floor(budgetForMission / maxCostPerPerson)
    - maxPeople = floor(budgetForMission / minCostPerPerson)
- 단, 현 구조에서 미션별 예산 분리가 명확하지 않으면, 다음의 단순하고 안전한 방식을 사용:
  - 전체 예상 참여 = floor(총예산 / 전체 미션들의 평균 maxCostPerPerson) ~ floor(총예산 / 전체 미션들의 평균 minCostPerPerson)
  - 미션별로도 "이 미션에 ₩X 예산이면 약 a~b명" 식으로 표기

### StepReview.tsx 표시 변경
- 미션별로: "롱폼 D/E등급 — 약 a~b명"
- 총 예상 참여: 모든 미션 범위 합산 → "총 약 (min합)~(max합)명"
- 금액(₩)은 계속 비노출 유지

### 주의
- 0으로 나누기 방지 (단가 0이면 제외)
- min > max 안 되게 보정
- 범위가 동일하면 "약 N명"으로 단일 표기

---

## Phase 3: Task 4 피드백 미반영분 재확인 및 수정

Phase 1 진단 결과, 아래가 안 되어 있으면 수정:
1. StepMissions 등급 레이블 → "참여 가능한 크리에이터 등급 (복수 선택)"
2. 미션 가이드라인 → 한 줄씩 추가/삭제 리스트 UI (string[] 저장)
3. 3단계 미션별 금액(₩) 비노출
4. 자동배분 미션이 개별로 수십 개 나열되면 → "E등급 외 자동배분 N건" 식으로 묶어서 1줄 요약 표시 (StepReview에서)

---

## Phase 4: 검증

1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "fix: estimated creators as range + apply pending wizard feedback" && git push origin rebuild

최종 보고: Phase 1 진단 결과 표 + 무엇을 고쳤는지 + 예시 계산(500만/D·E 롱폼이면 약 몇~몇명으로 뜨는지)

---

## Phase 5: 로그아웃 버튼 전역 노출 (추가)

문제: LogoutButton이 사이드바에만 있어서, 사이드바 없는 독립형 페이지(/studio, /creator, /admin 대시보드 등)에서는 로그아웃 진입점이 없음.

해결:
- 로그인 상태에서 모든 페이지 우상단에 항상 보이는 로그아웃 진입점을 추가한다.
- 방식: 공통 상단 우측에 작은 계정 메뉴 또는 로그아웃 버튼을 띄우는 컴포넌트 GlobalLogout(또는 기존 LogoutButton 재사용)을 만들어, 사이드바 없는 대시보드 페이지들의 헤더 영역에 배치.
- 구체적으로 아래 페이지들의 헤더(제목 우측)에 로그아웃 버튼을 추가:
  - src/app/studio/page.tsx (이미 "캠페인 만들기" 버튼이 있는 헤더 우측에 로그아웃 아이콘 버튼 추가)
  - src/app/creator/page.tsx (헤더 우측 "채널 관리 →" 옆에 로그아웃)
  - src/app/admin/page.tsx (헤더 우측에 로그아웃)
  - src/app/admin/campaigns/page.tsx (제목 우측에 로그아웃)
  - src/app/admin/payouts/page.tsx (제목 우측에 로그아웃)
  - src/app/creator/activity/page.tsx, creator/earnings/page.tsx, creator/profile/page.tsx (각 제목 우측)
  - src/app/studio/new/page.tsx 는 "저장 후 나가기"가 이미 있으면 생략 가능
- 디자인: lucide-react LogOut 아이콘 + "로그아웃" 텍스트(또는 아이콘만), text-white/40 hover:text-red-400, 작게. 다크 톤 유지.
- 동작: supabase.auth.signOut() 후 router.push('/login')
- 가능하면 작은 공용 컴포넌트 하나(LogoutInline)로 만들어 각 헤더에서 재사용.

검증에 포함: 위 페이지 전부에서 로그아웃 버튼이 보이고 동작하는지.
