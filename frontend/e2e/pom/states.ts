/**
 * Known UI test states — Single source of truth.
 *
 * Vocabulary of valid values for `data-test-state` attributes.
 * Both the TypeScript type and the runtime Set are derived from this array.
 *
 * To add a new state: add it to KNOWN_STATES_LIST. That's it.
 */

export const KNOWN_STATES_LIST = [
  // Loading
  'loading', 'ready', 'submitting',
  // Validation
  'error', 'normal', 'valid', 'invalid',
  // Visibility
  'visible', 'hidden',
  // Authentication
  'authenticated', 'unauthenticated',
  // Data
  'loaded', 'empty',
  // Interaction
  'active', 'inactive', 'disabled',
  // Process
  'pending', 'completed', 'failed',
] as const;

/** Union type of all known states (derived from the array) */
export type KnownState = (typeof KNOWN_STATES_LIST)[number];

/** Runtime Set for proxy lookups (derived from the array) */
export const KNOWN_STATES: ReadonlySet<string> = new Set(KNOWN_STATES_LIST);
