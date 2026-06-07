'use client';

import { Check, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useState } from 'react';

import { Badge, Button, Card, IconButton, Textarea } from '@/components/ui';

import { BRIEF_TEMPLATES, GUIDELINES, type WizardData } from '../_types';

interface StepBriefProps {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

const MAX_BRIEF = 1000;

export function StepBrief({ data, onChange }: StepBriefProps) {
  const [draft, setDraft] = useState('');

  const insertTemplate = (body: string) => {
    const next = data.brief ? `${data.brief.trim()}\n\n${body}` : body;
    onChange({ brief: next.slice(0, MAX_BRIEF) });
  };

  const addHashtag = (raw: string) => {
    const cleaned = raw.trim().replace(/^#?/, '#');
    if (cleaned.length <= 1) return;
    if (data.hashtags.includes(cleaned)) return;
    onChange({ hashtags: [...data.hashtags, cleaned] });
  };

  const removeHashtag = (tag: string) => {
    onChange({ hashtags: data.hashtags.filter((t) => t !== tag) });
  };

  const handleHashtagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addHashtag(draft);
      setDraft('');
    }
  };

  const toggleGuideline = (id: keyof WizardData['guidelines']) => {
    onChange({
      guidelines: { ...data.guidelines, [id]: !data.guidelines[id] },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-medium text-text-primary leading-tight">
          크리에이터를 위한 브리프 작성
        </h2>
        <p className="text-sm text-text-secondary">
          콘셉트, 필수 요소, 톤을 전달하세요. 크리에이터는 이 내용을 캠페인 페이지에서 보게 됩니다.
        </p>
      </div>

      <Card variant="featured" padding="md" aria-label="빠른 시작 템플릿">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
          빠른 시작 — 탭하여 삽입
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BRIEF_TEMPLATES.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate(t.body)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </Card>

      <Textarea
        label="브리프 메시지 (모든 지원자에게 표시)"
        value={data.brief}
        onChange={(e) => onChange({ brief: e.target.value.slice(0, MAX_BRIEF) })}
        maxLength={MAX_BRIEF}
        placeholder="자유로운 톤으로 게임의 첫인상과 핵심 매력을 전달해 주세요…"
        rows={6}
        className="min-h-[140px]"
        helper={`마크다운을 지원합니다. · ${data.brief.length} / ${MAX_BRIEF}`}
      />

      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-secondary">필수 해시태그</span>
        <Card padding="sm" className="flex flex-wrap gap-1.5 min-h-[50px]">
          {data.hashtags.map((tag) => (
            <Badge key={tag} variant="primary" size="sm" className="gap-1">
              {tag}
              <IconButton
                size="sm"
                onClick={() => removeHashtag(tag)}
                aria-label={`${tag} 삭제`}
                className="h-3.5 w-3.5 rounded-full hover:bg-primary/20"
              >
                <X size={10} aria-hidden />
              </IconButton>
            </Badge>
          ))}
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleHashtagKey}
            onBlur={() => {
              if (draft.trim()) {
                addHashtag(draft);
                setDraft('');
              }
            }}
            placeholder="+ 해시태그 추가"
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted px-1.5 py-1"
            aria-label="해시태그 추가"
          />
        </Card>
        <span className="text-[11px] text-text-secondary">스페이스 또는 엔터로 추가하세요. #은 선택사항입니다.</span>
      </section>

      <section className="flex flex-col gap-2 pt-4 border-t border-border">
        <span className="text-xs font-medium text-text-secondary">콘텐츠 가이드라인</span>
        <ul className="flex flex-col gap-2">
          {GUIDELINES.map((g) => {
            const checked = data.guidelines[g.id];
            return (
              <li key={g.id}>
                <Card
                  padding="md"
                  hover
                  onClick={() => toggleGuideline(g.id)}
                  role="button"
                  aria-pressed={checked}
                  className="w-full text-left flex items-start gap-3"
                >
                  <span
                    aria-hidden
                    className={[
                      'mt-0.5 inline-flex w-[18px] h-[18px] rounded items-center justify-center shrink-0 transition-colors duration-150 ease-out',
                      checked ? 'bg-primary text-bg' : 'border border-border',
                    ].join(' ')}
                  >
                    {checked && <Check size={11} aria-hidden />}
                  </span>
                  <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary leading-tight">
                      {g.title}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {g.description(checked)}
                    </span>
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
