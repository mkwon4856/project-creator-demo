# Project Creator — rebuild Task 17
## 게임사 대시보드 운영 버전 + 크리에이터 쇼케이스 + 콘텐츠 열람

목표: 게임사 로그인 첫 화면을 운영 콘솔 + 영업 쇼케이스로 업그레이드.
크리에이터 쇼케이스(최상단 강조), 예산 현황, 내 캠페인 운영 현황, 우리 캠페인에 올라온 콘텐츠 열람.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

**제약: 기존 데이터 흐름/기능 로직 깨지지 않게. 작업 전 src/app/studio/page.tsx 전체 읽기 + /mnt/skills/public/frontend-design/SKILL.md 읽기.**

---

## Phase 0: DB — 크리에이터 아바타 컬럼 추가

supabase/migrations/20260611000004_creator_avatar.sql 생성:
```sql
ALTER TABLE creators ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE creator_channels ADD COLUMN IF NOT EXISTS thumbnail_url text;
```

---

## Phase 1: 크리에이터 채널 등록에 아바타/썸네일 입력 추가

src/app/creator/profile/page.tsx:
- 프로필 상단에 "대표 이미지 URL" 입력 → creators.avatar_url 저장
- 채널 추가 폼에 "채널 썸네일 URL"(선택) → creator_channels.thumbnail_url 저장
- 기존 채널 등록 로직 유지, 필드만 추가

---

## Phase 2: 플랫폼 로고 컴포넌트

src/components/icons/PlatformIcon.tsx 생성:
- props: platform ('youtube'|'soop'|'chzzk'|'tiktok'), size (기본 20)
- 각 플랫폼 인라인 SVG 로고:
  - youtube: 빨강(#FF0000) 라운드 사각 + 흰 플레이 삼각형
  - tiktok: 검정 배경 원/사각 + 음표 심볼 (단색 가능)
  - chzzk: 치지직 브랜드 그린(#00FFA3) 배경 + 심볼
  - soop: SOOP 브랜드 컬러 배경 + 심볼
- 브랜드 정밀도보다 "한눈에 구분되는 색+심볼"이 목적. 원형/라운드 배경에 플랫폼 색 + 간단 심볼.
- 적용처: 크리에이터 채널 카드, 게임사 쇼케이스, (있으면) 캠페인 카드 플랫폼 표시. 플랫폼은 텍스트 대신 이 로고 우선.

---

## Phase 3: 게임사 대시보드 재구성 — src/app/studio/page.tsx

레이아웃 (위→아래):

### 3-1. 헤더
- "안녕하세요, {company_name}님 👋" (기존 유지), TopNav 유지

### 3-2. 크리에이터 쇼케이스 (최상단 강조 — 영업 포인트)
- 큰 섹션, 보라 그라데이션 배경(from-[#1a1030] to-[#0A0A0F]), 보라 테두리 rounded-2xl
- 헤드라인: "Project Creator와 함께하는 크리에이터"
- 서브: "유튜브·치지직·SOOP·틱톡에서 활동 중인 검증된 크리에이터들"
- 우측: "총 N명+" (creators 전체 카운트)
- 크리에이터 카드 가로 스크롤(overflow-x-auto flex gap-4):
  - creators + creator_channels 조인, 상위 12~15명 (구독자 많은 채널 보유 순 또는 등급 높은 순)
  - avatar_url 있으면 원형 이미지, 없으면 이름 첫 글자 원형(이름 해시 색)
  - 이름 + 대표 채널(최다 구독): PlatformIcon + 구독자
  - 등급 뱃지(S~E) + 콘텐츠 타입
  - 채널 여러 개면 PlatformIcon 여러 개 나열
- 빈 데이터(크리에이터 0명)면 섹션은 "곧 다양한 크리에이터가 합류합니다" 정도로 placeholder

### 3-3. 예산 현황
- 충전 잔액(골드 강조) + 충전 버튼(기존 CreditBalance/ChargeModal 재사용) + 홀딩/누적
- 요약 카드 3개: 진행 중 캠페인 / 참여 크리에이터(내 캠페인 applications 합) / 올라온 콘텐츠(내 캠페인 submissions 합)

### 3-4. 내 캠페인 (운영 관점)
- 캠페인별 행: 썸네일(작게) + 게임명 + 상태 뱃지
  - "참여 N명 · 콘텐츠 제출 M건 · 검수 완료 K건"
  - 예산 소진율 진행 바 ((total_budget - remaining_budget)/total_budget)
  - 마감 D-day (deadline 있으면 — Task 16에서 추가됨)
- 클릭 시 캠페인 상세로

### 3-5. 우리 캠페인에 올라온 콘텐츠 (게임사 열람) ★ 신규
- 내 캠페인들의 submissions를 카드 그리드로:
  - 카드: 플랫폼별 그라데이션 썸네일 + 재생 아이콘
  - 크리에이터 이름 + 콘텐츠 타입 + PlatformIcon
  - 상태: 검수 완료 ✓(approved) / 검수 중(pending) / 반려(rejected)
  - approved면 클릭 시 platform_urls 첫 URL을 새 탭(target=_blank)으로 열기
- 안내: "검수는 Project Creator가 진행합니다. 게임사는 완성된 콘텐츠를 확인할 수 있어요."

---

## Phase 4: 게임사 콘텐츠 열람 권한 (RLS)
supabase/migrations/20260611000006_studio_view_content.sql 생성:
- 게임사(studio)가 자기 캠페인(campaigns.studio_id가 본인 studio)의 submissions를 SELECT 가능한 정책
- 경로: submissions → applications → campaigns(studio_id = get_my_studio_id())
- applications도 게임사가 자기 캠페인 것 조회 가능해야 카운트/조인이 됨 (정책 확인)
- 기존 admin/creator 정책 유지, DROP POLICY IF EXISTS로 충돌 방지

---

## Phase 5: 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: studio dashboard with creator showcase, platform logos, content viewing" && git push origin rebuild

최종 보고:
- 추가된 SQL 파일들 (creator_avatar, studio_view_content)
- 크리에이터 쇼케이스 데이터 소스
- PlatformIcon 적용 위치
- 게임사 콘텐츠 열람 동작 방식
- 민석이 실행할 SQL 안내 (순서대로)
