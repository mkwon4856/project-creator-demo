# Project Creator — rebuild Task 16
## 크리에이터 캠페인 탐색 — 게임 카드 갤러리 + 마감일

목표: 캠페인 탐색(/creator)을 게임 스토어 카드 갤러리로 업그레이드(v4 레이아웃).
썸네일 크게 유지 + 미션 줄 컴팩트 + 하단 메타(마감 D-day / 참여 현황 / 예산 소진율).

**제약: 기존 기능(지원/필터/등급 매칭/내 단가 계산)은 그대로. 작업 전 src/app/creator/page.tsx 전체 읽기 + /mnt/skills/public/frontend-design/SKILL.md 읽기.**

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

---

## Phase 0: DB — 캠페인 마감일 컬럼

supabase/migrations/20260611000005_campaign_deadline.sql 생성:
```sql
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deadline date;
```

---

## Phase 1: 캠페인 생성 wizard에 마감일 입력 추가

src/app/studio/new/_components/StepGame.tsx (1단계) 또는 StepMissions.tsx (2단계)에:
- "모집 마감일" 날짜 입력 추가 (input type="date")
- _types.ts WizardState에 deadline: string 추가 (기본값 '')
- page.tsx handleSubmit의 createCampaign 호출에 deadline 포함
- 마감일은 선택값으로 둬도 되지만, 입력 권장 안내. 미입력 시 null 저장.

createCampaign API/타입(Campaign)에 deadline 필드 반영 (db.types.ts Campaign에 deadline: string | null 추가).

---

## Phase 2: 캠페인 탐색 카드 갤러리 — src/app/creator/page.tsx

기존 로직(myGrades, eligibleCampaigns, getMyRate, hasApplied, handleApply, 미션 filled)은 유지. UI만 카드 그리드로.

### 레이아웃
- 헤더(기존 유지) + 필터 pill(기존 유지)
- 카드 그리드: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5

### 캠페인 카드 (v4)
1. **썸네일 영역 (높이 약 186px, 카드 상단)**
   - thumbnail_url 있으면 <img object-cover>, 없으면 게임명 해시 기반 그라데이션 + 게임명 첫 글자(text-5xl font-black text-white/15)
   - 좌상단: 장르 태그 (검정 반투명 pill)
   - 우상단: 마감 D-day 뱃지. D-3 이하면 빨강(bg-red-500), 그 외 회색 반투명. deadline 없으면 생략
   - onError로 이미지 실패 시 그라데이션 fallback

   그라데이션 헬퍼:
   ```tsx
   function gameGradient(seed: string): string {
     const g = ['from-purple-900 via-[#0A0A0F] to-indigo-900','from-rose-900 via-[#0A0A0F] to-purple-900','from-blue-900 via-[#0A0A0F] to-cyan-900','from-amber-900 via-[#0A0A0F] to-orange-900','from-emerald-900 via-[#0A0A0F] to-teal-900','from-fuchsia-900 via-[#0A0A0F] to-purple-900']
     let h=0; for(let i=0;i<seed.length;i++) h=seed.charCodeAt(i)+((h<<5)-h)
     return g[Math.abs(h)%g.length]
   }
   ```

2. **본문 (썸네일 아래 padding)**
   - 게임명 (font-bold truncate)
   - 게임 설명 (text-sm text-white/40, line-clamp-2)

3. **미션 줄들 (컴팩트, 내가 참여 가능한 타입만)**
   - 각 타입마다 한 줄(높이 약 48px), bg-white/5 rounded:
     - 좌: 타입명(롱폼/숏폼/라이브) + 그 아래 작게 "B/C/D등급"
     - 우: "단가" 라벨 + 단가 금액(골드, font-black) — getMyRate로 내 등급 단가
     - 맨 우: 작은 지원 버튼. 미지원이면 보라 "지원", 이미 지원이면 초록 "완료 ✓"(disabled)
   - 타입별 독립 지원 (기존 handleApply 그대로, contentType별 호출)
   - 미션 여러 개면 줄이 쌓임 (카드 높이 자동 증가)

4. **하단 메타 (구분선 아래)**
   - 좌: "모집 마감" + 날짜(예: 6월 20일) + (D-N). deadline 없으면 "상시 모집"
   - 우: "참여 현황" + "N명 참여 중" (이 캠페인 applications 개수 — campaigns 조회 시 applications count 함께 가져오거나 별도 카운트)
   - 진행 바: 예산 소진율 = (total_budget - remaining_budget) / total_budget. 마감 임박(D-3↓)이면 골드, 평소 보라
   - 진행 바 아래 작게: "예산 N% 소진"

5. **카드 인터랙션**
   - rounded-2xl, bg-white/5, border border-white/10, overflow-hidden
   - hover: -translate-y-1, border-[#9B7EC8]/40, transition

### 참여 현황 카운트
- useActiveCampaigns 또는 캠페인 조회 시 각 캠페인의 applications 개수 필요.
- campaigns select에 applications(count) 조인하거나, 별도로 applications를 campaign_id로 그룹 카운트해서 맵으로 보유.

### 빈 상태 / 채널 미등록 안내: 기존 유지(게임 톤으로 다듬기)

---

## Phase 3: 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "design: campaign browse game card gallery + deadline" && git push origin rebuild

최종 보고:
- 추가된 SQL (campaign_deadline)
- wizard 마감일 입력 위치
- 카드 구성요소 (썸네일/미션줄/메타)
- 유지된 기능 확인 (지원/필터/매칭/단가)
- 민석이 실행할 SQL 안내
