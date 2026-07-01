/**
 * Thank You Page POM — Email verification prompt (after registration submit)
 *
 * Page: /sign-up/{sessionId}/thank-you
 * Component: ThankYouPage.tsx
 *
 * Usage:
 *   pom.thank_you_page.ready.$()
 *   pom.thank_you_page._.resend_button.ready.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  thank_you_page: context({
    page_title: key(),
    page_subtitle: key(),
    spam_note: key(),
    resend_success: key(),
    resend_button: key(),
  }),
});
