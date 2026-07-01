/**
 * Profile POM — Page Object Model for /profile page.
 *
 * Hierarchy:
 * profile-page (context)
 * ├── profile-header (context)
 * │   ├── [key] profile-photo
 * │   ├── [key] profile-initials
 * │   ├── [key] profile-name
 * │   ├── [key] profile-role
 * │   ├── [key] profile-division
 * │   └── [key] edit-photo-button
 * ├── profile-info (context)
 * │   ├── [key] profile-email
 * │   ├── [key] profile-phone
 * │   ├── [key] profile-national-id
 * │   ├── [key] profile-nationality
 * │   ├── [key] profile-birth-date
 * │   ├── [key] profile-status
 * │   └── [key] edit-info-button
 * ├── profile-division-card (context)
 * │   ├── [key] division-name
 * │   ├── [key] division-description
 * │   └── [key] project-item (indexed)
 * ├── profile-security (context)
 * │   └── [key] change-password-button
 * ├── edit-info-modal (context)
 * │   ├── [key] edit-name-input
 * │   ├── [key] edit-phone-input
 * │   ├── [key] edit-national-id-input
 * │   ├── [key] edit-nationality-input
 * │   ├── [key] edit-birth-date-input
 * │   ├── [key] modal-cancel-button
 * │   └── [key] modal-save-button
 * └── change-password-modal (context)
 *     ├── [key] current-password-input
 *     ├── [key] new-password-input
 *     ├── [key] confirm-password-input
 *     ├── [key] password-strength
 *     ├── [key] error-message
 *     ├── [key] modal-cancel-button
 *     └── [key] modal-submit-button
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  profile_page: context({
    profile_header: context({
      profile_photo: key(),
      profile_initials: key(),
      profile_name: key(),
      profile_role: key(),
      profile_division: key(),
      edit_photo_button: key(),
    }),
    profile_info: context({
      profile_email: key(),
      profile_phone: key(),
      profile_national_id: key(),
      profile_nationality: key(),
      profile_birth_date: key(),
      profile_status: key(),
      edit_info_button: key(),
    }),
    profile_division_card: context({
      division_name: key(),
      division_description: key(),
      project_item: key({ indexed: true }),
    }),
    profile_security: context({
      change_password_button: key(),
    }),
    edit_info_modal: context({
      edit_name_input: key(),
      edit_phone_input: key(),
      edit_national_id_input: key(),
      edit_nationality_input: key(),
      edit_birth_date_input: key(),
      modal_cancel_button: key(),
      modal_save_button: key(),
    }),
    change_password_modal: context({
      current_password_input: key(),
      new_password_input: key(),
      confirm_password_input: key(),
      password_strength: key(),
      error_message: key(),
      modal_cancel_button: key(),
      modal_submit_button: key(),
    }),
  }),
});
