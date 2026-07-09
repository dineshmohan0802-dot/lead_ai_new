import { RawEvent, SourceConfig, SourceName } from '../../types';

/**
 * Common interface for all source adapters (Reddit, Twitter, LinkedIn).
 * Each adapter fetches raw data from its platform and returns RawEvent objects.
 */
export interface SourceAdapter {
  readonly sourceName: SourceName;

  /**
   * Fetch signals from the source based on keywords/config.
   * Returns raw events ready for normalization.
   */
  fetchSignals(config: SourceConfig): Promise<RawEvent[]>;

  /**
   * Check if this adapter is properly configured and ready.
   */
  isAvailable(): boolean;
}
