# Project Creator — rebuild Task 27
## 네비게이션 정비 (진단 결과 기반 실제 정리)

목표: Task 26 진단에서 드러난 네비 혼선을 정리. 레거시 네비/페이지 폐기, 깨진 링크 제거,
빠진 링크 추가, 캠페인 상세 막다른 페이지 해소, 로고 일관화.

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

**작업 전 반드시 읽기:**
1. src/components/layout/TopNav.tsx — 역할별 메뉴 구조
2. 레거시 네비: WorkspaceLayout, Sidebar (getStudioSidebar/getAdminSidebar)
3. src/proxy.ts — 보호 라우트
4. src/app/campaigns/[id]/page.tsx — 캠페인 상세(막다른 페이지)
5. src/app/creators/[id]/page.tsx 의 BackBar
6. 폐기 후보 페이지들: /studio/explore, /studio/applicants, /studio/review, /studio/payments

---

## Phase 1: 깨진 링크 제거 (404로 가는 것) — 최우선
관리자 레거시 Sidebar가 가리키는 존재하지 않는 라우트 링크 제거:
- /admin/disputes, /admin/analytics, /admin/revenue, /admin/settings
이 4개 링크를 네비에서 삭제 (페이지 신설 안 함).

## Phase 2: 레거시 네비 시스템 일원화
- WorkspaceLayout(좌측 Sidebar) 기반 페이지들을 신규 TopNav로 통일.
- 레거시 Sidebar 컴포넌트가 더 안 쓰이면 제거 (단, 다른 데서 import 시 빌드 깨지지 않게 확인).
- 모든 로그인 후 페이지가 TopNav만 사용하도록.

## Phase 3: 레거시 중복/불필요 페이지 폐기
새 서비스 모델(검수=관리자, 게임사는 충전만)에서 불필요한 게임사 레거시 페이지 제거:
- /studio/explore (= /studio/campaigns 와 중복) → 폐기
- /studio/applicants (지원자 관리 — 새 모델에서 게임사가 직접 안 함) → 폐기
- /studio/review (검수 — 관리자가 함) → 폐기
- /studio/payments (구 정산 — 게임사는 충전만) → 폐기
폐기 방법: 페이지 파일 삭제 또는 라우트에서 제거. 삭제 시 import/링크 잔존으로 빌드 깨지지 않게 정리.
⚠️ 삭제 전, 이 페이지들이 다른 곳에서 참조되는지 grep 확인하고 보고. 애매하면 삭제 대신 네비에서만 숨기고 보고.

## Phase 4: 빠진 링크 추가 (orphan 페이지 연결)
TopNav 우측에 "계정 드롭다운"(아바타/이름 클릭 → 메뉴)을 추가하거나, 메뉴에 직접 추가:
- 게임사: "설정" → /studio/settings 연결
- 크리에이터: "설정" → /creator/settings 연결
- 관리자 메뉴에 추가: "게임사 관리" → /admin/studios, "크리에이터 관리" → /admin/creators
  (이 두 페이지는 살림 — 관리자가 실제 쓸 기능)

권장: 로그아웃도 계정 드롭다운 안으로 넣어 정리 (현재 우측 단독 로그아웃이면 드롭다운으로 통합).

## Phase 5: 캠페인 상세 막다른 페이지 해소
src/app/campaigns/[id]/page.tsx:
- 상단에 최소 헤더/뒤로가기 추가 (BackBar 패턴 재사용 가능)
- CTA 분기: 보는 사람이 로그인 게임사면 "크리에이터로 참여하기" 노출 안 함.
  - 비로그인 또는 크리에이터 → 기존 CTA 유지
  - 로그인 게임사 → CTA 숨기거나 "목록으로" 정도로
- 직접 진입/새로고침해도 갇히지 않게 (홈/탐색으로 나갈 길 제공)

## Phase 6: 로고/뒤로가기 일관화
- 로그인 상태: 로고 클릭 → 역할 홈 (게임사 /studio, 크리에이터 /creator, 관리자 /admin)
- 비로그인: 로고 클릭 → 랜딩 /
- /creators/[id], /campaigns/[id]의 BackBar 로고도 이 규칙 따르게
- TopNav, BackBar, 랜딩 nav 전부 동일 규칙

## Phase 7: (선택) 모바일 메뉴
- TopNav 항목이 늘었으니 모바일에서 햄버거/드로어 고려. 시간 되면 적용, 아니면 가로 스크롤 유지하되 보고.

---

## 검증
1. npx tsc --noEmit → 0 errors
2. npm run build → 성공 (삭제한 페이지 참조 잔존 없는지 빌드로 확인)
3. 각 역할 로그인 후 모든 메뉴 항목 클릭 시 404 없는지 (가능하면 런타임 점검)
4. git add . && git commit -m "refactor: unify navigation, remove legacy routes, fix orphan links" && git push origin rebuild

최종 보고:
- 제거한 깨진 링크 (404) 목록
- 폐기한 레거시 페이지 + 참조 정리 내역
- 추가한 링크 (설정/관리자 메뉴) 위치
- 캠페인 상세 헤더/CTA 분기 처리
- 로고 일관화 결과
- 남은 이슈 (있으면)
