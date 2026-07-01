/**
 * CSW Categories POM — Page Object Model for /csw-categories page.
 *
 * Hierarchy:
 * csw-categories-list (context)
 * ├── [key] page-title
 * ├── [key] create-category-button
 * ├── [key] search-input
 * ├── csw-categories-table (context)
 * │   ├── table-header (context)
 * │   │   └── [key] header-row
 * │   └── table-body (context)
 * │       └── category-row (key, indexed)
 * │           ├── [key] order-cell
 * │           ├── [key] name-cell
 * │           ├── [key] description-cell
 * │           ├── [key] status-cell
 * │           ├── [key] edit-button
 * │           └── [key] delete-button
 * └── csw-category-form-modal (context)
 *     ├── [key] modal-title
 *     ├── [key] category-name-input
 *     ├── [key] category-description-input
 *     ├── [key] use-default-flow-checkbox
 *     ├── [key] direct-approver-select
 *     ├── [key] modal-cancel-button
 *     └── [key] modal-submit-button
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  csw_categories_list: context({
    page_title: key(),
    create_category_button: key(),
    search_input: key(),
    csw_categories_table: context({
      table_header: context({
        header_row: key(),
      }),
      table_body: context({
        category_row: key({ indexed: true, children: {
          order_cell: key(),
          name_cell: key(),
          description_cell: key(),
          status_cell: key(),
          edit_button: key(),
          delete_button: key(),
        }}),
      }),
    }),
    csw_category_form_modal: context({
      modal_title: key(),
      category_name_input: key(),
      category_description_input: key(),
      use_default_flow_checkbox: key(),
      direct_approver_select: key(),
      modal_cancel_button: key(),
      modal_submit_button: key(),
    }),
  }),
});
