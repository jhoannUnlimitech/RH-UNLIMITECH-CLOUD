/**
 * Employees POM — Page Object Model for /employees page.
 *
 * Hierarchy:
 * employees-list (context) [state: loading | loaded]
 * ├── [key] page-title
 * ├── employees-controls (context)
 * │   ├── [key] create-employee-button
 * │   ├── [key] search-input
 * │   └── [key] division-filter
 * ├── employees-table (context)
 * │   ├── table-header (context)
 * │   │   └── [key] header-row
 * │   └── table-body (context)
 * │       └── employee-row (key, indexed)
 * │           ├── [key] name-cell
 * │           ├── [key] email-cell
 * │           ├── [key] hat-cell
 * │           ├── [key] division-cell
 * │           ├── [key] status-cell
 * │           ├── [key] view-button
 * │           ├── [key] edit-button
 * │           ├── [key] suspend-button
 * │           └── [key] delete-button
 * ├── employee-form-modal (context)
 * │   ├── [key] modal-title
 * │   ├── [key] name-input
 * │   ├── [key] email-input
 * │   ├── [key] password-input
 * │   ├── [key] generate-password-button
 * │   ├── [key] password-strength
 * │   ├── [key] phone-input
 * │   ├── [key] national-id-input
 * │   ├── [key] nationality-select
 * │   ├── [key] birth-date-input
 * │   ├── [key] hat-select
 * │   ├── [key] division-select
 * │   ├── [key] manager-select
 * │   ├── [key] tech-lead-select
 * │   ├── [key] force-password-checkbox
 * │   ├── [key] approve-csw-checkbox
 * │   ├── [key] status-switch
 * │   ├── [key] modal-cancel-button
 * │   └── [key] modal-submit-button
 * ├── employee-view-modal (context)
 * │   ├── [key] view-name
 * │   ├── [key] view-email
 * │   ├── [key] view-phone
 * │   ├── [key] view-hat
 * │   ├── [key] view-division
 * │   ├── [key] view-national-id
 * │   ├── [key] view-nationality
 * │   ├── [key] view-birth-date
 * │   ├── [key] view-status
 * │   └── [key] view-close-button
 * └── employee-delete-modal (context)
 *     ├── [key] delete-employee-name
 *     ├── [key] delete-confirm-button
 *     └── [key] delete-cancel-button
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  employees_list: context({
    page_title: key(),
    employees_controls: context({
      create_employee_button: key(),
      search_input: key(),
      division_filter: key(),
    }),
    employees_table: context({
      table_header: context({
        header_row: key(),
      }),
      table_body: context({
        employee_row: key({ indexed: true, children: {
          name_cell: key(),
          email_cell: key(),
          hat_cell: key(),
          division_cell: key(),
          status_cell: key(),
          view_button: key(),
          edit_button: key(),
          suspend_button: key(),
          delete_button: key(),
        }}),
      }),
    }),
    employee_form_modal: context({
      modal_title: key(),
      name_input: key(),
      email_input: key(),
      password_input: key(),
      generate_password_button: key(),
      password_strength: key(),
      phone_input: key(),
      national_id_input: key(),
      nationality_select: key(),
      birth_date_input: key(),
      hat_select: key(),
      division_select: key(),
      manager_select: key(),
      tech_lead_select: key(),
      force_password_checkbox: key(),
      approve_csw_checkbox: key(),
      status_switch: key(),
      modal_cancel_button: key(),
      modal_submit_button: key(),
    }),
    employee_view_modal: context({
      view_name: key(),
      view_email: key(),
      view_phone: key(),
      view_hat: key(),
      view_division: key(),
      view_national_id: key(),
      view_nationality: key(),
      view_birth_date: key(),
      view_status: key(),
      view_close_button: key(),
    }),
    employee_delete_modal: context({
      delete_employee_name: key(),
      delete_confirm_button: key(),
      delete_cancel_button: key(),
    }),
  }),
});
