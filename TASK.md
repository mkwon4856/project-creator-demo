# Project Creator — rebuild Task 21
## 랜딩 페이지에 "진행 중인 캠페인" 섹션 추가 (간소화 카드)

목표: 랜딩의 크리에이터 쇼케이스 아래에 "진행 중인 캠페인" 섹션 추가.
크리에이터가 "어떤 게임 캠페인이 열려있고, 최대 얼마 받는지"를 바로 보게.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

**작업 전:**
1. src/app/page.tsx (랜딩) 현재 구조 — 쇼케이스 섹션이 어디 있는지, fetchShowcaseCreators/fetchActiveCampaigns가 어떻게 쓰이는지 확인
2. 기존 캠페인 카드/미션 단가 계산 로직 (RATE_MATRIX, missions creator_amount 등) 확인
3. /mnt/skills/public/frontend-design/SKILL.md (없으면 skip, 기존 패턴 따름)

---

## 섹션 위치
크리에이터 쇼케이스 섹션 **바로 아래**에 "진행 중인 캠페인" 섹션 삽입.

## 데이터
- fetchActiveCampaigns로 status='active' 캠페인 조회, 마감 임박순(deadline 가까운 순) 상위 3개
- 각 캠페인의 missions 조회 → 미션 타입들 + 최대 단가 계산
- 각 캠페인의 applications count → 참여 현황

## 섹션 구성
- 헤더: "지금 진행 중인 캠페인" + 서브카피 + 우측 "전체 보기 →"(로그인/탐색으로)
- 카드 그리드: grid-cols-1 md:grid-cols-3 gap-5 (상위 3개)

## 캠페인 카드 (간소화 — 높이 약 380px)
1. **썸네일** (약 150px 높이): thumbnail_url 있으면 이미지, 없으면 게임명 그라데이션
   - 좌상단: 장르 태그
   - 우상단: 마감 D-day 뱃지 (D-3↓ 빨강, 그 외 회색)
2. **게임명** (font-black, 한 줄 truncate)
3. **모집 미션 + 최대 지급** (한 행에 좌우 배치):
   - 좌: "모집 미션" 라벨 + 미션 타입 뱃지들만 (라이브/롱폼/숏폼 — 색 구분, 텍스트 설명 없이 뱃지만)
   - 우: "최대 지급" 라벨 + 금액 (골드, font-black, 크게)
     - 최대 지급 = 이 캠페인 missions 중 creator_amount 최댓값. "최대 N만원" 또는 "최대 N,NNN만원" 형식 (만원 단위로 표기)
   - ⚠️ 등급별 단가 나열은 절대 넣지 말 것. 최대 지급액 하나만 강조.
4. **하단 메타** (구분선 아래, 좌우):
   - 좌: "모집 마감" + 날짜 + (D-N). deadline 없으면 "상시 모집"
   - 우: "참여 현황" + "N명 참여 중" (applications count)
5. **CTA 버튼** (풀폭, 보라): "지원하러 가기" → /signup 또는 /login (비로그인 유도)

### 최대 지급액 계산
- 캠페인의 missions에서 creator_amount(크리에이터 수령액) 최댓값
- 표기: 원 단위를 만원으로. 예: 5,000,000 → "최대 500만원", 15,000,000 → "최대 1,500만원"
- 헬퍼로 깔끔하게 (예: formatManwon(amount))

### 디자인
- 카드 rounded-2xl, bg-white/5, border, hover:-translate-y-1 hover:border-[#9B7EC8]/40
- 미션 타입 뱃지 색: 라이브=보라(#9B7EC8), 롱폼=골드(#E5B567 배경 검정 텍스트), 숏폼=#7c3aed
- 모바일 반응형 (1열)

---

## 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: active campaigns section on landing" && git push origin rebuild

최종 보고:
- 섹션 삽입 위치 (쇼케이스 아래 확인)
- 최대 지급액 계산 방식
- 미션 타입 뱃지 표시
- 노출 캠페인 수 / 정렬 기준
- CTA 연결
