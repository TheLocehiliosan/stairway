import { SELF_HOSTED_PROXY } from '../config.js';
import { scoreboardUrl } from '../player.js';

const PUBLIC_CORS_PROXIES = [
  {
    name: 'allorigins',
    buildUrl: (target) =>
      `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`,
    parseResponse: async (response) => {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const payload = await response.json();
        if (!payload?.contents) {
          throw new Error('Proxy returned empty contents');
        }
        return payload.contents;
      }
      const text = await response.text();
      if (text.startsWith('{')) {
        const payload = JSON.parse(text);
        if (!payload?.contents) throw new Error('Proxy returned empty contents');
        return payload.contents;
      }
      throw new Error('Proxy returned an unexpected response');
    },
  },
  {
    name: 'corsproxy.io',
    buildUrl: (target) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
    parseResponse: (response) => response.text(),
  },
];

function devProxyUrl(username) {
  const letter = username.charAt(0);
  return `/scoreboard/players/${letter}/${username}.nh.html`;
}

function selfHostedProxyUrl(username) {
  const letter = username.charAt(0);
  return `${SELF_HOSTED_PROXY}/players/${letter}/${encodeURIComponent(username)}.nh.html`;
}

function validatePlayerHtml(html, username) {
  if (!html.includes('Overall Stats')) {
    throw new Error('Response does not look like a player page');
  }
  if (!html.includes(username)) {
    throw new Error(`Player "${username}" was not found`);
  }
  return html;
}

export async function fetchPlayerPage(username) {
  const targetUrl = scoreboardUrl(username);
  const attempts = [];

  if (import.meta.env.DEV) {
    attempts.push({
      name: 'vite-dev-proxy',
      url: devProxyUrl(username),
      parseResponse: (response) => response.text(),
    });
  }

  if (SELF_HOSTED_PROXY) {
    attempts.push({
      name: 'stairway-proxy',
      url: selfHostedProxyUrl(username),
      parseResponse: (response) => response.text(),
    });
  }

  if (!import.meta.env.DEV) {
    for (const proxy of PUBLIC_CORS_PROXIES) {
      attempts.push({
        name: proxy.name,
        url: proxy.buildUrl(targetUrl),
        parseResponse: proxy.parseResponse,
      });
    }
  }

  attempts.push({
    name: 'direct',
    url: targetUrl,
    parseResponse: (response) => response.text(),
  });

  const errors = [];

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await attempt.parseResponse(response);
      validatePlayerHtml(html, username);

      return { html, source: attempt.name };
    } catch (error) {
      errors.push(`${attempt.name}: ${error.message}`);
    }
  }

  throw new Error(`Could not load scoreboard data. ${errors.join(' | ')}`);
}
