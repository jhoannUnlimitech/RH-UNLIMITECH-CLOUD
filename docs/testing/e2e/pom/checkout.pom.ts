/**
 * Checkout Page POM — Stripe checkout transition page
 *
 * Page: /sign-up/{sessionId}/checkout
 * Component: CheckoutPage.tsx
 *
 * States: preparing | error
 *
 * Usage:
 *   pom.checkout_page.preparing.$()
 *   pom.checkout_page.error.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  checkout_page: context({
    // Preparing state
    status_message: key(),

    // Error state
    error_title: key(),
    error_message: key(),
    retry_button: key(),
  }),
});
