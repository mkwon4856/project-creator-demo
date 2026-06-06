'use client';

import {
  Compass,
  Rocket,
  Sparkles,
  UserCircle,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button, Modal } from '@/components/ui';

export const WELCOME_SEEN_KEY = 'pc-welcome-seen';

export type WelcomeRole = 'studio' | 'creator';

export interface WelcomeModalProps {
  open: boolean;
  role: WelcomeRole;
  userName: string;
  onClose: () => void;
}

interface WelcomeStep {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const STUDIO_STEPS: ReadonlyArray<WelcomeStep> = [
  {
    Icon: Rocket,
    title: '캠페인 생성',
    desc: '예산과 미션을 설정하고 크리에이터를 모집하세요',
  },
  {
    Icon: Users,
    title: '지원자 검토',
    desc: '프로필을 확인하고 원하는 크리에이터를 선택하세요',
  },
  {
    Icon: Wallet,
    title: '정산 관리',
    desc: '콘텐츠 승인 후 자동으로 정산됩니다',
  },
];

const CREATOR_STEPS: ReadonlyArray<WelcomeStep> = [
  {
    Icon: UserCircle,
    title: '프로필 완성',
    desc: '채널을 연결하면 등급이 자동으로 계산돼요',
  },
  {
    Icon: Compass,
    title: '캠페인 탐색',
    desc: '내 등급에 맞는 단가를 확인하고 지원하세요',
  },
  {
    Icon: Sparkles,
    title: '수익 창출',
    desc: '콘텐츠가 승인되면 자동으로 정산됩니다',
  },
];

function StepCard({ Icon, title, desc }: WelcomeStep) {
  return (
    <div className="bg-bg-elevated border border-white/10 rounded-lg p-4 flex flex-col gap-2.5">
      <span className="inline-flex w-9 h-9 rounded-md bg-ube/15 text-ube-bright items-center justify-center">
        <Icon size={18} aria-hidden />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text-primary">{title}</span>
        <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

interface RoleCopy {
  title: string;
  subtitle: string;
  steps: ReadonlyArray<WelcomeStep>;
  primaryCta: { label: string; href: string };
  secondaryLabel: string;
}

function getRoleCopy(role: WelcomeRole, userName: string): RoleCopy {
  if (role === 'studio') {
    return {
      title: 'Project Creator에 오신 걸 환영해요! 🎮',
      subtitle: '크리에이터와 함께 캠페인을 시작해보세요.',
      steps: STUDIO_STEPS,
      primaryCta: { label: '첫 캠페인 만들기', href: '/studio/new' },
      secondaryLabel: '대시보드 둘러보기',
    };
  }
  const safeName = userName.trim() || '크리에이터';
  return {
    title: `반가워요, ${safeName}님! ✨`,
    subtitle: '프로필을 완성하고 캠페인에 지원해보세요.',
    steps: CREATOR_STEPS,
    primaryCta: { label: '프로필 완성하기', href: '/creator/profile' },
    secondaryLabel: '캠페인 먼저 보기',
  };
}

export function WelcomeModal({ open, role, userName, onClose }: WelcomeModalProps) {
  const router = useRouter();
  const copy = getRoleCopy(role, userName);

  const handlePrimary = () => {
    onClose();
    // Defer navigation slightly so the modal close animation doesn't fight the route change.
    setTimeout(() => router.push(copy.primaryCta.href), 80);
  };

  return (
    <Modal open={open} onClose={onClose} size="md" ariaLabel="환영합니다">
      <Modal.Hero>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            시작하기
          </span>
          <h2 className="text-xl font-medium text-text-primary leading-tight">
            {copy.title}
          </h2>
          <p className="text-sm text-text-secondary">{copy.subtitle}</p>
        </div>
      </Modal.Hero>

      <Modal.Body>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {copy.steps.map((step) => (
            <StepCard key={step.title} {...step} />
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="!flex-col !items-stretch !justify-stretch !gap-2">
        <Button variant="launch" size="lg" full onClick={handlePrimary}>
          {copy.primaryCta.label}
        </Button>
        <Button variant="ghost" size="md" full onClick={onClose}>
          {copy.secondaryLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
