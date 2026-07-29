/**
 * POM — Training Manage Page (/training/manage)
 *
 * Schema de anotaciones data-test-* de la página de gestión de Training.
 * Incluye las 4 tabs: Insignias, Niveles, Cursos, Exámenes.
 */

import { createPom, context, key } from './selector-engine';

export const pom = createPom({
  training_manage_page: context({
    // Tabs
    tab_badges: key(),
    tab_levels: key(),
    tab_courses: key(),
    tab_exams: key(),

    // Badges section
    badges_grid: context({
      create_badge_btn: key(),
    }),

    // Levels section
    levels_table: context({
      create_level_btn: key(),
    }),

    // Courses section
    courses_table: context({
      create_course_btn: key(),
    }),

    // Exams section
    exams_list: context({
      create_exam_btn: key(),
    }),
  }),

  // Badge Form Modal
  badge_form_modal: context({
    badge_name_input: key(),
    badge_description_input: key(),
    badge_color_input: key(),
    submit_btn: key(),
    cancel_btn: key(),
  }),

  // Level Form Modal
  level_form_modal: context({
    level_name_input: key(),
    level_badge_select: key(),
    level_order_input: key(),
    submit_btn: key(),
    cancel_btn: key(),
  }),

  // Course Form Modal
  course_form_modal: context({
    course_name_input: key(),
    course_description_input: key(),
    course_level_select: key(),
    course_hours_input: key(),
    course_order_input: key(),
    course_document_select: context({
      document_search_input: key(),
    }),
    submit_btn: key(),
    cancel_btn: key(),
  }),
});
