import { SourceAdapter } from '../source.interface';
import { RawEvent, SourceConfig } from '../../../types';

/**
 * Reddit source adapter — uses Reddit's public JSON API.
 * No authentication required for read-only access to public subreddits.
 * 
 * Endpoints used:
 * - https://www.reddit.com/search.json?q={keyword}&sort=new
 * - https://www.reddit.com/r/{subreddit}/search.json?q={keyword}&restrict_sr=1
 * 
 * Rate limit: ~10 requests/minute without auth (sufficient for MVP)
 * 
 * TODO Phase 2: Upgrade to OAuth-based Reddit API for higher rate limits
 */
export class RedditAdapter implements SourceAdapter {
  readonly sourceName = 'reddit' as const;

  private readonly USER_AGENT = 'LeadPulse/0.1.0 (B2B Lead Intelligence)';
  private readonly BASE_URL = 'https://www.reddit.com';
  private readonly DEFAULT_SUBREDDITS = [
    'SaaS', 'startups', 'Entrepreneur', 'smallbusiness',
    'sales', 'marketing', 'B2BMarketing', 'growthmarketing',
  ];

  isAvailable(): boolean {
    return true; // Public JSON API always available
  }

  async fetchSignals(config: SourceConfig): Promise<RawEvent[]> {
    const allEvents: RawEvent[] = [];
    const maxResults = config.max_results || 25;
    const subreddits = config.subreddits?.length
      ? config.subreddits
      : this.DEFAULT_SUBREDDITS;

    for (const keyword of config.keywords) {
      try {
        // Search across Reddit globally
        const globalResults = await this.searchReddit(keyword, undefined, maxResults);
        allEvents.push(...globalResults);

        // Also search specific subreddits
        for (const subreddit of subreddits.slice(0, 3)) {
          // Limit to avoid rate limits
          const subResults = await this.searchReddit(keyword, subreddit, Math.floor(maxResults / 2));
          allEvents.push(...subResults);

          // Small delay to respect rate limits
          await this.delay(1200);
        }
      } catch (error) {
        console.error(`❌ Reddit fetch failed for keyword "${keyword}":`, error);
      }
    }

    // Dedupe by external_id
    const seen = new Set<string>();
    return allEvents.filter((event) => {
      if (seen.has(event.external_id)) return false;
      seen.add(event.external_id);
      return true;
    });
  }

  private async searchReddit(
    query: string,
    subreddit?: string,
    limit: number = 25
  ): Promise<RawEvent[]> {
    const url = subreddit
      ? `${this.BASE_URL}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=${limit}&t=week`
      : `${this.BASE_URL}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&t=week`;

    console.log(`🔍 Reddit: searching "${query}" ${subreddit ? `in r/${subreddit}` : 'globally'}`);

    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('⚠️  Reddit rate limited, waiting...');
        await this.delay(5000);
        return [];
      }
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: any = await response.json();
    const posts = data?.data?.children || [];

    return posts.map((post: any) => this.mapToRawEvent(post.data));
  }

  private mapToRawEvent(post: any): RawEvent {
    return {
      workspace_id: '', // Will be set by the pipeline
      source_name: 'reddit',
      external_id: post.id || post.name,
      raw_payload: {
        id: post.id,
        name: post.name,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author,
        subreddit: post.subreddit,
        subreddit_name_prefixed: post.subreddit_name_prefixed,
        permalink: post.permalink,
        url: post.url,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        link_flair_text: post.link_flair_text,
        is_self: post.is_self,
        post_hint: post.post_hint,
      },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
