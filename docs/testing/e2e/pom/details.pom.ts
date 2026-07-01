/**
 * Details Page POM — Registration Form (Form 2)
 *
 * Page: /sign-up/{sessionId}/details
 * Component: DetailsPage.tsx
 *
 * Usage:
 *   pom.registration_form.ready.$()
 *   pom.registration_form._.position_section._.position_select.$()
 *   pom.registration_form._.alternate_phone_section._.alternate_phone_input.$(' input[type="tel"]')
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  registration_form: context({
    // Company details
    position_section: context({
      position_select: key(),
      position_error: key(),
    }),
    company_type_section: context({
      company_type_select: key(),
      company_type_other_input: key(),
      company_type_error: key(),
    }),
    industry_size_section: context({
      industry_select: key(),
      industry_error: key(),
      industry_other_input: key(),
    }),
    // Company Size (moved out of industry_size_section — now directly under form)
    company_size_select: key(),
    company_size_error: key(),
    website_section: context({
      no_website_checkbox: key(),
      company_website_0: key(),
      company_website_1: key(),
      company_website_2: key(),
      company_website_3: key(),
      company_website_4: key(),
      company_website_add_button: key(),
      company_website_remove_1: key(),
      company_website_remove_2: key(),
      company_website_remove_3: key(),
      company_website_remove_4: key(),
      company_website_max_message: key(),
    }),
    company_founded_section: context({
      company_founded_input: key(),
      company_founded_error: key(),
    }),

    // Billing address (conditional — visible when "same as company" unchecked)
    billing_address_section: context({
      same_as_company_checkbox: key(),
      billing_street_input: key(),
      billing_line2_input: key(),
      billing_city_input: key(),
      billing_zip_input: key(),
      billing_country_select: key(),
      billing_state_select: key(),
    }),

    // Shipping address (conditional — visible when "same as billing" unchecked)
    shipping_address_section: context({
      same_as_billing_checkbox: key(),
      shipping_street_input: key(),
      shipping_line2_input: key(),
      shipping_city_input: key(),
      shipping_zip_input: key(),
      shipping_country_select: key(),
      shipping_state_select: key(),
    }),

    // Alternate phone (PhoneInput third-party component)
    alternate_phone_section: context({
      alternate_phone_type_select: key(),  // <select> for Additional Phone Type
      alternate_phone_input: key(),  // wrapper div — use .$('css') for internals
    }),

    // Membership preferences — Radio groups
    // Context names auto-generated from fieldKey: dots→dashes + "-section"
    membership_preferences_prosperity_planner_section: context({
      radio_on_request: key(),
      radio_automatic: key(),
      radio_do_not_ship: key(),
      group_error: key(),
    }),
    membership_preferences_hca_booklets_section: context({
      radio_automatic: key(),
      radio_on_request: key(),
      radio_do_not_ship: key(),
      group_error: key(),
    }),

    // Membership preferences — Checkbox groups
    membership_preferences_interests_section: context({
      checkbox_mastertech_software: key(),
      checkbox_personnel_potential: key(),
      checkbox_hca_printed: key(),
      checkbox_hca_degrees: key(),
      checkbox_admin_knowhow: key(),
      checkbox_wise_directory_listing: key(),
      checkbox_wise_directory_consumer: key(),
      checkbox_none: key(),
      group_error: key(),
    }),
    membership_preferences_email_newsletters_section: context({
      checkbox_wise_wins: key(),
      checkbox_wise_news: key(),
      checkbox_church_events: key(),
      checkbox_hca_resources: key(),
      checkbox_mastertech_updates: key(),
      checkbox_none: key(),
      group_error: key(),
    }),

    // Personal profile
    personal_address_section: context({
      personal_same_as_company_checkbox: key(),
      personal_street_input: key(),
      personal_line2_input: key(),
      personal_city_input: key(),
      personal_zip_input: key(),
      personal_country_select: key(),
      personal_state_select: key(),
    }),

    // Profile photo upload
    profile_photo_section: context({
      profile_photo_input: key(),     // <input type="file" accept="image/jpeg,image/png">
      profile_photo_preview: key(),   // <div> with <img> thumbnail after upload
      profile_photo_remove: key(),    // <button> Remove (after upload)
      profile_photo_change: key(),    // <button> Change (remote state — page reload)
      profile_photo_uploaded: key(),  // <div> already uploaded state
      profile_photo_error: key(),     // <p> error message (type/size validation)
    }),

    birth_year_section: context({
      birth_year_input: key(),
      birth_year_error: key(),
    }),
    education_languages_section: context({
      // Only contains birth-year now (ADJ-07 moved education out)
    }),
    // Education is in its own section (full-width, separate from birth year)
    education_section: context({
      education_select: key(),
      education_error: key(),
      education_details_input: key(),
    }),
    // Languages are outside education_languages_section (separate grid div)
    preferred_language_select: key(),
    preferred_language_error: key(),
    secondary_language_select: key(),

    // Buttons
    back_button_top: key(),
    back_button: key(),
    submit_button: key(),
  }),
});
