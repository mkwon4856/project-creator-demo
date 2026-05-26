'use client';

import { Check, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CAMPAIGNS, type Campaign } from '@/lib/mockCampaigns';

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
      <span className="text-[44px] leading-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
        {campaign.thumbnail.emoji}
      </span>
      {selected && (
        <span className="absolute top-2 right-2 inline-flex w-6 h-6 rounded-full bg-ube items-center justify-center text-white">
          <Check size={14} aria-hidden />
        </span>
      )}
    </div>
  );
}

export function StepGame({ selected, onSelect }: StepGameProps) {
  const [query, setQuery] = useState('');
  const selectedKey = selected?.sourceId;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CAMPAIGNS;
    return CAMPAIGNS.filter((c) =>
      `${c.name} ${c.developer} ${c.genre}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-medium text-text-primary leading-tight">Choose a game</h2>
        <p className="text-sm text-text-secondary">
          Select a game from your registered library or add a new one.
        </p>
      </div>

      <label className="flex items-center gap-2 px-3 py-2 rounded-md w-full max-w-md bg-bg-card border border-white/10 focus-within:border-ube focus-within:shadow-[0_0_0_3px_var(--ube-tint)] transition-all duration-150 ease-out">
        <Search size={14} aria-hidden className="text-text-muted shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games…"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted"
          aria-label="Search games"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isSelected = c.id === selectedKey;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(campaignToSelectedGame(c))}
              className={[
                'text-left rounded-lg overflow-hidden border bg-bg-card transition-all duration-150 ease-out',
                isSelected
                  ? 'border-ube shadow-[0_0_0_2px_var(--ube-tint)]'
                  : 'border-white/[0.06] hover:border-white/20',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <GameThumb campaign={c} selected={isSelected} />
              <div className="p-3 flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary truncate">{c.name}</span>
                <span className="text-xs text-text-secondary truncate">
                  {c.developer} · {c.genre}
                </span>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          className="rounded-lg border border-dashed border-white/15 bg-transparent p-4 flex flex-col items-center justify-center gap-2 text-text-secondary hover:border-ube hover:text-ube-bright transition-colors duration-150 ease-out cursor-pointer min-h-[180px]"
          onClick={() => {
            if (typeof window !== 'undefined') window.alert('Game registration is coming soon.');
          }}
        >
          <span className="inline-flex w-8 h-8 rounded-full bg-bg-hover items-center justify-center">
            <Plus size={16} aria-hidden />
          </span>
          <span className="text-sm">Add new game</span>
        </button>
      </div>
    </div>
  );
}
