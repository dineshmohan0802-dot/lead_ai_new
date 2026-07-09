import { NormalizedSignal, RawEvent, SourceName } from '../../types';
import { normalizeRedditEvent } from '../sources/reddit/reddit.normalizer';
import { normalizeTwitterEvent } from '../sources/twitter/twitter.normalizer';
import { normalizeLinkedInEvent } from '../sources/linkedin/linkedin.normalizer';

/**
 * Normalize Service — maps raw events from any source to the unified NormalizedSignal schema.
 */

const normalizers: Record<
  SourceName,
  (raw: RawEvent, keywords: string[], competitors: string[]) => NormalizedSignal
> = {
  reddit: normalizeRedditEvent,
  twitter: normalizeTwitterEvent,
  linkedin: normalizeLinkedInEvent,
};

export function normalizeRawEvent(
  rawEvent: RawEvent,
  keywords: string[],
  competitors: string[]
): NormalizedSignal {
  const normalizer = normalizers[rawEvent.source_name];
  if (!normalizer) {
    throw new Error(`No normalizer found for source: ${rawEvent.source_name}`);
  }
  return normalizer(rawEvent, keywords, competitors);
}

export function normalizeRawEvents(
  rawEvents: RawEvent[],
  keywords: string[],
  competitors: string[]
): NormalizedSignal[] {
  return rawEvents.map((event) => normalizeRawEvent(event, keywords, competitors));
}
