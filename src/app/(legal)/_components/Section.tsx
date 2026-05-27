import type { ReactNode } from 'react';

export function LegalTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mt-8 mb-4">
      <h1 className="text-2xl font-medium tracking-tight text-text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs text-text-secondary mt-2">{subtitle}</p>
      )}
    </header>
  );
}

export function LegalIntro({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-text-secondary leading-relaxed pt-2 pb-4">
      {children}
    </p>
  );
}

export function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-white/[0.06] py-6 last:border-b-0">
      <h2 className="text-lg font-medium text-text-primary mb-3">
        <span className="text-text-muted tabular-nums mr-2">
          {number.toString().padStart(2, '0')}.
        </span>
        {title}
      </h2>
      <div className="text-sm text-text-secondary leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: ReadonlyArray<ReactNode> }) {
  return (
    <ul className="flex flex-col gap-1.5 list-disc pl-5 marker:text-text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
