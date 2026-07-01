/**
 * CSW POM — Page Object Model for the CSW (Solicitudes) module.
 *
 * Covers:
 * - CSW List (/csw/my-requests, /csw/pending, /csw/all)
 * - CSW Form (/csw/new, /csw/edit/:id)
 * - CSW View (/csw/view/:id)
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  // === CSW List Page ===
  csw_list: context({
    page_title: key(),
    csw_controls: context({
      search_input: key(),
      status_filter: key(),
      category_filter: key(),
      create_button: key(),
      clear_filters_button: key(),
    }),
    csw_table: context({
      table_header: context({
        header_row: key(),
      }),
      table_body: context({
        empty_state: key(),
        csw_row: key({ indexed: true, children: {
          number_cell: key(),
          requester_cell: key(),
          category_cell: key(),
          status_cell: key(),
          date_cell: key(),
          progress_cell: key(),
          view_button: key(),
          edit_button: key(),
          cancel_button: key(),
          delete_button: key(),
        }}),
      }),
    }),
    pagination: context({
      prev_button: key(),
      next_button: key(),
      page_info: key(),
    }),
  }),

  // === CSW Form Page ===
  csw_form: context({
    form_title: key(),
    status_badge: key(),
    autosave_indicator: key(),
    error_alert: key(),
    rejection_banner: context({
      rejection_reason: key(),
      rejection_by: key(),
      rejection_date: key(),
    }),
    category_field: context({
      category_select: key(),
      category_error: key(),
    }),
    situation_field: context({
      situation_textarea: key(),
      situation_word_count: key(),
      situation_error: key(),
    }),
    information_field: context({
      information_textarea: key(),
      information_word_count: key(),
      information_error: key(),
    }),
    solution_field: context({
      solution_textarea: key(),
      solution_word_count: key(),
      solution_error: key(),
    }),
    form_actions: context({
      cancel_button: key(),
      save_draft_button: key(),
      submit_button: key(),
      update_button: key(),
    }),
  }),

  // === CSW View Page ===
  csw_view: context({
    csw_title: key(),
    status_badge: key(),
    requester_info: context({
      requester_name: key(),
      requester_position: key(),
      requester_division: key(),
    }),
    csw_content: context({
      category_value: key(),
      situation_text: key(),
      information_text: key(),
      solution_text: key(),
    }),
    approval_chain: context({
      approval_level: key({ indexed: true, children: {
        approver_name: key(),
        approver_position: key(),
        approval_status: key(),
        approval_comments: key(),
        approval_date: key(),
      }}),
    }),
    approval_actions: context({
      comments_textarea: key(),
      approve_button: key(),
      reject_button: key(),
    }),
    action_history: context({
      history_entry: key({ indexed: true, children: {
        history_action: key(),
        history_by: key(),
        history_comments: key(),
        history_date: key(),
      }}),
    }),
  }),
});
