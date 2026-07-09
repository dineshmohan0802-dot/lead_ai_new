import { IntentLabel, NormalizedSignal } from '../../types';

/**
 * Hybrid intent scoring engine.
 * 
 * Phase 1: Deterministic rule-based scoring
 * Phase 2: Combined with LLM adjustment from AI service
 * 
 * The deterministic score provides a baseline that the LLM can adjust.
 */

interface ScoringInput {
  text: string;
  matched_keywords: string[];
  matched_competitors: string[];
  source: string;
  sentiment_score?: number;
}

interface ScoringResult {
  base_score: number;
  adjustments: { reason: string; delta: number }[];
  final_score: number;
  label: IntentLabel;
}

// High-intent phrase patterns
const HIGH_INTENT_PHRASES = [
  'looking for',
  'alternative to',
  'alternatives to',
  'recommend',
  'recommendation',
  'tool for',
  'need help with',
  'need a tool',
  'need software',
  'best tool',
  'best platform',
  'best software',
  'searching for',
  'want to switch',
  'switching from',
  'migrating from',
  'moving away from',
  'replacing',
  'replacement for',
  'compare',
  'comparison',
  'vs ',
  'versus',
  'which is better',
  'demo',
  'free trial',
  'pricing',
  'how much does',
  'budget for',
  'buy',
  'purchase',
  'implement',
  'integrate',
];

const COMPLAINT_PHRASES = [
  'frustrated',
  'disappointed',
  'terrible',
  'horrible',
  'worst',
  'hate',
  'broken',
  'doesn\'t work',
  'not working',
  'overpriced',
  'too expensive',
  'waste of money',
  'cancelling',
  'canceled',
  'unsubscribed',
  'regret',
  'avoid',
  'stay away',
];

const LOW_RELEVANCE_PHRASES = [
  'hiring',
  'job opening',
  'we\'re hiring',
  'internship',
  'intern',
  'student',
  'homework',
  'assignment',
  'course',
  'class project',
  'job seeker',
  'looking for work',
  'resume',
  'cv',
  'recruiter',
  'recruiting',
];

export function calculateDeterministicScore(input: ScoringInput): ScoringResult {
  const adjustments: { reason: string; delta: number }[] = [];
  let score = 10; // Base score for any monitored signal
  const textLower = input.text.toLowerCase();

  // ── Keyword matches ──
  if (input.matched_keywords.length > 0) {
    const delta = input.matched_keywords.length * 10;
    adjustments.push({
      reason: `Keyword match: ${input.matched_keywords.join(', ')}`,
      delta,
    });
    score += delta;
  }

  // ── Competitor mentions ──
  if (input.matched_competitors.length > 0) {
    const delta = input.matched_competitors.length * 15;
    adjustments.push({
      reason: `Competitor mention: ${input.matched_competitors.join(', ')}`,
      delta,
    });
    score += delta;
  }

  // ── High-intent phrases ──
  const matchedIntentPhrases = HIGH_INTENT_PHRASES.filter((phrase) =>
    textLower.includes(phrase)
  );
  if (matchedIntentPhrases.length > 0) {
    const delta = Math.min(matchedIntentPhrases.length * 20, 40);
    adjustments.push({
      reason: `High-intent phrases: "${matchedIntentPhrases.slice(0, 3).join('", "')}"`,
      delta,
    });
    score += delta;
  }

  // ── Complaint about competitor ──
  const hasCompetitorMention = input.matched_competitors.length > 0;
  const hasComplaint = COMPLAINT_PHRASES.some((phrase) => textLower.includes(phrase));
  if (hasCompetitorMention && hasComplaint) {
    adjustments.push({
      reason: 'Negative sentiment about competitor — high switching intent',
      delta: 20,
    });
    score += 20;
  }

  // ── Low-relevance detection ──
  const isLowRelevance = LOW_RELEVANCE_PHRASES.some((phrase) => textLower.includes(phrase));
  if (isLowRelevance) {
    adjustments.push({
      reason: 'Low-relevance context detected (job/student/recruiter)',
      delta: -30,
    });
    score -= 30;
  }

  // ── Sentiment adjustment ──
  if (input.sentiment_score !== undefined) {
    if (input.sentiment_score < -0.3 && hasCompetitorMention) {
      adjustments.push({
        reason: 'Negative sentiment + competitor = switching signal',
        delta: 10,
      });
      score += 10;
    }
  }

  // ── Text length bonus (longer = more context = more serious) ──
  if (input.text.length > 300) {
    adjustments.push({ reason: 'Detailed post (>300 chars)', delta: 5 });
    score += 5;
  }

  // Clamp to 0-100
  const finalScore = Math.max(0, Math.min(100, score));

  return {
    base_score: 10,
    adjustments,
    final_score: finalScore,
    label: scoreToLabel(finalScore),
  };
}

export function scoreToLabel(score: number): IntentLabel {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
