import { SourceAdapter } from '../source.interface';
import { RawEvent, SourceConfig } from '../../../types';

/**
 * LinkedIn source adapter — MOCK implementation for MVP.
 * Returns realistic sample data mimicking LinkedIn posts.
 * 
 * TODO Phase 2: Integrate with Apify LinkedIn scraper, Phantombuster,
 * or LinkedIn API (requires partner approval)
 */
export class LinkedInAdapter implements SourceAdapter {
  readonly sourceName = 'linkedin' as const;

  isAvailable(): boolean {
    return true; // Mock is always available
  }

  async fetchSignals(config: SourceConfig): Promise<RawEvent[]> {
    console.log('💼 LinkedIn: using mock data (Phase 1 MVP)');

    const mockPosts = this.generateMockPosts(config.keywords, config.competitors);
    return mockPosts;
  }

  private generateMockPosts(keywords: string[], competitors: string[]): RawEvent[] {
    const templates = [
      {
        text: `After 6 months with ${competitors[0] || 'ZoomInfo'}, we're looking for alternatives. The data decay rate is too high for our ${keywords[0] || 'lead generation'} needs. Any suggestions from the community?`,
        author: 'David Kim',
        headline: 'VP of Sales at TechFlow',
        company: 'TechFlow',
      },
      {
        text: `Excited to share that we've been exploring new approaches to ${keywords[0] || 'intent data'} and ${keywords[1] || 'sales prospecting'}. The traditional tools just aren't cutting it anymore. Who's building the next generation of B2B intelligence?`,
        author: 'Rachel Torres',
        headline: 'Head of Growth at ScaleUp AI',
        company: 'ScaleUp AI',
      },
      {
        text: `Unpopular opinion: Most ${keywords[0] || 'lead generation'} tools are solving yesterday's problems. We need smarter signals, not bigger databases. What do you think?`,
        author: 'James O\'Brien',
        headline: 'CEO at Cloudbridge Solutions',
        company: 'Cloudbridge Solutions',
      },
      {
        text: `Our team just evaluated ${competitors[1] || 'Apollo'}, ${competitors[2] || 'Clay'}, and a few others for our ${keywords[0] || 'sales prospecting'} stack. Honestly? None of them fully solved our pain points. Open to recommendations!`,
        author: 'Priya Sharma',
        headline: 'RevOps Director at DataSync',
        company: 'DataSync',
      },
    ];

    return templates.map((post, i) => ({
      workspace_id: '',
      source_name: 'linkedin' as const,
      external_id: `li_mock_${Date.now()}_${i}`,
      raw_payload: {
        id: `li_mock_${Date.now()}_${i}`,
        text: post.text,
        author_name: post.author,
        author_headline: post.headline,
        author_company: post.company,
        created_at: new Date(Date.now() - i * 7200000).toISOString(),
        reaction_count: Math.floor(Math.random() * 150),
        comment_count: Math.floor(Math.random() * 40),
        share_count: Math.floor(Math.random() * 15),
      },
    }));
  }
}
