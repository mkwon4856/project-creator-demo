/** True when the DB seed button and seedCampaigns() are allowed to run. */
export function isSeedEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_ENABLE_SEED === 'true'
  );
}

/** True when the demo banner should be shown. */
export function isDemoBannerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DEMO_BANNER === 'true';
}
