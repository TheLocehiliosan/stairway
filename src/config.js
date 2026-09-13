// Self-hosted scoreboard proxy (production).
// Override at build time with VITE_PROXY_URL if needed.
export const SELF_HOSTED_PROXY =
  import.meta.env.VITE_PROXY_URL ?? 'https://stairway-proxy.locehilios.com:8999';

export const SITE_URL =
  import.meta.env.VITE_SITE_URL ?? 'https://stairway.locehilios.com';
