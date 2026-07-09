import { NormalizedSignal, RawEvent } from '../../../types';

/**
 * Normalizes Reddit raw events into the common NormalizedSignal schema.
 */
export function normalizeRedditEvent(
  rawEvent: RawEvent,
  keywords: string[],
  competitors: string[]
): NormalizedSignal {
  const payload = rawEvent.raw_payload;
  const text = [payload.title, payload.selftext].filter(Boolean).join('\n\n');
  const textLower = text.toLowerCase();

  return {
    source: 'reddit',
    external_id: rawEvent.external_id,
    author_name: payload.author !== '[deleted]' ? payload.author : undefined,
    author_handle: payload.author !== '[deleted]' ? `u/${payload.author}` : undefined,
    author_profile_url: payload.author !== '[deleted]'
      ? `https://reddit.com/user/${payload.author}`
      : undefined,
    company_name: null,
    title: payload.title || null,
    text,
    url: payload.permalink
      ? `https://reddit.com${payload.permalink}`
      : undefined,
    signal_type: payload.is_self ? 'post' : 'post',
    matched_keywords: keywords.filter((kw) =>
      textLower.includes(kw.toLowerCase())
    ),
    matched_competitors: competitors.filter((comp) =>
      textLower.includes(comp.toLowerCase())
    ),
    created_at_source: payload.created_utc
      ? new Date(payload.created_utc * 1000).toISOString()
      : new Date().toISOString(),
    metadata: {
      subreddit: payload.subreddit,
      score: payload.score,
      num_comments: payload.num_comments,
      flair: payload.link_flair_text,
    },
  };
}
