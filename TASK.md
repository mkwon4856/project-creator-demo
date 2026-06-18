# Project Creator — rebuild Task 23
## 캠페인 생성 3단계(최종 확인)에 크리에이터 노출 미리보기 추가

목표: 캠페인 생성 위저드 3단계(StepReview/최종 확인)에서, 게임사가 런칭 전에
"내 캠페인이 크리에이터에게 어떻게 보이는지"를 실제 카드 미리보기로 확인하게 한다.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

**작업 전 반드시:**
1. src/app/creator/page.tsx — 크리에이터 탐색 캠페인 카드가 어떻게 렌더되는지 (카드 컴포넌트가 별도 분리돼 있는지, 인라인인지)
2. 카드가 별도 컴포넌트면 그 파일 (예: src/components/creator/CampaignCard.tsx 등)
3. src/app/studio/new/ 의 3단계(StepReview) 컴포넌트 + 위저드 상태(WizardState) 구조
4. /mnt/skills/public/frontend-design/SKILL.md (없으면 skip)

---

## Phase 1: 크리에이터 카드 컴포넌트 재사용 준비

- 크리에이터 탐색(creator/page.tsx)의 캠페인 카드가 **인라인이면**, 재사용 가능한 컴포넌트로 추출:
  - src/components/campaign/CampaignPreviewCard.tsx (또는 적절한 위치)
  - props로 캠페인 데이터(게임명, 장르, 썸네일, 미션들, 마감, 참여현황 등)를 받게
  - 기존 탐색 페이지도 이 컴포넌트를 쓰도록 교체 (동작 동일하게 — 깨지지 않게)
- 이미 별도 컴포넌트면 그대로 재사용.

**중요: 미리보기와 실제 탐색 카드가 같은 컴포넌트를 쓰도록 한다.** 그래야 "실제로 보이는 모습"과 100% 일치.

### 미리보기 모드 prop 추가
- CampaignPreviewCard에 `preview?: boolean` prop 추가
- preview=true일 때:
  - 금액 표시를 "최대 지급" 대신 **"총 예산"**으로 (총 예산 금액 표시)
  - "지원하기" 버튼은 비활성(disabled, 흐리게) + 클릭 동작 없음
  - 카드 하단 또는 위에 작은 라벨 "미리보기" 표시
- preview 미지정(실제 탐색)일 때: 기존대로 "최대 지급액" + 활성 지원 버튼

---

## Phase 2: 3단계(최종 확인)에 미리보기 삽입

StepReview(3단계)에서:
- 기존 요약(게임 정보, 미션 구성, 예상 참여 인원)은 유지
- 그 아래 "크리에이터에게 이렇게 보입니다" 섹션 추가:
  - 헤더 + 서브카피 "크리에이터가 캠페인 탐색에서 보게 될 실제 모습입니다"
  - 위저드 현재 입력값(WizardState)으로 CampaignPreviewCard를 preview=true로 렌더
  - 가운데 정렬, 적당한 폭 (실제 카드 1장 크기)
- 미리보기 카드에 들어갈 데이터는 위저드 상태에서 구성:
  - 게임명, 장르, 썸네일(있으면), 미션 타입들, 총 예산, 마감일(있으면 "상시 모집"), 참여 현황은 "0명 참여 중"(아직 런칭 전)

### 총 예산 표시
- preview 모드 카드의 금액 = WizardState의 총 예산 (total_budget)
- 표기: "총 예산" 라벨 + 금액 (예: ₩2,000,000 또는 200만원). 기존 만원 포맷 헬퍼 있으면 재사용.

---

## Phase 3: 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: campaign preview card in review step" && git push origin rebuild

최종 보고:
- 카드 컴포넌트 추출 여부 (재사용 구조)
- preview 모드에서 총 예산 표시 확인
- 탐색 페이지 기존 동작 유지 확인
- 3단계 미리보기 삽입 위치
