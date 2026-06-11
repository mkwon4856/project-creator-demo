# Project Creator — rebuild Task 4
## Wizard 피드백 반영 + AuthForm 수정

---

## Task 4-1: AuthForm.tsx studios description 제거

src/app/(auth)/_components/AuthForm.tsx 에서
studios insert 시 description 필드 제거해줘.
studios 테이블에는 description 컬럼이 없음.

---

## Task 4-2: 2단계 레이블 변경

src/app/studio/new/_components/StepMissions.tsx 에서:
- "허용 등급 (복수 선택)" → "참여 가능한 크리에이터 등급 (복수 선택)" 으로 변경

---

## Task 4-3: 미션 가이드라인 UI 변경

src/app/studio/new/_components/StepMissions.tsx 에서
가이드라인 입력을 textarea 대신 한 줄씩 추가/삭제 가능한 리스트 UI로 변경.

### MissionSlot 타입 변경
src/app/studio/new/_types.ts 에서:
```typescript
// 변경 전
guide_draft: string

// 변경 후
guide_draft: string[]  // 줄 단위 배열
```

### StepMissions.tsx 가이드라인 UI 교체
기존 textarea 부분을 아래 UI로 교체:

```tsx
{/* 가이드라인 */}
<div>
  <label className="text-xs text-white/50 mb-2 block">미션 가이드라인</label>
  <div className="space-y-2">
    {(mission.guide_draft as string[]).map((line, lineIdx) => (
      <div key={lineIdx} className="flex gap-2 items-center">
        <span className="text-xs text-white/30 w-4">{lineIdx + 1}.</span>
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
          placeholder={`가이드 ${lineIdx + 1}`}
          value={line}
          onChange={e => {
            const newGuide = [...(mission.guide_draft as string[])]
            newGuide[lineIdx] = e.target.value
            updateMission(mission.id, { guide_draft: newGuide })
          }}
        />
        <button
          onClick={() => {
            const newGuide = (mission.guide_draft as string[]).filter((_, i) => i !== lineIdx)
            updateMission(mission.id, { guide_draft: newGuide.length ? newGuide : [''] })
          }}
          className="text-white/20 hover:text-red-400 text-sm px-1"
        >✕</button>
      </div>
    ))}
    <button
      onClick={() => updateMission(mission.id, { guide_draft: [...(mission.guide_draft as string[]), ''] })}
      className="text-xs text-[#9B7EC8] hover:text-[#9B7EC8]/80 transition-colors"
    >
      + 가이드 추가
    </button>
  </div>
</div>
```

### MissionSlot 초기값 변경
addMission 함수에서:
```typescript
// 변경 전
guide_draft: '',

// 변경 후
guide_draft: [''],
```

### guide_draft를 DB에 저장할 때 처리
page.tsx의 createMissions 호출부에서:
```typescript
// 변경 전
guide_draft: m.guide_draft || null,

// 변경 후
guide_draft: Array.isArray(m.guide_draft)
  ? (m.guide_draft as string[]).filter(Boolean).join('\n') || null
  : m.guide_draft || null,
```

---

## Task 4-4: 단가 계산 로직 수정

현재 문제: B, C 등급 선택 시 B 1명 + C 1명 비용으로 계산됨
새 기획: 미션 1개 = 크리에이터 1명 슬롯. 단가는 선택된 등급 중 최고 등급 기준 1개 슬롯 비용만.

src/app/studio/new/_components/StepMissions.tsx 에서
calcMissionAmount 함수를 아래로 교체:

```typescript
function calcMissionAmount(grades: Grade[], type: ContentType): number {
  if (!grades.length) return 0
  // 선택된 등급 중 가장 높은 등급의 단가 기준 (슬롯 1개)
  const gradeOrder: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E']
  const highestGrade = gradeOrder.find(g => grades.includes(g)) ?? grades[0]
  return RATE_MATRIX[highestGrade][type]
}
```

---

## Task 4-5: 3단계 미션별 금액 숨기기

src/app/studio/new/_components/StepReview.tsx 에서:
- 미션 카드의 금액 표시 (`₩{mission.studio_amount.toLocaleString()}`) 제거
- 자동 배분 미션 카드의 금액 표시도 제거

---

## Task 4-6: 3단계 예상 결과물 breakdown 표시

src/app/studio/new/_components/StepReview.tsx 에서
예상 결과물 섹션을 아래로 교체:

```tsx
{/* 예상 결과물 */}
<div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-4 space-y-3">
  <div className="text-sm font-medium text-white/70 mb-2">예상 참여 크리에이터</div>
  {state.missions.map((mission, idx) => (
    <div key={mission.id} className="flex justify-between text-sm">
      <span className="text-white/50">
        {CONTENT_TYPE_LABELS[mission.content_type]} {mission.allowed_grades.join('/')}등급
      </span>
      <span className="text-white">약 1명</span>
    </div>
  ))}
  {state.auto_missions.map((mission, idx) => (
    <div key={mission.id} className="flex justify-between text-sm">
      <span className="text-white/50">
        {CONTENT_TYPE_LABELS[mission.content_type]} {mission.allowed_grades.join('/')}등급 (자동)
      </span>
      <span className="text-white">약 1명</span>
    </div>
  ))}
  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-medium">
    <span className="text-white/70">총 예상 참여</span>
    <span className="text-white">약 {state.missions.length + state.auto_missions.length}명</span>
  </div>
</div>
```

---

## 완료 후

1. git add . && git commit -m "fix: wizard feedback - guide list UI, grade label, cost logic, hide amounts" && git push origin rebuild
2. PROGRESS.md 업데이트
