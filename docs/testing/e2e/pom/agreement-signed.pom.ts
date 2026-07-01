/**
 * Agreement Signed Page POM — Post-agreement confirmation
 *
 * Page: /sign-up/{sessionId}/agreement-signed
 * Component: AgreementSignedPage.tsx
 *
 * Usage:
 *   pom.agreement_signed_page.ready.$()
 *   pom.agreement_signed_page._.continue_button.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  agreement_signed_page: context({
    page_title: key(),
    page_subtitle: key(),
    next_step_info: context({
      next_step_message: key(),
      next_step_hint: key(),
    }),
    continue_button: key(),
  }),
});
