import { AIProvider, AIProviderConfig } from './provider.interface';
import { SentimentResult, IntentResult, OutreachResult } from '../../types';
import {
  SENTIMENT_PROMPT,
  INTENT_PROMPT,
  SUMMARY_PROMPT,
  OUTREACH_PROMPT,
} from './prompts';

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';
  private apiKey: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'google/gemma-2-9b-it:free';
  }

  private async generate(prompt: string): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://leadpulse.app',
        'X-Title': 'LeadPulse',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${error}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private parseJSON<T>(text: string): T {
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
