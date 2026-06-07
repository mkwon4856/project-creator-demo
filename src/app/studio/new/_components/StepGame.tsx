'use client';

import { Check, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Card, Input, SelectableCard } from '@/components/ui';
import { fetchCampaigns, transformDbCampaign } from '@/lib/api/campaigns';
import type { Campaign } from '@/lib/campaigns/types';

import type { SelectedGame } from '../_types';

interface StepGameProps {
  selected?: SelectedGame;
  onSelect: (game: SelectedGame) => void;
}

function campaignToSelectedGame(c: Campaign): SelectedGame {
  return {
    sourceId: c.id,
    name: c.name,
    developer: c.developer,
    genre: c.genre,
    thumbnail: c.thumbnail,
    platform: c.platform,
  };
}

function GameThumb({ campaign, selected }: { campaign: Campaign; selected: boolean }) {
  return (
    <div
      className="relative aspect-[16/10] flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${campaign.thumbnail.from}, ${campaign.thumbnail.to})`,
      }}
    >
      {campaign.thumbnail.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.thumbnail.imageUrl}
          alt={campaign.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-[44px] leading-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
          {campaign.thumbnail.emoji}
        </span>
      )}
      {selected && (
        <span className="absolute top-2 right-2 inline-flex w-6 h-6 rounded-full bg-primary items-center justify-center text-bg">
          <Check size={14} aria-hidden />
        </span>
      )}
    </div>
  );
}

export function StepGame({ selected, onSelect }: StepGameProps) {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedKey = selected?.sourceId;

  useEffect(() => {
    let cancelled = false;
    void fetchCampaigns().then((rows) => {
      if (cancelled) return;
      setGames(rows.map(transformDbCampaign));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((c) =>
      `${c.name} ${c.developer} ${c.genre}`.toLowerCase().includes(q),
    );
  }, [games, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-medium text-text-primary leading-tight">게임 선택</h2>
        <p className="text-sm text-text-secondary">
          등록된 라이브러리에서 게임을 선택하거나 새 게임을 추가하세요.
        </p>
      </div>

      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="게임 검색…"
        aria-label="게임 검색"
        icon={<Search size={14} aria-hidden />}
        containerClassName="max-w-md"
      />

      {loading ? (
        <p className="text-sm text-text-secondary py-8 text-center">불러오는 중…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            padding="md"
            hover
            onClick={() => {
              if (typeof window !== 'undefined') window.alert('게임 등록 기능은 곧 추가됩니다.');
            }}
            className="border-dashed flex flex-col items-center justify-center gap-2 text-text-secondary min-h-[180px]"
          >
            <span className="inline-flex w-8 h-8 rounded-full bg-surface-hover items-center justify-center">
              <Plus size={16} aria-hidden />
            </span>
            <span className="text-sm">새 게임 추가</span>
          </Card>

          {filtered.map((c) => {
            const isSelected = c.id === selectedKey;
            return (
              <SelectableCard
                key={c.id}
                padding="none"
                selected={isSelected}
                onClick={() => onSelect(campaignToSelectedGame(c))}
                className="text-left overflow-hidden"
                aria-pressed={isSelected}
              >
                <GameThumb campaign={c} selected={isSelected} />
                <div className="p-3 flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text-primary truncate">{c.name}</span>
                  <span className="text-xs text-text-secondary truncate">
                    {c.developer} · {c.genre}
                  </span>
                </div>
              </SelectableCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
