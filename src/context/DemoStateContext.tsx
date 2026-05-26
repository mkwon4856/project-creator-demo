'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  CAMPAIGNS as INITIAL_CAMPAIGNS,
  SUBMISSIONS as INITIAL_SUBMISSIONS,
  type Campaign,
  type Submission,
  type MissionType,
} from '@/lib/mockData';

type DemoStateContextValue = {
  campaigns: Campaign[];
  submissions: Submission[];
  toast: string | null;
  showToast: (message: string) => void;
  dismissToast: () => void;
  applyToMission: (input: {
    campaignId: string;
    creatorId: string;
    mission: MissionType;
    amount: number;
    title: string;
    thumbnail: string;
  }) => void;
  submitApplicationUrl: (submissionId: string, url: string) => void;
  approveSubmission: (submissionId: string) => void;
  hasMissionParticipation: (
    creatorId: string,
    campaignId: string,
    mission: MissionType
  ) => boolean;
};

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    structuredClone(INITIAL_CAMPAIGNS)
  );
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    structuredClone(INITIAL_SUBMISSIONS)
  );
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const hasMissionParticipation = useCallback(
    (creatorId: string, campaignId: string, mission: MissionType) =>
      submissions.some(
        s =>
          s.creatorId === creatorId &&
          s.campaignId === campaignId &&
          s.mission === mission
      ),
    [submissions]
  );

  const applyToMission = useCallback(
    (input: {
      campaignId: string;
      creatorId: string;
      mission: MissionType;
      amount: number;
      title: string;
      thumbnail: string;
    }) => {
      const exists = submissions.some(
        s =>
          s.creatorId === input.creatorId &&
          s.campaignId === input.campaignId &&
          s.mission === input.mission
      );
      if (exists) return;

      const entry: Submission = {
        id: `app-${Date.now()}`,
        campaignId: input.campaignId,
        creatorId: input.creatorId,
        mission: input.mission,
        status: 'producing',
        amount: input.amount,
        submittedAt: todayISO(),
        title: input.title,
        thumbnail: input.thumbnail,
      };

      setSubmissions(prev => [entry, ...prev]);
      setCampaigns(prev =>
        prev.map(c => {
          if (c.id !== input.campaignId) return c;
          const joined = c.joinedCreators.includes(input.creatorId)
            ? c.joinedCreators
            : [...c.joinedCreators, input.creatorId];
          return { ...c, joinedCreators: joined };
        })
      );
      showToast('지원 완료! 콘텐츠를 제작하고 URL을 제출해주세요.');
    },
    [showToast, submissions]
  );

  const submitApplicationUrl = useCallback(
    (submissionId: string, url: string) => {
      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId && s.status === 'producing'
            ? { ...s, status: 'pending', url, submittedAt: todayISO() }
            : s
        )
      );
      showToast('제출 완료! 관리자 검수를 기다려주세요.');
    },
    [showToast]
  );

  const approveSubmission = useCallback(
    (submissionId: string) => {
      setSubmissions(prev => {
        const target = prev.find(s => s.id === submissionId);
        if (!target || target.status !== 'pending') return prev;

        setCampaigns(camps =>
          camps.map(c =>
            c.id === target.campaignId
              ? { ...c, spentBudget: Math.min(c.totalBudget, c.spentBudget + target.amount) }
              : c
          )
        );

        return prev.map(s =>
          s.id === submissionId ? { ...s, status: 'paid' } : s
        );
      });
      showToast('승인 완료. 지급 처리되었습니다.');
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      campaigns,
      submissions,
      toast,
      showToast,
      dismissToast,
      applyToMission,
      submitApplicationUrl,
      approveSubmission,
      hasMissionParticipation,
    }),
    [
      campaigns,
      submissions,
      toast,
      showToast,
      dismissToast,
      applyToMission,
      submitApplicationUrl,
      approveSubmission,
      hasMissionParticipation,
    ]
  );

  return (
    <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error('useDemoState must be used within DemoStateProvider');
  return ctx;
}

export function useCampaign(id: string) {
  const { campaigns } = useDemoState();
  return campaigns.find(c => c.id === id);
}

export function useCreatorSubmissions(creatorId: string) {
  const { submissions } = useDemoState();
  return submissions.filter(s => s.creatorId === creatorId);
}

export function useCampaignSubmissions(campaignId: string) {
  const { submissions } = useDemoState();
  return submissions.filter(s => s.campaignId === campaignId);
}

export function usePendingReviewSubmissions() {
  const { submissions } = useDemoState();
  return submissions.filter(s => s.status === 'pending');
}
