import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIProviderConfig } from './provider.interface';
import { SentimentResult, IntentResult, OutreachResult } from '../../types';
import {
  SENTIMENT_PROMPT,
  INTENT_PROMPT,
  SUMMARY_PROMPT,
  OUTREACH_PROMPT,
} from './prompts';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-2.0-flash';
  }

  private async generate(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  private parseJSON<T>(text: string): T {
    // Strip markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleaned);
  }

  async summarize(input: string): Promise<string> {
    const result = await this.generate(SUMMARY_PROMPT(input));
    return result.trim();
  }

  async analyzeSentiment(input: string): Promise<SentimentResult> {
    const result = await this.generate(SENTIMENT_PROMPT(input));
    return this.parseJSON<SentimentResult>(result);
  }

  async scoreIntent(
    input: string,
    context?: { keywords?: string[]; competitors?: string[]; source?: string }
  ): Promise<IntentResult> {
    const result = await this.generate(INTENT_PROMPT(input, context));
    return this.parseJSON<IntentResult>(result);
  }

  async generateOutreach(input: {
    signalText: string;
    source: string;
    authorName?: string;
    companyName?: string;
    intentReason?: string;
    tone?: string;
  }): Promise<OutreachResult> {
    const result = await this.generate(OUTREACH_PROMPT(input));
    return this.parseJSON<OutreachResult>(result);
  }
}
