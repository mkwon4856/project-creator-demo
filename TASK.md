# Project Creator — rebuild Task 14
## 역할별 상단 네비게이션 바 (전역)

배경: 페이지마다 독립형이라 페이지 간 이동 통로가 없음. 크리에이터가 지원 후 콘텐츠 제출 페이지(/creator/activity)를 못 찾는 등 시연 동선이 끊김.
목표: 게임사/크리에이터/관리자 각 역할의 모든 페이지 상단에 공통 네비게이션 바를 두고, 주요 페이지로 한 번에 이동 가능하게.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black. 상단 고정(sticky), 반투명 배경 + 하단 보더.

---

## Phase 1: 공통 네비게이션 컴포넌트

src/components/layout/TopNav.tsx 신규 생성.

요구사항:
- props로 role('studio' | 'creator' | 'admin')과 현재 경로를 받거나, 내부에서 usePathname()으로 현재 경로 판단
- 좌측: "Project Creator" 로고 텍스트 (Arial Black, 클릭 시 역할별 홈으로 이동: studio→/studio, creator→/creator, admin→/admin)
- 중앙/우측: 역할별 메뉴 링크들 (현재 페이지는 활성 표시 — 보라 텍스트 + 하단 보더)
- 최우측: 로그아웃 (기존 LogoutInline 또는 signOut→/login)
- sticky top-0, z-50, 배경 bg-[#0A0A0F]/80 backdrop-blur, border-b border-white/10
- 모바일 대응: 좁으면 메뉴가 줄바꿈되거나 가로 스크롤 (시연은 데스크톱이므로 기본은 가로 정렬)

역할별 메뉴:

studio:
- 대시보드 → /studio
- 캠페인 만들기 → /studio/new

creator:
- 캠페인 탐색 → /creator
- 내 지원·제출 → /creator/activity
- 수익 → /creator/earnings
- 채널 관리 → /creator/profile

admin:
- 대시보드 → /admin
- 캠페인 승인 → /admin/campaigns
- 콘텐츠 검수 → /admin/payouts

활성 상태 판단:
- 정확히 일치하거나, 하위 경로면 활성 (예: /studio/new 에서 "캠페인 만들기" 활성)
- /creator 와 /creator/activity 구분 주의 (정확 일치 우선, 그다음 startsWith)

---

## Phase 2: 각 페이지에 TopNav 배치

아래 페이지들의 최상단(기존 제목 위)에 TopNav를 추가하고, 기존에 각 페이지 헤더 우측에 개별로 박아둔 LogoutInline은 제거(중복 방지). 단 페이지 내 고유 액션 버튼(예: studio의 "캠페인 만들기" 버튼)은 TopNav에 메뉴로도 있지만 페이지 내 CTA는 남겨도 됨 — 중복이 어색하면 페이지 내 CTA는 유지하고 헤더의 로그아웃만 제거.

대상 페이지:
- studio: src/app/studio/page.tsx
- studio/new: src/app/studio/new/page.tsx (위저드지만 상단에 TopNav 추가, "저장 후 나가기"는 유지)
- creator: src/app/creator/page.tsx
- creator/activity: src/app/creator/activity/page.tsx
- creator/earnings: src/app/creator/earnings/page.tsx
- creator/profile: src/app/creator/profile/page.tsx
- admin: src/app/admin/page.tsx
- admin/campaigns: src/app/admin/campaigns/page.tsx
- admin/payouts: src/app/admin/payouts/page.tsx

배치 방식:
- 각 페이지의 최상위 컨테이너(min-h-screen bg-[#0A0A0F]) 바로 안쪽 맨 위에 <TopNav role="..." /> 추가
- 그 아래 기존 콘텐츠(max-w-... mx-auto ...)는 그대로
- role은 페이지 경로에 맞게 하드코딩(studio 페이지는 "studio" 등)

주의:
- 각 페이지가 'use client'인지 확인. TopNav도 usePathname/ router 쓰므로 'use client'.
- 기존 헤더에 있던 로그아웃/채널관리 링크 중 TopNav와 중복되는 건 정리하되, 기능은 유지.

---

## Phase 3: WorkspaceLayout 기반 페이지 처리

일부 페이지(admin/creators, admin/studios, studio/settings, creator/settings 등)는 기존 사이드바(WorkspaceLayout)를 씀.
- 이 페이지들은 사이드바가 이미 있으므로 TopNav를 중복으로 넣지 않는다.
- 단, 사이드바 메뉴에 위 Phase 1의 역할별 주요 메뉴(특히 creator의 "내 지원·제출", "수익", "채널 관리" / admin의 "캠페인 승인", "콘텐츠 검수")가 빠져 있으면 추가해서, 사이드바 페이지에서도 주요 화면으로 이동 가능하게 한다.
- 목표: 어느 페이지에 있든 같은 역할의 주요 화면으로 항상 이동 가능.

---

## Phase 4: 검증

1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: role-based top navigation across all pages" && git push origin rebuild

최종 보고:
- 역할별 네비 메뉴 구성
- TopNav 들어간 페이지 목록
- 사이드바 페이지 처리 결과
- 시연 동선에서 이제 클릭만으로 이동 가능한 경로 (예: 크리에이터 지원 후 "내 지원·제출" 클릭 → 콘텐츠 제출)
