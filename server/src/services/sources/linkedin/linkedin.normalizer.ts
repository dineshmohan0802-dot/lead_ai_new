import { NormalizedSignal, RawEvent } from '../../../types';

/**
 * Normalizes LinkedIn raw events into the common NormalizedSignal schema.
 */
export function normalizeLinkedInEvent(
  rawEvent: RawEvent,
  keywords: string[],
  competitors: string[]
): NormalizedSignal {
  const payload = rawEvent.raw_payload;
  const text = payload.text || '';
  const textLower = text.toLowerCase();

  return {
    source: 'linkedin',
    external_id: rawEvent.external_id,
    author_name: payload.author_name,
    author_handle: payload.author_name,
    author_profile_url: undefined, // LinkedIn URLs require real scraping
    company_name: payload.author_company || null,
    title: null,
    text,
    url: undefined,
    signal_type: 'post',
    matched_keywords: keywords.filter((kw) => textLower.includes(kw.toLowerCase())),
    matched_competitors: competitors.filter((comp) => textLower.includes(comp.toLowerCase())),
    created_at_source: payload.created_at || new Date().toISOString(),
    metadata: {
      headline: payload.author_headline,
      reaction_count: payload.reaction_count,
      comment_count: payload.comment_count,
      share_count: payload.share_count,
    },
  };
}
