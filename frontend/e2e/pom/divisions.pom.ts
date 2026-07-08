/**
 * Divisions POM — Page Object Model for /divisions page.
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  divisions_list: context({
    page_title: key(),
    create_division_button: key(),
    search_input: key(),
    divisions_table: context({
      table_body: context({
        division_row: key({ indexed: true, children: {
          name_cell: key(),
          code_cell: key(),
          description_cell: key(),
          manager_cell: key(),
          view_button: key(),
          edit_button: key(),
          delete_button: key(),
        }}),
      }),
    }),
    division_form_modal: context({
      modal_title: key(),
      name_input: key(),
      code_input: key(),
      description_input: key(),
      manager_select: key(),
      modal_cancel_button: key(),
      modal_submit_button: key(),
    }),
    division_view_modal: context({
      view_name: key(),
      view_code: key(),
      view_description: key(),
      view_manager: key(),
      view_close_button: key(),
    }),
  }),
});
