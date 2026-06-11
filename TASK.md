# Project Creator — rebuild Task 11 (대형)
## 클라이언트 시연 가능 상태까지 완성

목표: 민석이 클라이언트 앞에서 전체 플로우를 시연할 수 있는 상태.
시연 플로우: 게임사 가입 → 캠페인 생성 → Admin 승인 → 크리에이터 가입 → 채널 등록 → 캠페인 지원 → 콘텐츠 제출 → Admin 검수 승인 → 크리에이터 수익 확인

작업 방식 주의:
- 이번 Task는 감사(audit) 먼저, 구현은 그 다음이다. 추측으로 짜지 말 것.
- 각 Phase 완료 시 중간 보고 없이 다음 Phase로 계속 진행.
- 전체 완료 후 한 번에 보고.

---

## Phase 1: 전수 감사 (코드 → DB 의존성 매핑)

1. 코드베이스 전체에서 supabase 쿼리를 전부 찾아라:
   - `.from('...')` 호출 전부 (select/insert/update/delete)
   - 각 호출의 테이블명, 사용 컬럼, 필터 조건, 역할(어느 페이지/어느 역할이 호출하는지)을 표로 정리
2. 새 스키마(src/lib/db.types.ts)에 없는 구 컬럼명을 쓰는 쿼리를 전부 찾아서 수정:
   - 예: creators.user_id → profile_id, creators.grade(creator_channels로 이동), submissions.content_url → platform_urls 등
   - PROGRESS.md에 기록된 "런타임 캐비엇 — 문자열 쿼리의 구 컬럼명" 항목들 전부 해소
3. 구 스키마 기반으로 남아있는 페이지 식별:
   - src/app/creator/activity/page.tsx
   - src/app/creator/earnings/page.tsx
   - src/app/campaigns/[id]/page.tsx
   - src/app/admin/page.tsx (대시보드 메트릭)
   - src/app/admin/creators/page.tsx, admin/studios/page.tsx
   - src/app/studio/settings/page.tsx, creator/settings/page.tsx
   - 기타 발견되는 것 전부

## Phase 2: 빠진 핵심 기능 구현 + 구 페이지 정합

디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black (기존 rebuild 페이지들과 동일 톤)

### 2-1. 크리에이터 지원 현황 + 콘텐츠 제출 (최우선, 데모 루프의 빠진 고리)
src/app/creator/activity/page.tsx 전면 재작성:
- 내 applications 목록 (campaigns, missions 조인)
- 각 지원 건의 상태 표시: confirmed(제작 중) / completed / rejected
- confirmed 상태이고 아직 submission이 없는 건 → "콘텐츠 제출" 버튼
- 제출 모달/폼: 플랫폼 선택(해당 미션 content_type에 맞는 플랫폼만) + URL 입력, 멀티 플랫폼이면 여러 줄 추가 가능 (라이브: youtube/soop/chzzk, 숏폼: youtube/tiktok, 롱폼: youtube만)
- 제출 시 submissions insert: { application_id, mission_id, platform_urls: [{platform, url}], status: 'pending' }
- 이미 제출한 건은 검수 상태 표시: pending(검수 중) / approved(승인됨) / rejected(거절됨 + admin_note 표시)

### 2-2. 크리에이터 수익 현황
src/app/creator/earnings/page.tsx 전면 재작성:
- approved 상태 submissions 기반 "확정 수익" (mission.creator_amount 합산)
- pending submissions 기반 "검수 대기 수익"
- payments 테이블에 레코드 있으면 실 지급 내역 표시 (없으면 "정산 예정" 안내)
- 월 1회 정산 안내 문구: "매월 말 기준 익월 일괄 정산 (원천징수 3.3% 차감)"

### 2-3. 캠페인 상세 페이지
src/app/campaigns/[id]/page.tsx 새 스키마 정합:
- campaign + missions 표시
- 단가/예산 상세는 비노출 (게임사용 기획 원칙 유지)
- 로그인 안 한 사용자도 조회 가능하게 (public read)

### 2-4. Admin 대시보드
src/app/admin/page.tsx 새 스키마 기반으로 단순화:
- 메트릭 카드: 전체 캠페인 수 / 승인 대기 수 / 검수 대기 수 / 전체 크리에이터 수
- 승인 대기 캠페인 바로가기, 검수 대기 바로가기
- 구 mock 기반 컴포넌트(GmvChart, TierDonut 등) 사용 제거 (파일은 둬도 되지만 페이지에서 제거)

### 2-5. 나머지 구 스키마 페이지 최소 정합
admin/creators, admin/studios, settings 페이지들:
- 새 스키마 컬럼으로 동작하도록 수정 (creator_channels 조인해서 등급/구독자 실데이터 표시)
- 동작 안 하는 기능은 제거하거나 "준비 중" 처리. 빌드 깨지는 것만은 절대 금지.

### 2-6. 회원가입 흐름 최종 확인
- AuthForm이 profiles(트리거 생성) + studios/creators(폼에서 생성) 구조와 정확히 맞는지 확인
- 트리거가 profiles만 만들고, AuthForm이 role에 따라 studios 또는 creators를 1개만 insert하는지 검증
- creator 가입 시 creators insert가 AuthForm에 실제로 있는지 확인 (없으면 추가 — name은 가입폼의 이름 필드 사용)

## Phase 3: Supabase 정합 SQL 단일 파일 생성

supabase/migrations/20260611000001_demo_ready.sql 파일 생성.
Phase 1 감사 결과를 기반으로, 실제 코드가 날리는 쿼리에 정확히 맞는 정책을 작성하라. 추측 금지.

포함 내용:
1. handle_new_user 트리거 함수 (profiles만 insert, SECURITY DEFINER)
2. custom_access_token_hook 함수 + 권한:
   - GRANT EXECUTE ON FUNCTION ... TO supabase_auth_admin
   - GRANT USAGE ON SCHEMA public TO supabase_auth_admin
   - GRANT SELECT ON public.profiles TO supabase_auth_admin
3. 헬퍼 함수: get_my_role(), get_my_studio_id(), get_my_creator_id() (SECURITY DEFINER, 무한루프 방지를 위해 profiles 정책과 충돌하지 않도록 주의)
4. 전체 테이블 RLS ENABLE + 기존 정책 전부 DROP 후 재생성 (DROP POLICY IF EXISTS 사용)
5. 역할별 정책 — Phase 1에서 확인한 실제 쿼리 기준:
   - profiles: 본인 조회/수정, admin 전체
   - studios: 본인 + admin / 가입 시 insert
   - creators: 인증 사용자 조회(이름 표시용) / 본인 수정 / 가입 시 insert / admin 전체
   - creator_channels: 인증 사용자 조회 / 본인 insert/update/delete / admin 전체
   - campaigns: active 이상은 anon 포함 전체 조회(캠페인 상세 public) / 게임사 본인 것 전체 조회·insert·update / admin 전체
   - missions: 인증 사용자 조회 + anon 조회(캠페인 상세용) / 게임사 본인 캠페인에 insert / 크리에이터 지원 시 status update 가능해야 함(filled 처리) → 이 부분은 실제 코드(creator/page.tsx의 missions update)가 동작하도록 정책 작성
   - applications: 본인(creator) 조회·insert / 해당 캠페인 게임사 조회 / admin 전체
   - submissions: 본인(creator의 application 경유) 조회·insert / admin 전체 조회·update
   - payments, settlement_batches: 본인 조회 / admin 전체
6. GRANT: authenticated에 필요한 테이블 권한, anon에 campaigns/missions SELECT
7. 파일 맨 아래 주석으로: 관리자 계정 만드는 법
   -- UPDATE profiles SET role = 'admin' WHERE email = '관리자이메일';

## Phase 4: 데모 준비물 생성

### 4-1. DEMO_GUIDE.md (프로젝트 루트)
클라이언트 시연 대본:
1. 사전 준비 (계정 3개 만들기: 게임사/크리에이터/관리자, 관리자 승격 SQL 포함)
2. 시연 순서 단계별 스크립트 (어느 화면에서 뭘 보여주고 뭘 말하면 되는지)
3. 시연 중 보여줄 포인트 (3단계 wizard 간소화, 오픈마켓 지원, 플랫폼 검수, 등급별 자동 단가)

### 4-2. GAPS.md (프로젝트 루트)
시연 불가능하거나 미구현인 것 정직하게 정리:
- 미구현 기능 (PG 결제, 실 정산 배치 실행, YouTube API 연동, 이메일 알림, 잔여예산 게임사 프로필 보관 로직 등 발견되는 것 전부)
- 알려진 제약 (예상 참여 크리에이터 수 계산 로직 단순함 — 예산÷단가 기반 다인 참여 계산 미반영 등)
- 시연 시 피해야 할 동선

## Phase 5: 검증

1. npx tsc --noEmit → 0 errors 필수
2. npm run build → 성공 필수. 실패하면 고쳐서 성공할 때까지.
3. git add . && git commit -m "rebuild: demo-ready - full audit, missing features, consolidated SQL" && git push origin rebuild
4. 최종 보고: Phase별 결과 요약 + 민석이 해야 할 일 목록 (SQL 실행 1회 + 계정 생성)

PROGRESS.md 갱신 포함.
