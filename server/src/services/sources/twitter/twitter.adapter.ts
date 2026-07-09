import { SourceAdapter } from '../source.interface';
import { RawEvent, SourceConfig } from '../../../types';

/**
 * Twitter/X source adapter — MOCK implementation for MVP.
 * Returns realistic sample data for demo purposes.
 * 
 * TODO Phase 2: Integrate with Twitter API v2 or Apify actor
 */
export class TwitterAdapter implements SourceAdapter {
  readonly sourceName = 'twitter' as const;

  isAvailable(): boolean {
    return true; // Mock is always available
  }

  async fetchSignals(config: SourceConfig): Promise<RawEvent[]> {
    console.log('🐦 Twitter: using mock data (Phase 1 MVP)');

    const mockTweets = this.generateMockTweets(config.keywords, config.competitors);
    return mockTweets;
  }

  private generateMockTweets(keywords: string[], competitors: string[]): RawEvent[] {
    const templates = [
      {
        text: `Anyone tried alternatives to ${competitors[0] || 'ZoomInfo'}? Their pricing is insane for a startup. Looking for something more affordable for ${keywords[0] || 'lead generation'}.`,
        author: 'sarahfounder',
        name: 'Sarah Chen',
      },
      {
        text: `Just switched from ${competitors[1] || 'Apollo'} to a new tool for ${keywords[0] || 'sales prospecting'}. The data quality difference is night and day. Happy to share more details.`,
        author: 'mikesales',
        name: 'Mike Rodriguez',
      },
      {
        text: `We need a better ${keywords[0] || 'intent data'} solution. Current tools are too expensive for Series A companies. Any recommendations? #B2B #SaaS`,
        author: 'amytech',
        name: 'Amy Thompson',
      },
      {
        text: `Hot take: ${competitors[0] || 'ZoomInfo'} is overrated. There are much better options out there for ${keywords[1] || 'B2B lead generation'}. Thread 🧵`,
        author: 'jakevc',
        name: 'Jake Williams',
      },
      {
        text: `Frustrated with ${competitors[2] || 'Clay'}'s complexity. Just want a simple tool for ${keywords[0] || 'lead generation'} without a PhD in data engineering. Is that too much to ask?`,
        author: 'lisaops',
        name: 'Lisa Park',
      },
    ];

    return templates.map((tweet, i) => ({
      workspace_id: '',
      source_name: 'twitter' as const,
      external_id: `tw_mock_${Date.now()}_${i}`,
      raw_payload: {
        id: `tw_mock_${Date.now()}_${i}`,
        text: tweet.text,
        author_username: tweet.author,
        author_name: tweet.name,
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        retweet_count: Math.floor(Math.random() * 50),
        like_count: Math.floor(Math.random() * 200),
        reply_count: Math.floor(Math.random() * 30),
        source: 'Twitter Web App',
      },
    }));
  }
}
