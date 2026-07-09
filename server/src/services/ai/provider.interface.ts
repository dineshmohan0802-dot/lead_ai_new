import { SentimentResult, IntentResult, OutreachResult } from '../../types';

/**
 * Common interface for all AI providers (Gemini, OpenRouter, etc.)
 * Each provider implements this contract for the 4 core AI tasks.
 */
export interface AIProvider {
  readonly name: string;

  /** Generate a short summary of the signal text */
  summarize(input: string): Promise<string>;

  /** Analyze sentiment of the text — returns label + numeric score */
  analyzeSentiment(input: string): Promise<SentimentResult>;

  /** Score buying/lead intent — returns 0-100 score + label + reasoning */
  scoreIntent(
    input: string,
    context?: {
      keywords?: string[];
      competitors?: string[];
      source?: string;
    }
  ): Promise<IntentResult>;

  /** Generate outreach opener + full message draft */
  generateOutreach(input: {
    signalText: string;
    source: string;
    authorName?: string;
    companyName?: string;
    intentReason?: string;
    tone?: string;
  }): Promise<OutreachResult>;
}

/**
 * Provider configuration
 */
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}
