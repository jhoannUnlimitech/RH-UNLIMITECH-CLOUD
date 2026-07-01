/**
 * Completed Page POM — Enrollment completion (after agreement signing)
 *
 * Page: /sign-up/{sessionId}/completed
 * Component: CompletedPage.tsx
 *
 * Usage:
 *   pom.completed_page.ready.$()
 *   pom.completed_page._.page_title.$()
 *   pom.completed_page._.confirmation_details._.payment_confirmed_message.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  completed_page: context({
    page_title: key(),
    page_subtitle: key(),
    confirmation_details: context({
      payment_confirmed_message: key(),
      agreement_signed_message: key(),
      email_sent_message: key(),
    }),
    footer_message: key(),
  }),
});
