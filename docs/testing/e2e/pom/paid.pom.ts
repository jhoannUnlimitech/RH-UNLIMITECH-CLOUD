/**
 * Paid Page POM — Payment verification & final confirmation
 *
 * Page: /sign-up/{sessionId}/paid
 * Component: PaidPage.tsx
 *
 * States: verifying | processing | ready | timeout | error
 *
 * In the v2 flow, paid is the FINAL step. The "ready" state shows
 * a welcome message with confirmation details (no continue button).
 *
 * Usage:
 *   pom.payment_success.ready.$()
 *   pom.payment_success.verifying.$()
 *   pom.payment_success._.page_title.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  payment_success: context({
    // Verifying / Processing state
    status_message: key(),

    // Paid (ready) state — final step (v2)
    page_title: key(),
    page_subtitle: key(),
    confirmation_details: context({
      agreement_confirmed: key(),
      payment_confirmed: key(),
      email_sent: key(),
    }),
    footer_message: key(),

    // Legacy (v1 flow — kept for backward compatibility)
    continue_button: key(),
    next_step_message: key(),
    loading_message: key(),

    // Timeout state
    timeout_message: key(),
    retry_button: key(),

    // Error state
    error_message: key(),
  }),
});
