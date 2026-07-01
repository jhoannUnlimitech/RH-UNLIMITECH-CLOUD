/**
 * General Info Page POM — Lead Form (Form 1)
 *
 * Page: /sign-up/{sessionId}/general-info
 * Component: GeneralInfoPage.tsx
 *
 * Usage:
 *   pom.lead_form.ready.$()
 *   pom.lead_form._.name_section._.first_name_input.$()
 *   pom.lead_form._.phone_section._.phone_input.$(' .react-international-phone-country-selector-button')
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  lead_form: context({
    name_section: context({
      first_name_input: key(),
      first_name_error: key(),
      last_name_input: key(),
      last_name_error: key(),
    }),
    email_section: context({
      email_input: key(),
      email_error: key(),
    }),
    company_name_section: context({
      company_name_input: key(),
      company_name_error: key(),
    }),
    phone_section: context({
      phone_type_select: key(),  // <select> for Phone Type (Cell/Mobile, Company, Home)
      phone_input: key(),   // wrapper div — use .$('css') for internal elements
      phone_error: key(),
    }),
    address_section: context({
      street_input: key(),
      street_error: key(),
      address_line2_input: key(),
      city_input: key(),
      city_error: key(),
      zip_input: key(),
      zip_error: key(),
      country_select: key(),
      country_error: key(),
      state_select: key(),
    }),
    referral_section: context({
      referral_input: key(),
    }),
    submit_button: key(),
    loading_message: key(),
  }),
});
