/**
 * Agreement Page POM — Embedded document signing (Zoho Sign)
 *
 * Page: /sign-up/{sessionId}/agreement
 * Component: AgreementPage.tsx
 *
 * The signing iframe is from an external domain (Zoho Sign).
 * We can only annotate our wrapper — the iframe content is not controllable.
 *
 * Usage:
 *   pom.agreement_page.ready.$()
 *   pom.agreement_page._.signing_iframe.$()
 *   pom.agreement_page._.signing_container.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  agreement_page: context({
    page_title: key(),
    page_subtitle: key(),
    signing_container: key(),   // wrapper div around the iframe
    signing_iframe: key(),      // the iframe element itself
    loading_message: key(),
    error_message: key(),
  }),
});
