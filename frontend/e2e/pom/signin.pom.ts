/**
 * SignIn POM — Page Object Model for the login page.
 *
 * Mirrors the data-test-context / data-test-key hierarchy of SignInForm.tsx:
 *
 * signin-page (context)
 * ├── [key] page-title
 * └── login-form (context) [state: ready | loading]
 *     ├── [key] error-message [state: visible]
 *     └── login-inputs (context)
 *         ├── [key] email-input [state: error | normal]
 *         ├── [key] password-input [state: error | normal]
 *         ├── [key] show-password-toggle
 *         ├── [key] forgot-password-link
 *         └── [key] submit-button [state: ready | loading]
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  signin_page: context({
    page_title: key(),
    login_form: context({
      error_message: key(),
      login_inputs: context({
        email_input: key(),
        password_input: key(),
        show_password_toggle: key(),
        forgot_password_link: key(),
        submit_button: key(),
      }),
    }),
  }),
});
