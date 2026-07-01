/**
 * Header POM — App Header with Language Selector
 *
 * Component: AppHeader.tsx + LanguageSelector.tsx
 * Location: Sticky header across all enrollment pages
 *
 * Usage:
 *   pom.app_header._.language_selector.active.$()
 *   pom.app_header._.language_selector._.language_trigger_button.$()
 *   pom.app_header._.language_selector._.language_dropdown._.language_option_en_us.$()
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  app_header: context({
    logo_link: key(),
    language_selector: context({
      language_trigger_button: key(),
      language_dropdown: context({
        language_search_input: key(),
        language_option_en_us: key(),
        language_option_es_co: key(),
      }),
    }),
  }),
});
