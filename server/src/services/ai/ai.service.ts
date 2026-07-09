import { AIProvider } from './provider.interface';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';
import { env } from '../../config/env';
import { SentimentResult, IntentResult, OutreachResult, EnrichmentResult } from '../../types';

/**
 * AI Service — orchestrates provider selection with fallback logic.
 * 
 * Priority:
 * 1. Use preferred provider from settings/env
 * 2. Fallback to alternate provider if primary fails
 * 3. Log which model was used for each request
 */
export class AIService {
  private providers: AIProvider[] = [];
  private preferredProvider: string | null = null;

  constructor(preferred?: string) {
    this.preferredProvider = preferred || null;

    // Initialize available providers
    if (env.GEMINI_API_KEY) {
      this.providers.push(
        new GeminiProvider({ apiKey: env.GEMINI_API_KEY })
      );
    }

    if (env.OPENROUTER_API_KEY) {
      this.providers.push(
        new OpenRouterProvider({
          apiKey: env.OPENROUTER_API_KEY,
          model: env.OPENROUTER_MODEL,
        })
      );
    }

    // Sort so preferred is first
    if (this.preferredProvider) {
      this.providers.sort((a, b) => {
        if (a.name === this.preferredProvider) return -1;
        if (b.name === this.preferredProvider) return 1;
        return 0;
      });
    }

    console.log(
      `🤖 AI Service initialized with providers: ${this.providers.map((p) => p.name).join(', ') || 'none'}`
    );
  }

  get isAvailable(): boolean {
    return this.providers.length > 0;
  }

  private async withFallback<T>(
    operation: string,
    fn: (provider: AIProvider) => Promise<T>
  ): Promise<{ result: T; provider: string }> {
    if (this.providers.length === 0) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.');
    }

    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        const result = await fn(provider);
        console.log(`✅ AI ${operation} completed via ${provider.name}`);
        return { result, provider: provider.name };
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️  AI ${operation} failed with ${provider.name}: ${lastError.message}`);
      }
    }

    throw new Error(
      `All AI providers failed for ${operation}. Last error: ${lastError?.message}`
    );
  }

  async summarize(text: string): Promise<{ summary: string; provider: string }> {
    const { result, provider } = await this.withFallback('summarize', (p) =>
      p.summarize(text)
    );
    return { summary: result, provider };
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: SentimentResult; provider: string }> {
    const { result, provider } = await this.withFallback('sentiment', (p) =>
      p.analyzeSentiment(text)
    );
    return { sentiment: result, provider };
  }

  async scoreIntent(
    text: string,
    context?: { keywords?: string[]; competitors?: string[]; source?: string }
  ): Promise<{ intent: IntentResult; provider: string }> {
    const { result, provider } = await this.withFallback('intent', (p) =>
      p.scoreIntent(text, context)
    );
    return { intent: result, provider };
  }

  async generateOutreach(input: {
    signalText: string;
    source: string;
    authorName?: string;
    companyName?: string;
    intentReason?: string;
    tone?: string;
  }): Promise<{ outreach: OutreachResult; provider: string }> {
    const { result, provider } = await this.withFallback('outreach', (p) =>
      p.generateOutreach(input)
    );
    return { outreach: result, provider };
  }

  /**
   * Run full enrichment pipeline for a signal
   */
  async enrichSignal(
    text: string,
    context: {
      keywords?: string[];
      competitors?: string[];
      source?: string;
      authorName?: string;
      companyName?: string;
      tone?: string;
    }
  ): Promise<EnrichmentResult> {
    // Run sentiment + intent + summary in parallel
    const [sentimentRes, intentRes, summaryRes] = await Promise.all([
      this.analyzeSentiment(text),
      this.scoreIntent(text, {
        keywords: context.keywords,
        competitors: context.competitors,
        source: context.source,
      }),
      this.summarize(text),
    ]);

    // Only generate outreach for medium+ intent
    let outreach = { opener: '', message: '' };
    let outreachProvider = sentimentRes.provider;

    if (intentRes.intent.score >= 40) {
      const outreachRes = await this.generateOutreach({
        signalText: text,
        source: context.source || 'unknown',
        authorName: context.authorName,
        companyName: context.companyName,
        intentReason: intentRes.intent.reasoning,
        tone: context.tone,
      });
      outreach = outreachRes.outreach;
      outreachProvider = outreachRes.provider;
    }

    return {
      sentiment: sentimentRes.sentiment,
      intent: intentRes.intent,
      summary: summaryRes.summary,
      outreach,
      model_used: sentimentRes.provider, // primary provider used
    };
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(preferred?: string): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(preferred);
  }
  return aiServiceInstance;
}
