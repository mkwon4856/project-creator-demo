# GAPS — 미구현 / 알려진 제약 (정직한 정리)

데모는 **핵심 루프**(게임사 가입 → 캠페인 생성 → 승인 → 크리에이터 가입 → 채널 등록 →
지원 → 제출 → 검수 → 수익 확인)를 처음부터 끝까지 실제 DB로 시연 가능한 상태다.
아래는 시연되지 않거나 미구현인 항목과, 시연 시 피해야 할 동선이다.

---

## 1. 미구현 기능 (런타임 로직 없음)

| 항목 | 현재 상태 | 비고 |
|------|-----------|------|
| **PG 결제 / 충전** | 없음 | `studios.balance`는 컬럼만 존재. 실제 충전·결제 게이트웨이 미연동. |
| **실 정산 배치 실행** | 없음 | `settlement_batches` / `payments` 테이블·RLS·UI(수익 표시)는 있으나, **검수 승인 → payment 레코드 생성** 자동화 로직이 없다. 수익 페이지는 payment가 없으면 "정산 예정"을 보여준다. |
| **검수 승인 → 수익 확정 연결** | 부분 | 크리에이터 "확정 수익"은 `approved` submission의 미션 단가 합으로 **표시**되지만, 실제 지급(payment insert)은 수동/미구현. |
| **YouTube/SOOP API 연동** | 없음 | 구독자 수는 **수동 입력**. 입력값으로 등급만 자동 산정(`subscribersToGrade`). 채널 소유권 검증(`verified_at`)도 미구현. |
| **이메일/푸시 알림** | 없음 | 승인·검수·정산 알림 미발송. (`resend` 패키지는 설치되어 있으나 미사용) |
| **잔여 예산 자동 소진/보관 로직** | 부분 | 위저드의 `auto_spend_remaining` 플래그와 자동 미션 배분은 **생성 시점 계산**만 존재. 캠페인 진행 중 지원이 들어와도 `campaigns.remaining_budget`을 **차감하지 않으며**, 잔여 예산을 게임사 프로필로 환원/보관하는 런타임 로직도 없다. |
| **캠페인 상태 진행(active→completed)** | 수동 | `in_progress`/`reviewing`/`completed` 전이를 자동화하는 로직 없음. |

---

## 2. 알려진 제약 (동작하지만 단순/제한적)

- **예상 참여 크리에이터 수 계산이 단순함** — 위저드는 미션당 "약 1명" 기준으로 보여준다.
  예산 ÷ 단가에 기반한 **다인 참여(한 미션에 여러 명)** 계산은 반영되어 있지 않다.
- **중복 지원 방지 단위** — `(creator_id, campaign_id, content_type)` 유니크. 같은 캠페인의
  같은 콘텐츠 타입에는 1회만 지원 가능(의도된 제약).
- **캠페인 상세 공개 범위** — `/campaigns/[id]`는 `active` 이상 상태만 anon 공개(RLS).
  `draft`/`pending` 캠페인 상세는 비로그인 시 "찾을 수 없음"으로 표시된다.
- **custom_access_token_hook 수동 설정** — 역할 클레임을 JWT에 넣으려면 Supabase 대시보드에서
  훅을 직접 지정해야 한다(미설정이어도 RLS는 `profiles.role` 직접 조회로 동작).

---

## 3. 구 스키마 잔존 코드 (데모 동선 밖 — 빌드는 정상)

아래 파일들은 **구 스키마 컬럼**(예: `creators.user_id`, `submissions.content_url`,
`missions.rate_*`, `campaigns.name/developer`)을 문자열 쿼리로 사용한다. 타입 체크와 빌드는
통과하지만, 실제로 열면 런타임에서 동작하지 않는다. **모두 현재 시연 동선에 포함되지 않는다.**

- 게임사 사이드바에서 제거된 페이지(직접 URL 접근 금지):
  `src/app/studio/review`, `src/app/studio/payments`, `src/app/studio/creators`,
  `src/app/studio/applicants`
- 구 API/어댑터(현재 데모 페이지에서 미사용):
  `src/lib/api/submissions.ts`(구 `getDisplayActivities`/`applyCampaign`/`submitUrl`),
  `src/lib/api/campaigns.ts`(구 `getCampaigns` 등, `live`/`recruiting` 상태 가정),
  `src/lib/api/transformDbCampaign.ts`(레거시 어댑터), `src/lib/seed.ts`
- 구 컴포넌트(현재 페이지에서 미사용):
  `src/components/campaign/CampaignDetailContent.tsx`, `ApplyButton.tsx`,
  `src/app/admin/_components/ActivityFeed.tsx`, `src/app/admin/AdminOverviewClient.tsx`
- 웹훅: `src/app/api/webhooks/db/route.ts` (`studios.user_id` 등 구 컬럼)
- 랜딩/사이트맵: `campaigns.server.ts`의 `fetchLiveCampaigns`/`fetchLiveCampaignRoutes`는
  구 상태값 `'live'`로 조회 → **결과 0건**(에러 아님). 랜딩 페이지의 "라이브 캠페인" 섹션은
  비어 보일 수 있다.

> 정리 방향(차기 작업): 위 파일들을 새 스키마로 재작성하거나 제거. 데모에는 영향 없음.

---

## 4. 시연 시 피해야 할 동선
1. **게임사** 화면에서 사이드바에 없는 URL(`/studio/review`, `/studio/payments` 등)로 직접 이동하지 말 것.
2. **랜딩 페이지의 캠페인 목록**(구 스키마, `live` 상태)에 의존하지 말 것 — 비어 보일 수 있음.
   캠페인은 게임사 대시보드 / 크리에이터 탐색 / `/campaigns/[id]` 상세로 보여줄 것.
3. **수익 "지급 내역"**을 강조하지 말 것 — payment 자동 생성이 없어 "정산 예정"으로 표시됨.
   대신 **확정 수익 / 검수 대기 수익** 분리를 강조할 것.
4. 구독자 수 입력 시 **실시간 API 연동인 것처럼 설명하지 말 것** — 수동 입력 기반 등급 산정.
