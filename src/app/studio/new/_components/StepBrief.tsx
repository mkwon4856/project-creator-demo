'use client';

import { Check, X } from 'lucide-react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';

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

      <section
        aria-label="빠른 시작 템플릿"
        className="rounded-lg p-3.5 border border-ube/30"
        style={{ background: 'var(--ube-tint)' }}
      >
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-ube-bright mb-2">
          빠른 시작 — 탭하여 삽입
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BRIEF_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => insertTemplate(t.body)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium leading-none bg-bg-card border border-white/10 text-text-primary hover:border-ube hover:text-ube-bright transition-colors duration-150 ease-out cursor-pointer"
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <label htmlFor="brief-textarea" className="text-xs font-medium text-text-secondary">
          브리프 메시지 (모든 지원자에게 표시)
        </label>
        <textarea
          id="brief-textarea"
          value={data.brief}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange({ brief: e.target.value.slice(0, MAX_BRIEF) })
          }
          maxLength={MAX_BRIEF}
          placeholder="자유로운 톤으로 게임의 첫인상과 핵심 매력을 전달해 주세요…"
          className="min-h-[140px] resize-y bg-bg-card border border-white/10 rounded-md p-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-ube focus:shadow-[0_0_0_3px_var(--ube-tint)] transition-all duration-150 ease-out"
        />
        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span>마크다운을 지원합니다.</span>
          <span className="tabular-nums">
            {data.brief.length} / {MAX_BRIEF}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-secondary">필수 해시태그</span>
        <div className="flex flex-wrap gap-1.5 min-h-[50px] p-2 rounded-md bg-bg-card border border-white/10 focus-within:border-ube focus-within:shadow-[0_0_0_3px_var(--ube-tint)] transition-all duration-150 ease-out">
          {data.hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-ube text-white px-2.5 py-1 rounded-full text-xs font-medium leading-none"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-white/20 transition-colors duration-150 ease-out cursor-pointer"
                aria-label={`${tag} 삭제`}
              >
                <X size={10} aria-hidden />
              </button>
            </span>
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
        </div>
        <span className="text-[11px] text-text-secondary">스페이스 또는 엔터로 추가하세요. #은 선택사항입니다.</span>
      </section>

      <section className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
        <span className="text-xs font-medium text-text-secondary">콘텐츠 가이드라인</span>
        <ul className="flex flex-col gap-2">
          {GUIDELINES.map((g) => {
            const checked = data.guidelines[g.id];
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => toggleGuideline(g.id)}
                  aria-pressed={checked}
                  className="w-full text-left flex items-start gap-3 p-3.5 rounded-md bg-bg-card border border-white/10 hover:border-ube/40 transition-colors duration-150 ease-out cursor-pointer"
                >
                  <span
                    aria-hidden
                    className={[
                      'mt-0.5 inline-flex w-[18px] h-[18px] rounded items-center justify-center shrink-0 transition-colors duration-150 ease-out',
                      checked ? 'bg-ube text-white' : 'border border-white/30',
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
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
