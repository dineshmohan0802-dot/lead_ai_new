import { NormalizedSignal, RawEvent } from '../../../types';

/**
 * Normalizes Twitter raw events into the common NormalizedSignal schema.
 */
export function normalizeTwitterEvent(
  rawEvent: RawEvent,
  keywords: string[],
  competitors: string[]
): NormalizedSignal {
  const payload = rawEvent.raw_payload;
  const text = payload.text || '';
  const textLower = text.toLowerCase();

  return {
    source: 'twitter',
    external_id: rawEvent.external_id,
    author_name: payload.author_name,
    author_handle: payload.author_username ? `@${payload.author_username}` : undefined,
    author_profile_url: payload.author_username
      ? `https://twitter.com/${payload.author_username}`
      : undefined,
    company_name: null,
    title: null,
    text,
    url: payload.author_username && payload.id
      ? `https://twitter.com/${payload.author_username}/status/${payload.id}`
      : undefined,
    signal_type: 'post',
    matched_keywords: keywords.filter((kw) => textLower.includes(kw.toLowerCase())),
    matched_competitors: competitors.filter((comp) => textLower.includes(comp.toLowerCase())),
    created_at_source: payload.created_at || new Date().toISOString(),
    metadata: {
      retweet_count: payload.retweet_count,
      like_count: payload.like_count,
      reply_count: payload.reply_count,
    },
  };
}
