import type { Metadata } from 'next';

import { Bullets, LegalIntro, LegalTitle, Section } from '../_components/Section';
import { SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: `${SITE_NAME} 개인정보처리방침`,
};

export default function PrivacyPage() {
  return (
    <>
      <LegalTitle
        title="개인정보처리방침 (Privacy Policy)"
        subtitle="최종 수정일: 2026년 5월"
      />

      <LegalIntro>
        {SITE_NAME}(이하 “회사”)는 정보주체의 자유와 권리를 보호하기 위해
        「개인정보 보호법」을 비롯한 관련 법령을 준수하며, 다음과 같이 개인정보를
        처리하고 있습니다.
      </LegalIntro>

      <Section number={1} title="수집하는 개인정보">
        <p>회사는 서비스 제공을 위해 다음과 같은 항목을 수집합니다.</p>
        <Bullets
          items={[
            <>
              <strong className="text-text-primary">공통</strong>: 이메일, 이름(또는
              활동명), 비밀번호(일방향 해시 저장), 서비스 이용 기록, 접속 IP·기기 정보
            </>,
            <>
              <strong className="text-text-primary">크리에이터</strong>: 채널 URL, 구독자
              수, 평균 조회수, 활동 플랫폼(YouTube/SOOP/Chzzk)
            </>,
            <>
              <strong className="text-text-primary">게임사</strong>: 회사명, 사업자 정보,
              대표 연락처, 캠페인 운영 담당자 정보
            </>,
            <>
              <strong className="text-text-primary">정산 시(추후 수집)</strong>: 정산 계좌
              정보, 주민등록번호 또는 사업자등록번호(세금 신고 목적)
            </>,
          ]}
        />
      </Section>

      <Section number={2} title="개인정보 이용 목적">
        <p>수집된 개인정보는 다음 목적으로만 이용됩니다.</p>
        <Bullets
          items={[
            '회원 식별, 본인 확인, 부정 이용 방지',
            '캠페인 매칭, 콘텐츠 검수, 정산 집행',
            '서비스 개선과 통계 분석(개인 식별 정보는 분리·익명화)',
            '법령상 의무 이행 및 분쟁 처리',
          ]}
        />
      </Section>

      <Section number={3} title="개인정보 보유 기간">
        <p>
          회원 탈퇴 시 개인정보는 지체 없이 파기됩니다. 다만 관련 법령에 따라 일정 기간
          보관이 필요한 경우 다음과 같이 보관 후 파기합니다.
        </p>
        <Bullets
          items={[
            '계약·결제·정산 관련 기록: 5년 (「전자상거래 등에서의 소비자보호에 관한 법률」)',
            '소비자 불만 또는 분쟁 처리 기록: 3년',
            '로그인 기록 및 접속 로그: 3개월 (「통신비밀보호법」)',
          ]}
        />
      </Section>

      <Section number={4} title="개인정보 제3자 제공">
        <p>
          회사는 원칙적으로 개인정보를 외부에 제공하지 않습니다. 다음의 경우에 한해
          예외적으로 제공됩니다.
        </p>
        <Bullets
          items={[
            <>
              크리에이터가 캠페인에 지원하여 매칭이 이루어진 경우, 해당 게임사에 크리에이터의
              프로필 정보(활동명, 구독자 수, 채널 URL, 평균 조회수)가 제공됩니다.
            </>,
            <>
              관련 법령에 따라 수사기관이 적법한 절차로 요청하는 경우.
            </>,
          ]}
        />
      </Section>

      <Section number={5} title="개인정보 보호 조치">
        <p>회사는 개인정보의 안전한 처리를 위해 다음과 같은 조치를 시행하고 있습니다.</p>
        <Bullets
          items={[
            '전송 구간 암호화: 모든 통신은 HTTPS(TLS 1.2 이상)로 보호됩니다.',
            '저장 시 암호화: 비밀번호는 일방향 해시 알고리즘(bcrypt 등)으로 저장합니다.',
            '접근 권한 관리: 개인정보 처리자는 최소한으로 지정되며, 권한 변경 및 회수 이력은 별도로 관리됩니다.',
            '주기적인 보안 점검 및 직원 대상 개인정보 보호 교육 실시.',
          ]}
        />
      </Section>

      <Section number={6} title="이용자의 권리">
        <p>
          이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할
          수 있습니다. 또한 마케팅 정보 수신을 거부할 수 있으며, 거부 후에도 일반적인
          서비스 이용에는 영향이 없습니다. 권리 행사는 마이페이지 또는 아래의 책임자에게
          이메일로 요청할 수 있습니다.
        </p>
      </Section>

      <Section number={7} title="개인정보 보호 책임자">
        <p>
          회사는 개인정보 처리에 관한 업무를 총괄하여 처리하고, 정보주체의 불만 처리와
          피해 구제 등을 위하여 다음과 같이 개인정보 보호 책임자를 지정하고 있습니다.
        </p>
        <Bullets
          items={[
            '담당 부서: 개인정보보호팀',
            '이메일: privacy@projectcreator.example',
            '응대 시간: 평일 10:00 ~ 18:00 (한국 시간 기준)',
          ]}
        />
      </Section>

      <Section number={8} title="방침 변경">
        <p>
          본 처리방침의 내용이 변경되는 경우, 시행 7일 전 서비스 화면 및 공지사항을 통해
          안내합니다. 이용자의 권리에 중요한 영향을 미치는 변경 사항이 있는 경우에는 시행
          30일 전부터 사전 고지합니다.
        </p>
      </Section>
    </>
  );
}
