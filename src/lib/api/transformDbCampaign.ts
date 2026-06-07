import type { CampaignThumbnailJson, Database } from '@/lib/db.types';
import {
  type Campaign,
  type CampaignPlatform,
  type CampaignStatus,
} from '@/lib/campaigns/types';

type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
type MissionRow = Database['public']['Tables']['missions']['Row'];

export type CampaignWithMissions = CampaignRow & { missions: MissionRow[] };

const FALLBACK_THUMBNAIL = { from: '#1a0a3e', to: '#4a1a6e', emoji: '🎮' };
const VALID_PLATFORMS = ['mobile', 'pc', 'console'] as const;

function asThumbnail(value: unknown): Campaign['thumbnail'] {
  const t = (value ?? {}) as CampaignThumbnailJson;
  return {
    from: t.from ?? FALLBACK_THUMBNAIL.from,
    to: t.to ?? FALLBACK_THUMBNAIL.to,
    emoji: t.emoji ?? FALLBACK_THUMBNAIL.emoji,
    imageUrl: t.imageUrl,
    type: t.type,
  };
}

function asPlatforms(arr: string[] | null | undefined): CampaignPlatform[] {
  if (!arr || arr.length === 0) return ['mobile'];
  const filtered = arr.filter((p): p is CampaignPlatform =>
    (VALID_PLATFORMS as readonly string[]).includes(p),
  );
  return filtered.length > 0 ? filtered : ['mobile'];
}

function dbStatusToMock(s: CampaignRow['status']): CampaignStatus {
  return s === 'draft' ? 'recruiting' : s;
}

export function transformDbCampaign(db: CampaignWithMissions): Campaign {
  const shortform = db.missions.find((m) => m.type === 'shortform');
  const rates = shortform
    ? {
        A: shortform.rate_a,
        B: shortform.rate_b,
        C: shortform.rate_c,
        D: shortform.rate_d,
        E: shortform.rate_e,
      }
    : { A: 0, B: 0, C: 0, D: 0, E: 0 };

  return {
    id: db.id,
    name: db.name,
    developer: db.developer,
    genre: db.genre,
    status: dbStatusToMock(db.status),
    isNew: db.status === 'recruiting',
    thumbnail: asThumbnail(db.thumbnail),
    totalBudget: db.total_budget,
    spentBudget: db.spent_budget,
    target: db.target_creators,
    joined: 0,
    rates,
    missions: {
      shortform: db.missions.some((m) => m.type === 'shortform' && m.enabled),
      longform: db.missions.some((m) => m.type === 'longform' && m.enabled),
      live: db.missions.some((m) => m.type === 'live' && m.enabled),
    },
    platform: asPlatforms(db.platform),
  };
}
