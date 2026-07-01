/**
 * Verify Page POM — Email token verification
 *
 * Page: /sign-up/{sessionId}/verify?token=...
 * Component: VerifyPage.tsx
 *
 * States: verifying | success | already-verified | error
 *
 * Usage:
 *   pom.verify_page.success.$()
 *   pom.verify_page._.continue_button.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  verify_page: context({
    // All states share these keys (conditionally rendered)
    status_message: key(),     // verifying state
    page_title: key(),         // success / already-verified / error
    page_message: key(),       // success / already-verified / error
    continue_button: key(),    // success / already-verified
    resend_button: key(),      // error
  }),
});
