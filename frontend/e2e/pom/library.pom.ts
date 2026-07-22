import { createPom, context, key } from './selector-engine';

/**
 * POM — Library module (Categorías + Documentos + Vista Empleado)
 *
 * Covers:
 *   /library           — Vista empleado (featured slider, docs, search, pagination)
 *   /library/manage    — Admin panel (sidebar, grid/list, filters)
 *   /library/categories — Categories CRUD (table, filters, pagination, modals)
 *   /library/documents/new | edit/:slug — Document form (editor dual)
 *   /library/documents/:slug — Document view (read-only)
 */

export const pom = createPom({
  // ─── Library Employee Page (/library) ──────────────────────────────
  library_page: context({
    search_input: key(),
    type_filter: key(),
    featured_section: context({
      // featured-{slug} keys are dynamic
    }),
    documents_list: context({
      // doc-{slug} keys are dynamic
    }),
  }),

  // ─── Library Manage Page (/library/manage) ─────────────────────────
  library_manage_page: context({
    categories_sidebar: context({
      manage_categories_btn: key(),
      all_categories_btn: key(),
      category_tree: context({}),
    }),
    documents_panel: context({
      panel_title: key(),
      create_document_btn: key(),
      documents_filters: context({
        search_input: key(),
        type_filter: key(),
        view_toggle: key(),
      }),
      documents_grid: context({}),
      documents_table: context({}),
      empty_state: key(),
    }),
  }),

  // ─── Library Categories Page (/library/categories) ─────────────────
  library_categories_page: context({
    create_category_btn: key(),
    categories_filters: context({
      search_input: key(),
      status_filter: key(),
      items_per_page: key(),
    }),
    categories_table: context({}),
  }),

  // ─── Category Form Modal ───────────────────────────────────────────
  category_form_modal: context({
    name_input: key(),
    description_input: key(),
    color_input: key(),
    icon_picker: context({}),
    parent_select: key(),
    cancel_btn: key(),
    submit_btn: key(),
  }),

  // ─── Hard Delete Modal ─────────────────────────────────────────────
  hard_delete_modal: context({
    confirm_name_input: key(),
  }),

  // ─── Document Form Page (/library/documents/new | edit/:slug) ──────
  document_form_page: context({
    title_field: context({
      title_input: key(),
    }),
    description_field: context({
      description_input: key(),
    }),
    category_field: context({
      category_select: key(),
    }),
    type_field: context({
      type_select: key(),
    }),
    tags_field: context({
      tag_input: key(),
      add_tag_btn: key(),
    }),
    featured_field: context({
      featured_toggle: key(),
    }),
    link_field: context({
      link_input: key(),
    }),
    content_field: context({
      document_editor: context({
        editor_mode_toggle: context({
          visual_label: key(),
          markdown_label: key(),
        }),
        visual_editor: context({}),
        markdown_editor: context({
          markdown_textarea: key(),
          markdown_preview: key(),
        }),
      }),
    }),
    change_note_field: context({
      change_note_input: key(),
    }),
    form_actions: context({
      cancel_btn: key(),
      save_draft_btn: key(),
      publish_btn: key(),
    }),
  }),

  // ─── Document View Page (/library/documents/:slug) ─────────────────
  document_view_page: context({
    back_to_library: key(),
    document_header: context({
      category_badge: key(),
      status_badge: key(),
      doc_title: key(),
      doc_description: key(),
      document_meta: context({
        author: key(),
        version: key(),
        views: key(),
        date: key(),
      }),
      tags: key(),
    }),
    external_link: key(),
    file_attachment: key(),
    document_content: context({
      markdown_content: key(),
    }),
  }),
});
